"""List active measurement units for dropdowns and selection."""

from typing import List

from app.domain.entities.measurement_unit import MeasurementUnit
from app.domain.repositories.measurement_unit_repository import MeasurementUnitRepository


class ListMeasurementUnitsUseCase:
    def __init__(self, repository: MeasurementUnitRepository):
        self.repository = repository

    def execute(self) -> List[MeasurementUnit]:
        return self.repository.list_active()
