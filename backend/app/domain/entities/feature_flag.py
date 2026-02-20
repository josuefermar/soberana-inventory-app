from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass
class FeatureFlag:
    id: UUID
    key: str
    enabled: bool
    description: str | None
    created_at: datetime
    updated_at: datetime
