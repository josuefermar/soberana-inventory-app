from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.entities.measurement_unit import MeasurementUnit


class MeasurementUnitRepository(ABC):
    @abstractmethod
    def count(self) -> int:
        """Return total number of measurement units."""
        pass

    @abstractmethod
    def list_active(self) -> List[MeasurementUnit]:
        """Return all active measurement units (for selection/measures dropdown)."""
        pass

    @abstractmethod
    def get_by_name(self, name: str) -> Optional[MeasurementUnit]:
        pass

    @abstractmethod
    def save(self, unit: MeasurementUnit) -> MeasurementUnit:
        pass
