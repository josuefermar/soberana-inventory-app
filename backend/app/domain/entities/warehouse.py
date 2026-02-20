from dataclasses import dataclass
from uuid import UUID
from datetime import datetime
from .warehouse_status import WarehouseStatus

@dataclass
class Warehouse:
    id: UUID
    code: str
    description: str
    is_active: bool
    status: WarehouseStatus
    status_description: str | None
    created_at: datetime
    updated_at: datetime