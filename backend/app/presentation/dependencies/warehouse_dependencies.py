from uuid import UUID

from fastapi import Depends, HTTPException, status

from app.domain.entities.user_role import UserRole
from app.presentation.dependencies.auth_dependencies import get_current_user


def require_warehouse_access(warehouse_id: UUID):
    def warehouse_access_checker(current_user: dict = Depends(get_current_user)):
        _assert_warehouse_access(current_user, warehouse_id)
        return current_user
    return warehouse_access_checker


def assert_warehouse_access(current_user: dict, warehouse_id: UUID) -> None:
    """Raise HTTP 403 if current_user does not have access to warehouse_id.
    Use when warehouse_id is resolved at runtime (e.g. from session_id)."""
    _assert_warehouse_access(current_user, warehouse_id)


def _assert_warehouse_access(current_user: dict, warehouse_id: UUID) -> None:
    role = current_user.get("role")
    if role == UserRole.ADMIN.value:
        return
    user_warehouses = current_user.get("warehouses", [])
    warehouse_ids = [str(w) for w in user_warehouses]
    if warehouse_ids and str(warehouse_id) not in warehouse_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this warehouse",
        )