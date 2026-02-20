from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class FeatureFlagResponse(BaseModel):
    id: UUID
    key: str
    enabled: bool
    description: str | None
    created_at: datetime
    updated_at: datetime


class CreateFeatureFlagRequest(BaseModel):
    key: str = Field(..., min_length=1, description="Unique key for the flag")
    enabled: bool = False
    description: str | None = None


class UpdateFeatureFlagRequest(BaseModel):
    enabled: bool | None = None
    description: str | None = None
