from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class FeatureFlagResponse(BaseModel):
    id: UUID
    key: str
    enabled: bool
    description: str | None
    created_at: datetime
    updated_at: datetime


class PatchFeatureFlagRequest(BaseModel):
    enabled: bool
