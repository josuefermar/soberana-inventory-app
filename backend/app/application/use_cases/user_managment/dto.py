"""DTOs for user listing (read model). Keeps domain User free of presentation concerns."""

from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True)
class WarehouseRef:
    """Minimal warehouse reference for API: id and display name (warehouse description)."""

    id: UUID
    name: str


@dataclass
class UserListDto:
    """User data for list/detail API responses, including warehouse names."""

    id: UUID
    identification: str
    name: str
    email: str
    role: str
    warehouses: list[WarehouseRef]
    is_active: bool
