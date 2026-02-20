from fastapi import Depends, HTTPException, status
from app.presentation.dependencies.auth_dependencies import get_current_user
from uuid import UUID
from app.domain.entities.user_role import UserRole

def require_warehouse_access(warehouse_id: UUID):
    def warehouse_access_checker(current_user: dict = Depends(get_current_user)):
        role = current_user.get("role")

        if role == UserRole.ADMIN.value:
            return current_user
        
        user_warehouses = current_user.get("warehouses", [])

        warehouse_ids = [str(warehouse) for warehouse in user_warehouses]

        if warehouse_ids and str(warehouse_id) not in warehouse_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this warehouse",
            )
        return current_user
    return warehouse_access_checker