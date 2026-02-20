from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.entities.warehouse import Warehouse


class WarehouseRepository(ABC):
    @abstractmethod
    def count(self) -> int:
        """Return total number of warehouses (e.g. to check if table is empty)."""
        pass

    @abstractmethod
    def get_by_id(self, warehouse_id: UUID) -> Optional[Warehouse]:
        """Return warehouse by id or None."""
        pass

    @abstractmethod
    def list_active(self) -> List[Warehouse]:
        """Return all active warehouses."""
        pass

    @abstractmethod
    def list_all(self) -> List[Warehouse]:
        """Return all warehouses (for admin listing/selection)."""
        pass

    @abstractmethod
    def save(self, warehouse: Warehouse) -> Warehouse:
        pass
