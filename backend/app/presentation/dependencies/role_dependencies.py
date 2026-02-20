from fastapi import Depends, HTTPException, status

from app.domain.entities.user_role import UserRole
from app.infrastructure.logging.logger import logger
from app.presentation.dependencies.auth_dependencies import get_current_user


def require_roles(allowed_roles: list[UserRole]):
    """RBAC dependency: requires current user's role to be in allowed_roles."""

    def role_checker(current_user: dict = Depends(get_current_user)):
        user_role_str = current_user.get("role")
        allowed_values = [r.value for r in allowed_roles]

        if user_role_str not in allowed_values:
            logger.info(
                "Access denied",
                extra={
                    "event": "access_denied",
                    "user_id": current_user.get("sub"),
                    "user_role": user_role_str,
                    "required_roles": allowed_values,
                },
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this resource",
            )
        return current_user
    return role_checker