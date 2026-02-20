from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.application.use_cases.create_measurement_unit_use_case import (
    CreateMeasurementUnitUseCase,
)
from app.application.use_cases.list_measurement_units_use_case import (
    ListMeasurementUnitsUseCase,
)
from app.application.use_cases.toggle_measurement_unit_use_case import (
    ToggleMeasurementUnitUseCase,
)
from app.application.use_cases.update_measurement_unit_use_case import (
    UpdateMeasurementUnitUseCase,
)
from app.domain.entities.user_role import UserRole
from app.infrastructure.repositories.measurement_unit_repository_impl import (
    MeasurementUnitRepositoryImpl,
)
from app.presentation.dependencies.database import get_db
from app.presentation.dependencies.role_dependencies import require_roles
from app.presentation.schemas.measurement_unit_schema import (
    CreateMeasurementUnitRequest,
    MeasurementUnitResponse,
    UpdateMeasurementUnitRequest,
)

router = APIRouter(prefix="/measurement-units", tags=["Measurement Units"])


def _to_response(u) -> MeasurementUnitResponse:
    return MeasurementUnitResponse(
        id=u.id,
        name=u.name,
        abbreviation=u.abbreviation,
        is_active=u.is_active,
    )


@router.get("/", response_model=list[MeasurementUnitResponse])
def list_measurement_units(
    db: Session = Depends(get_db),
    active_only: bool = Query(False, description="If true, return only active units"),
    _current_user=Depends(require_roles([UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER])),
):
    repository = MeasurementUnitRepositoryImpl(db)
    use_case = ListMeasurementUnitsUseCase(repository)
    units = use_case.execute(active_only=active_only)
    return [_to_response(u) for u in units]


@router.post("/", response_model=MeasurementUnitResponse, status_code=201)
def create_measurement_unit(
    body: CreateMeasurementUnitRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    repository = MeasurementUnitRepositoryImpl(db)
    use_case = CreateMeasurementUnitUseCase(repository)
    unit = use_case.execute(
        name=body.name,
        abbreviation=body.abbreviation.strip().upper(),
    )
    return _to_response(unit)


@router.put("/{unit_id}", response_model=MeasurementUnitResponse)
def update_measurement_unit(
    unit_id: str,
    body: UpdateMeasurementUnitRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    repository = MeasurementUnitRepositoryImpl(db)
    use_case = UpdateMeasurementUnitUseCase(repository)
    unit = use_case.execute(
        id=UUID(unit_id),
        name=body.name,
        abbreviation=body.abbreviation.strip().upper(),
    )
    return _to_response(unit)


@router.patch("/{unit_id}/toggle", response_model=MeasurementUnitResponse)
def toggle_measurement_unit(
    unit_id: str,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    repository = MeasurementUnitRepositoryImpl(db)
    use_case = ToggleMeasurementUnitUseCase(repository)
    unit = use_case.execute(id=UUID(unit_id))
    return _to_response(unit)
