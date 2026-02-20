from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from uuid import UUID


@dataclass
class InventorySessionSummary:
    id: UUID
    warehouse_id: UUID
    warehouse_description: str
    month: datetime
    count_number: int
    created_at: datetime
    closed_at: Optional[datetime]
    products_count: int


class ListInventorySessionsUseCase:

    def __init__(
        self,
        session_repository,
        warehouse_repository,
        count_repository,
    ):
        self.session_repository = session_repository
        self.warehouse_repository = warehouse_repository
        self.count_repository = count_repository

    def execute(
        self,
        warehouse_id: Optional[UUID] = None,
        month: Optional[datetime] = None,
        status: Optional[str] = None,
    ) -> List[InventorySessionSummary]:
        sessions = self.session_repository.list_filtered(
            warehouse_id=warehouse_id,
            month=month,
            status=status,
        )
        result = []
        for s in sessions:
            warehouse = self.warehouse_repository.get_by_id(s.warehouse_id)
            desc = warehouse.description if warehouse else ""
            products_count = self.count_repository.count_by_session(s.id)
            result.append(
                InventorySessionSummary(
                    id=s.id,
                    warehouse_id=s.warehouse_id,
                    warehouse_description=desc,
                    month=s.month,
                    count_number=s.count_number,
                    created_at=s.created_at,
                    closed_at=s.closed_at,
                    products_count=products_count,
                )
            )
        return result
