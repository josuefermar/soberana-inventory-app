from dataclasses import dataclass
from uuid import UUID
from datetime import datetime


@dataclass
class MeasurementUnit:
    id: UUID
    name: str
    abbreviation: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
