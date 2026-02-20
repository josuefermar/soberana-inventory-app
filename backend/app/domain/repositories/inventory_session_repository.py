from abc import ABC, abstractmethod
from uuid import UUID
from typing import Optional, List
from app.domain.entities.inventory_session import InventorySession

class InventorySessionRepository(ABC):

    @abstractmethod
    def save(self, session: InventorySession) -> InventorySession:
        pass

    @abstractmethod
    def get_by_id(self, session_id: UUID) -> Optional[InventorySession]:
        pass

    @abstractmethod
    def list_by_warehouse(self, warehouse_id: UUID) -> List[InventorySession]:
        pass