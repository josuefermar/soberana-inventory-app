from abc import ABC, abstractmethod
from uuid import UUID
from typing import Optional, List
from datetime import datetime

from app.domain.entities.inventory_session import InventorySession


class InventorySessionRepository(ABC):

    @abstractmethod
    def save(self, session: InventorySession) -> InventorySession:
        pass

    @abstractmethod
    def update(self, session: InventorySession) -> InventorySession:
        """Update an existing session (e.g. set closed_at)."""
        pass

    @abstractmethod
    def get_by_id(self, session_id: UUID) -> Optional[InventorySession]:
        pass

    @abstractmethod
    def list_by_warehouse(self, warehouse_id: UUID) -> List[InventorySession]:
        pass

    @abstractmethod
    def list_filtered(
        self,
        warehouse_id: Optional[UUID] = None,
        month: Optional[datetime] = None,
        status: Optional[str] = None,
    ) -> List[InventorySession]:
        """List sessions with optional filters. status: 'open' | 'closed'."""
        pass