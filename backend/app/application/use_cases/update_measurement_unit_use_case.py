"""Update an existing measurement unit (name and/or abbreviation)."""

from datetime import datetime, timezone
from uuid import UUID

from app.domain.entities.measurement_unit import MeasurementUnit
from app.domain.exceptions.business_exceptions import (
    BusinessRuleViolation,
    NotFoundException,
)
from app.domain.repositories.measurement_unit_repository import MeasurementUnitRepository


class UpdateMeasurementUnitUseCase:
    def __init__(self, repository: MeasurementUnitRepository):
        self.repository = repository

    def execute(
        self,
        id: UUID,
        name: str,
        abbreviation: str,
    ) -> MeasurementUnit:
        name = (name or "").strip()
        abbreviation = (abbreviation or "").strip().upper()
        if not name:
            raise BusinessRuleViolation("Name is required.")
        if not abbreviation:
            raise BusinessRuleViolation("Abbreviation is required.")
        if len(abbreviation) > 10:
            raise BusinessRuleViolation("Abbreviation must be at most 10 characters.")
        existing = self.repository.get_by_id(id)
        if not existing:
            raise NotFoundException("Measurement unit not found.")
        by_name = self.repository.get_by_name(name)
        if by_name and by_name.id != id:
            raise BusinessRuleViolation("A measurement unit with this name already exists.")
        by_abbr = self.repository.get_by_abbreviation(abbreviation)
        if by_abbr and by_abbr.id != id:
            raise BusinessRuleViolation("A measurement unit with this abbreviation already exists.")
        now = datetime.now(timezone.utc)
        updated = MeasurementUnit(
            id=existing.id,
            name=name,
            abbreviation=abbreviation,
            is_active=existing.is_active,
            created_at=existing.created_at,
            updated_at=now,
        )
        return self.repository.update(updated)
