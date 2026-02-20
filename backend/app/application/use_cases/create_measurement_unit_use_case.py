"""Create a new measurement unit with name and abbreviation."""

from datetime import datetime, timezone
from uuid import uuid4

from app.domain.entities.measurement_unit import MeasurementUnit
from app.domain.exceptions.business_exceptions import BusinessRuleViolation
from app.domain.repositories.measurement_unit_repository import MeasurementUnitRepository


class CreateMeasurementUnitUseCase:
    def __init__(self, repository: MeasurementUnitRepository):
        self.repository = repository

    def execute(self, name: str, abbreviation: str) -> MeasurementUnit:
        name = (name or "").strip()
        abbreviation = (abbreviation or "").strip().upper()
        if not name:
            raise BusinessRuleViolation("Name is required.")
        if not abbreviation:
            raise BusinessRuleViolation("Abbreviation is required.")
        if len(abbreviation) > 10:
            raise BusinessRuleViolation("Abbreviation must be at most 10 characters.")
        if self.repository.get_by_name(name):
            raise BusinessRuleViolation("A measurement unit with this name already exists.")
        if self.repository.get_by_abbreviation(abbreviation):
            raise BusinessRuleViolation("A measurement unit with this abbreviation already exists.")
        now = datetime.now(timezone.utc)
        unit = MeasurementUnit(
            id=uuid4(),
            name=name,
            abbreviation=abbreviation,
            is_active=True,
            created_at=now,
            updated_at=now,
        )
        return self.repository.save(unit)
