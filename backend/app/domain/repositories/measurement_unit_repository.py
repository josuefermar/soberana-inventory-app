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
    def list_all(self) -> List[MeasurementUnit]:
        """Return all measurement units including inactive (for admin dashboard)."""
        pass

    @abstractmethod
    def get_by_id(self, id: UUID) -> Optional[MeasurementUnit]:
        """Return measurement unit by id or None."""
        pass

    @abstractmethod
    def get_by_ids(self, ids: List[UUID]) -> List[MeasurementUnit]:
        """Return measurement units for the given ids (order not guaranteed)."""
        pass

    @abstractmethod
    def get_by_name(self, name: str) -> Optional[MeasurementUnit]:
        """Return measurement unit by name or None."""
        pass

    @abstractmethod
    def get_by_abbreviation(self, abbreviation: str) -> Optional[MeasurementUnit]:
        """Return measurement unit by abbreviation or None."""
        pass

    @abstractmethod
    def save(self, unit: MeasurementUnit) -> MeasurementUnit:
        """Create a new measurement unit."""
        pass

    @abstractmethod
    def update(self, unit: MeasurementUnit) -> MeasurementUnit:
        """Update an existing measurement unit."""
        pass
