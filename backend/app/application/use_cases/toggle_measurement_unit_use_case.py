"""Toggle measurement unit active status."""

from datetime import datetime, timezone
from uuid import UUID

from app.domain.entities.measurement_unit import MeasurementUnit
from app.domain.exceptions.business_exceptions import NotFoundException
from app.domain.repositories.measurement_unit_repository import MeasurementUnitRepository


class ToggleMeasurementUnitUseCase:
    def __init__(self, repository: MeasurementUnitRepository):
        self.repository = repository

    def execute(self, id: UUID) -> MeasurementUnit:
        existing = self.repository.get_by_id(id)
        if not existing:
            raise NotFoundException("Measurement unit not found.")
        now = datetime.now(timezone.utc)
        toggled = MeasurementUnit(
            id=existing.id,
            name=existing.name,
            abbreviation=existing.abbreviation,
            is_active=not existing.is_active,
            created_at=existing.created_at,
            updated_at=now,
        )
        return self.repository.update(toggled)
