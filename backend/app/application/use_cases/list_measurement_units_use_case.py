"""List measurement units: all for admin dashboard; active for dropdowns."""

from typing import List

from app.domain.entities.measurement_unit import MeasurementUnit
from app.domain.repositories.measurement_unit_repository import MeasurementUnitRepository


class ListMeasurementUnitsUseCase:
    def __init__(self, repository: MeasurementUnitRepository):
        self.repository = repository

    def execute(self, active_only: bool = False) -> List[MeasurementUnit]:
        if active_only:
            return self.repository.list_active()
        return self.repository.list_all()
