from dataclasses import dataclass
from enum import Enum
from datetime import datetime
from uuid import UUID
from .user_role import UserRole

@dataclass
class User:
    id: UUID
    identification: str
    name: str
    email: str
    role: UserRole
    warehouses: list[UUID]
    is_active: bool
    last_login: datetime | None
    created_at: datetime
    updated_at: datetime