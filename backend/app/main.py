from fastapi import FastAPI
from app.presentation.routes.inventory_session_routes import router as inventory_session_router
from app.presentation.exception_handlers import business_rule_exception_handler, not_found_exception_handler
from app.domain.exceptions.business_exceptions import BusinessRuleViolation, NotFoundException

app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.add_exception_handler(BusinessRuleViolation, business_rule_exception_handler)
app.add_exception_handler(NotFoundException, not_found_exception_handler)

app.include_router(inventory_session_router)
