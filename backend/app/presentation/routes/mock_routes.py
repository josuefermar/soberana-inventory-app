"""
Internal mock endpoints. GET /mock/corporate-users returns fake corporate users
in RandomUser API shape (for USER_SYNC_MODE=mock or manual testing).
"""

from fastapi import APIRouter, Depends, Query

from app.domain.entities.user_role import UserRole
from app.infrastructure.mock.corporate_users_faker import fetch_users as mock_fetch_users
from app.presentation.dependencies.role_dependencies import require_roles

router = APIRouter(prefix="/mock", tags=["Mock"])

MAX_LIMIT = 100


@router.get("/corporate-users")
def get_corporate_users_mock(
    limit: int = Query(100, ge=1, le=MAX_LIMIT),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
) -> dict:
    """
    Returns fake corporate users in RandomUser API shape: {"results": [...]}.
    Used when USER_SYNC_MODE=mock or for testing. Admin only.
    """
    return mock_fetch_users(limit)
