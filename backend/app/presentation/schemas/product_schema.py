from uuid import UUID
from pydantic import BaseModel


class ProductResponse(BaseModel):
    id: UUID
    code: str
    description: str
