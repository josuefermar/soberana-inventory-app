from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.application.use_cases.list_measurement_units_use_case import (
    ListMeasurementUnitsUseCase,
)
from app.domain.entities.user_role import UserRole
from app.infrastructure.repositories.measurement_unit_repository_impl import (
    MeasurementUnitRepositoryImpl,
)
from app.presentation.dependencies.database import get_db
from app.presentation.dependencies.role_dependencies import require_roles
from app.presentation.schemas.measurement_unit_schema import MeasurementUnitResponse

router = APIRouter(prefix="/measurement-units", tags=["Measurement Units"])


@router.get("/", response_model=list[MeasurementUnitResponse])
def list_measurement_units(
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER])),
):
    repository = MeasurementUnitRepositoryImpl(db)
    use_case = ListMeasurementUnitsUseCase(repository)
    units = use_case.execute()
    return [
        MeasurementUnitResponse(
            id=u.id,
            name=u.name,
            description=u.description,
        )
        for u in units
    ]
