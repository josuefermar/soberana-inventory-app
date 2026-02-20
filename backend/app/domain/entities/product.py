from dataclasses import dataclass
from uuid import UUID
from datetime import datetime


@dataclass
class Product:
    id: UUID
    code: str
    description: str
    inventory_unit: UUID
    packaging_unit: UUID
    conversion_factor: float
    is_active: bool
    created_at: datetime
    updated_at: datetime
