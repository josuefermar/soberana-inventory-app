from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.domain.entities.inventory_session import InventorySession
from app.domain.exceptions.business_exceptions import BusinessRuleViolation
from app.domain.repositories.inventory_session_repository import InventorySessionRepository

# Business rules: sessions only on days 1-3; count_number auto 1..3; max 3 per month per warehouse
ALLOWED_SESSION_CREATION_DAYS = (1, 2, 3)
MAX_SESSIONS_PER_MONTH = 3


def _normalize_month_to_first_utc(month: datetime) -> datetime:
    """Normalize to first day of month at 00:00:00 in UTC. Avoids duplicates for same month."""
    if month.tzinfo is None:
        month = month.replace(tzinfo=timezone.utc)
    else:
        month = month.astimezone(timezone.utc)
    return month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


class CreateInventorySessionUseCase:

    def __init__(self, repository: InventorySessionRepository):
        self.repository = repository

    def execute(
        self,
        warehouse_id: UUID,
        month: datetime,
        created_by: UUID,
    ) -> InventorySession:
        now_utc = datetime.now(timezone.utc)
        if now_utc.day not in ALLOWED_SESSION_CREATION_DAYS:
            raise BusinessRuleViolation(
                "Inventory sessions can only be created during the first 3 days of the month."
            )

        month = _normalize_month_to_first_utc(month)

        existing_sessions = self.repository.list_by_warehouse(warehouse_id)
        monthly_sessions = [
            s for s in existing_sessions
            if s.month.year == month.year and s.month.month == month.month
        ]

        if len(monthly_sessions) >= MAX_SESSIONS_PER_MONTH:
            raise BusinessRuleViolation("Maximum 3 sessions per month per warehouse. No more counts can be created for this month.")

        count_number = 1
        if monthly_sessions:
            count_number = max(s.count_number for s in monthly_sessions) + 1

        new_session = InventorySession(
            id=uuid4(),
            warehouse_id=warehouse_id,
            month=month,
            count_number=count_number,
            created_by=created_by,
            created_at=now_utc,
            closed_at=None,
        )
        return self.repository.save(new_session)

