from datetime import datetime, timezone
from uuid import UUID, uuid4
from app.domain.entities.inventory_session import InventorySession
from app.domain.repositories.inventory_session_repository import InventorySessionRepository
from app.domain.exceptions.business_exceptions import BusinessRuleViolation

class CreateInventorySessionUseCase:

    def __init__(self, repository: InventorySessionRepository):
        self.repository = repository

    def execute(
        self,
        warehouse_id: UUID,
        month: datetime,
        count_number: int,
        created_by: UUID
    ) -> InventorySession:

        now_utc = datetime.now(timezone.utc)
        if now_utc.day > 3:
            raise BusinessRuleViolation(
                "Inventory sessions can only be created during the first 3 days of the month."
            )

        if count_number not in [1, 2, 3]:
            raise BusinessRuleViolation("Count number must be 1, 2 or 3")
        
        existing_session = self.repository.list_by_warehouse(warehouse_id)

        monthly_sessions = [
            s for s in existing_session
            if s.month.year == month.year and s.month.month == month.month
        ]

        if len(monthly_sessions) >= 3:
            raise BusinessRuleViolation("Maximum 3 sessions per month")
        
        if any(s.count_number == count_number for s in monthly_sessions):
            raise BusinessRuleViolation("This count number already exists for the month")
        
        new_session = InventorySession(
            id=uuid4(),
            warehouse_id=warehouse_id,
            month=month,
            count_number=count_number,
            created_by=created_by,
            created_at=datetime.now(timezone.utc),
            closed_at=None
        )
        
        return self.repository.save(new_session)

