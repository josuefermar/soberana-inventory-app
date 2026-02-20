from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.entities.user import User


class UserRepository(ABC):

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    def get_by_id(self, user_id: UUID) -> Optional[User]:
        pass

    @abstractmethod
    def get_by_ids(self, user_ids: list[UUID]) -> list[User]:
        """Return users for the given ids (e.g. to enrich session list with creator names)."""
        pass

    @abstractmethod
    def list_all(self) -> list[User]:
        pass

    @abstractmethod
    def create(self, user: User) -> User:
        pass

    @abstractmethod
    def update(self, user: User) -> Optional[User]:
        pass

    @abstractmethod
    def count(self) -> int:
        """Return total number of users (e.g. to check if table is empty)."""
        pass
