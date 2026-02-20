import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI

from app.domain.exceptions.business_exceptions import BusinessRuleViolation, NotFoundException
from app.infrastructure.seeders.user_seeder import seed_users_if_empty
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
    if os.getenv("AUTO_SYNC_USERS", "").lower() == "true":
        await seed_users_if_empty()
    yield


app = FastAPI(
    title="Soberana API",
    description="Backend API for Soberana",
    lifespan=lifespan,
)


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


app.add_exception_handler(BusinessRuleViolation, business_rule_exception_handler)
app.add_exception_handler(NotFoundException, not_found_exception_handler)
app.add_middleware(LoggingMiddleware)  # type: ignore[arg-type]

app.include_router(auth_router)
app.include_router(inventory_session_router)
app.include_router(user_managment_router)
