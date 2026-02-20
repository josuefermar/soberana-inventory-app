"""List inventory counts for a session. No warehouse restriction (ADMIN / PROCESS_LEADER)."""

from uuid import UUID

from app.domain.entities.inventory_count import InventoryCount
from app.domain.exceptions.business_exceptions import NotFoundException
from app.domain.repositories.inventory_count_repository import InventoryCountRepository
from app.domain.repositories.inventory_session_repository import InventorySessionRepository


class ListInventoryCountsUseCase:
    def __init__(
        self,
        session_repository: InventorySessionRepository,
        count_repository: InventoryCountRepository,
    ):
        self.session_repository = session_repository
        self.count_repository = count_repository

    def execute(self, session_id: UUID) -> list[InventoryCount]:
        session = self.session_repository.get_by_id(session_id)
        if not session:
            raise NotFoundException("Inventory session not found")
        return self.count_repository.list_by_session(session_id)
