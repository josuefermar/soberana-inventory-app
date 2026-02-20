"""
Close an inventory session by setting closed_at.

Only open sessions can be closed. Role (ADMIN or PROCESS_LEADER) is enforced
at the route layer; this use case validates business rules only.
"""

from datetime import datetime, timezone
from uuid import UUID

from app.domain.entities.inventory_session import InventorySession
from app.domain.exceptions.business_exceptions import BusinessRuleViolation, NotFoundException
from app.domain.repositories.inventory_session_repository import InventorySessionRepository


class CloseInventorySessionUseCase:
    def __init__(self, session_repository: InventorySessionRepository):
        self.session_repository = session_repository

    def execute(self, session_id: UUID) -> InventorySession:
        session = self.session_repository.get_by_id(session_id)
        if not session:
            raise NotFoundException("Inventory session not found")

        if session.closed_at is not None:
            raise BusinessRuleViolation(
                "Inventory session is already closed."
            )

        now = datetime.now(timezone.utc)
        closed_session = InventorySession(
            id=session.id,
            warehouse_id=session.warehouse_id,
            month=session.month,
            count_number=session.count_number,
            created_by=session.created_by,
            created_at=session.created_at,
            closed_at=now,
        )
        return self.session_repository.update(closed_session)
