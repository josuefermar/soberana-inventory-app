import os
from contextlib import asynccontextmanager
from typing import cast

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.types import ExceptionHandler

from app.domain.exceptions.business_exceptions import BusinessRuleViolation, NotFoundException
from app.infrastructure.logging.logger import logger
from app.infrastructure.seeders.master_data_seeder import seed_master_data_if_empty
from app.infrastructure.seeders.user_seeder import (
    ensure_default_admin_exists,
    seed_users_if_empty,
)
from app.presentation.exception_handlers import (
    business_rule_exception_handler,
    not_found_exception_handler,
)
from app.presentation.middleware.logging_middleware import LoggingMiddleware
from app.presentation.routes.auth_routes import router as auth_router
from app.presentation.routes.inventory_session_routes import router as inventory_session_router
from app.presentation.routes.user_managment_routes import router as user_managment_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Migrations run at container start (Docker CMD: alembic upgrade head) before app
    logger.info(
        "Startup: migrations executed at container entrypoint",
        extra={"event": "migrations_executed"},
    )
    if os.getenv("AUTO_SEED_MASTER_DATA", "").lower() == "true":
        await seed_master_data_if_empty()
        logger.info(
            "Startup: master data seed step completed",
            extra={"event": "master_data_seed_step_completed"},
        )
    if os.getenv("AUTO_SYNC_USERS", "").lower() == "true":
        await seed_users_if_empty()
        logger.info(
            "Startup: users sync step completed",
            extra={"event": "users_sync_step_completed"},
        )
    await ensure_default_admin_exists()
    logger.info(
        "Startup: default admin ensured",
        extra={"event": "default_admin_ensured"},
    )
    yield


app = FastAPI(
    title="La Soberana API",
    description="Backend API for La Soberana",
    lifespan=lifespan,
)

# CORS: allow frontend (and other configured origins) to call the API
_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").strip()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


app.add_exception_handler(
    BusinessRuleViolation, cast(ExceptionHandler, business_rule_exception_handler)
)
app.add_exception_handler(
    NotFoundException, cast(ExceptionHandler, not_found_exception_handler)
)
app.add_middleware(LoggingMiddleware)  # type: ignore[arg-type]

app.include_router(auth_router)
app.include_router(inventory_session_router)
app.include_router(user_managment_router)
