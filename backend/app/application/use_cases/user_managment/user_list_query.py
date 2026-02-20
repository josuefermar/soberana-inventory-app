"""Port for user list/detail read model (with warehouse names). Application layer."""

from abc import ABC, abstractmethod
from uuid import UUID

from app.application.use_cases.user_managment.dto import UserListDto


class UserListQuery(ABC):
    """Returns user list/detail DTOs including warehouse id and name (no N+1)."""

    @abstractmethod
    def list_all_with_warehouses(self) -> list[UserListDto]:
        pass

    @abstractmethod
    def get_by_id_for_display(self, user_id: UUID) -> UserListDto | None:
        pass
