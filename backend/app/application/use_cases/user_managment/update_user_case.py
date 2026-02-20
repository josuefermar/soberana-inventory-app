from uuid import UUID

from app.domain.entities.user import User
from app.domain.entities.user_role import UserRole
from app.domain.exceptions.business_exceptions import BusinessRuleViolation, NotFoundException
from app.infrastructure.security.password_hasher import PasswordHasher


class UpdateUserUseCase:

    def __init__(self, repository):
        self.repository = repository

    def execute(
        self,
        user_id: UUID,
        *,
        identification: str | None = None,
        name: str | None = None,
        email: str | None = None,
        role: str | None = None,
        password: str | None = None,
        warehouse_ids: list[str] | None = None,
        is_active: bool | None = None,
    ) -> User:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found")

        new_email = (email.strip().lower() if email is not None else None) or user.email
        if new_email != user.email:
            existing = self.repository.get_by_email(new_email)
            if existing:
                raise BusinessRuleViolation("A user with this email already exists")

        new_role = user.role
        if role is not None:
            try:
                new_role = UserRole(role)
            except ValueError:
                raise BusinessRuleViolation(
                    f"Invalid role. Must be one of: {[r.value for r in UserRole]}"
                )

        new_password = user.hashed_password
        if password is not None and password != "":
            new_password = PasswordHasher().hash_password(password)

        new_warehouses = (
            [UUID(w) for w in warehouse_ids]
            if warehouse_ids is not None
            else user.warehouses
        )
        new_is_active = user.is_active if is_active is None else is_active

        updated_user = User(
            id=user.id,
            identification=identification.strip() if identification is not None else user.identification,
            name=name.strip() if name is not None else user.name,
            email=new_email,
            role=new_role,
            hashed_password=new_password,
            warehouses=new_warehouses,
            is_active=new_is_active,
            last_login=user.last_login,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
        result = self.repository.update(updated_user)
        if not result:
            raise NotFoundException("User not found")
        return result
