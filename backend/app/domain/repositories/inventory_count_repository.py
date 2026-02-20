from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.inventory_count import InventoryCount


class InventoryCountRepository(ABC):
    @abstractmethod
    def save(self, count: InventoryCount) -> InventoryCount:
        pass

    @abstractmethod
    def list_by_session(self, session_id: UUID) -> list[InventoryCount]:
        pass
