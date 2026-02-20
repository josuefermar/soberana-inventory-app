from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

@dataclass
class InventoryCount:
    id: UUID
    session_id: UUID
    product_id: UUID
    quantity_packages: int
    quantity_units: int
    created_at: datetime
    updated_at: datetime
