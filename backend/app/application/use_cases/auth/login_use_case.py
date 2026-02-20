from app.domain.exceptions.business_exceptions import BusinessRuleViolation
from app.infrastructure.security.jwt_service import JWTService
from app.infrastructure.security.password_hasher import PasswordHasher


class LoginUseCase:

    def __init__(self, repository):
        self.repository = repository

    def execute(self, email: str, password: str) -> str:
        user = self.repository.get_by_email(email)

        if not user or not user.hashed_password:
            raise BusinessRuleViolation("Invalid credentials")

        if not PasswordHasher.verify_password(password, user.hashed_password):
            raise BusinessRuleViolation("Invalid credentials")

        token = JWTService.create_access_token(
            data={
                "sub": str(user.id),
                "role": user.role.value,
                "warehouses": [str(warehouse) for warehouse in user.warehouses]
            },
        )
        return token