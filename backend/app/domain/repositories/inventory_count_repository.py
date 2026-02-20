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

    @abstractmethod
    def exists_by_session_and_product(self, session_id: UUID, product_id: UUID) -> bool:
        """Returns True if a count for this product already exists in the session."""
        pass

    @abstractmethod
    def count_by_session(self, session_id: UUID) -> int:
        """Return number of count records for the session."""
        pass
