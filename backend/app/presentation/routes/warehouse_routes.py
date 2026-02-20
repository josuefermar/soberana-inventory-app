from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.application.use_cases.list_warehouses_use_case import ListWarehousesUseCase
from app.domain.entities.user_role import UserRole
from app.infrastructure.repositories.warehouse_repository_impl import (
    WarehouseRepositoryImpl,
)
from app.presentation.dependencies.database import get_db
from app.presentation.dependencies.role_dependencies import require_roles
from app.presentation.schemas.warehouse_schema import WarehouseResponse

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])


@router.get("/", response_model=list[WarehouseResponse])
def list_warehouses(
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER])),
):
    repository = WarehouseRepositoryImpl(db)
    use_case = ListWarehousesUseCase(repository)
    warehouses = use_case.execute()
    return [
        WarehouseResponse(
            id=w.id,
            code=w.code,
            description=w.description,
            status=w.status.value,
        )
        for w in warehouses
    ]
