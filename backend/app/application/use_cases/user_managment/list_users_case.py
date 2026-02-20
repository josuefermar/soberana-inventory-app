from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository


class ListUsersUseCase:

    def __init__(self, repository: UserRepository):
        self.repository = repository

    def execute(self) -> list[User]:
        return self.repository.list_all()
