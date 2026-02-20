from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.infrastructure.database.database import SessionLocal
from app.infrastructure.repositories.inventory_session_repository_impl import (
    InventorySessionRepositoryImpl,
)
from app.application.use_cases.create_inventory_session_use_case import (
    CreateInventorySessionUseCase,
)
from app.presentation.schemas.inventory_session_schema import (
    CreateInventorySessionRequest,
    InventorySessionResponse,
)

router = APIRouter(prefix="/inventory-sessions", tags=["Inventory Sessions"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=InventorySessionResponse)
def create_inventory_session(
    request: CreateInventorySessionRequest,
    db: Session = Depends(get_db),
):
    repository = InventorySessionRepositoryImpl(db)
    use_case = CreateInventorySessionUseCase(repository)

    result = use_case.execute(
        warehouse_id=request.warehouse_id,
        month=request.month,
        count_number=request.count_number,
        created_by=request.created_by,
    )

    return result
