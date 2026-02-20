from uuid import UUID
from pydantic import BaseModel, Field


class MeasurementUnitResponse(BaseModel):
    id: UUID
    name: str
    abbreviation: str
    is_active: bool


class CreateMeasurementUnitRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    abbreviation: str = Field(..., min_length=1, max_length=10)


class UpdateMeasurementUnitRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    abbreviation: str = Field(..., min_length=1, max_length=10)
