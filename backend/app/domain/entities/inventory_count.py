from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class InventoryCount:
    id: UUID
    session_id: UUID
    product_id: UUID
    measure_unit_id: UUID  # Unit in which this count was entered (packaging or inventory)
    quantity_packages: int
    quantity_units: int
    created_at: datetime
    updated_at: datetime
