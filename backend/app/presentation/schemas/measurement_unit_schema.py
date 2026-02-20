from uuid import UUID
from pydantic import BaseModel


class MeasurementUnitResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
