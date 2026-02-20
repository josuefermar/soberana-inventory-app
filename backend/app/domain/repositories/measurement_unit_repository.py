from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.entities.measurement_unit import MeasurementUnit


class MeasurementUnitRepository(ABC):
    @abstractmethod
    def count(self) -> int:
        """Return total number of measurement units."""
        pass

    @abstractmethod
    def get_by_name(self, name: str) -> Optional[MeasurementUnit]:
        pass

    @abstractmethod
    def save(self, unit: MeasurementUnit) -> MeasurementUnit:
        pass
