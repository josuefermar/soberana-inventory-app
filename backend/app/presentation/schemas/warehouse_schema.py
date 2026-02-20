from uuid import UUID
from pydantic import BaseModel


class WarehouseResponse(BaseModel):
    id: UUID
    code: str
    description: str
    status: str
