from abc import ABC, abstractmethod

from app.domain.entities.warehouse import Warehouse


class WarehouseRepository(ABC):
    @abstractmethod
    def count(self) -> int:
        """Return total number of warehouses (e.g. to check if table is empty)."""
        pass

    @abstractmethod
    def save(self, warehouse: Warehouse) -> Warehouse:
        pass
