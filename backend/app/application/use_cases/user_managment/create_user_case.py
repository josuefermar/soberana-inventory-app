from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.domain.entities.user import User
from app.domain.entities.user_role import UserRole
from app.domain.exceptions.business_exceptions import BusinessRuleViolation
from app.infrastructure.security.password_hasher import PasswordHasher


class CreateUserUseCase:

    def __init__(self, repository):
        self.repository = repository

    def execute(
        self,
        identification: str,
        name: str,
        email: str,
        role: str,
        password: str,
        warehouse_ids: list[str],
    ) -> User:
        if self.repository.get_by_email(email):
            raise BusinessRuleViolation("A user with this email already exists")

        try:
            role_enum = UserRole(role)
        except ValueError:
            raise BusinessRuleViolation(
                f"Invalid role. Must be one of: {[r.value for r in UserRole]}"
            )

        hashed = PasswordHasher().hash_password(password)
        now = datetime.now(timezone.utc)
        warehouse_uuids = [UUID(w) for w in warehouse_ids]

        user = User(
            id=uuid4(),
            identification=identification.strip(),
            name=name.strip(),
            email=email.strip().lower(),
            role=role_enum,
            hashed_password=hashed,
            warehouses=warehouse_uuids,
            is_active=True,
            last_login=None,
            created_at=now,
            updated_at=now,
        )
        return self.repository.create(user)
