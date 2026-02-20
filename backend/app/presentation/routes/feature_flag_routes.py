from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.application.services.feature_flag_service import FeatureFlagService
from app.domain.entities.user_role import UserRole
from app.infrastructure.repositories.feature_flag_repository_impl import (
    FeatureFlagRepositoryImpl,
)
from app.presentation.dependencies.database import get_db
from app.presentation.dependencies.role_dependencies import require_roles
from app.presentation.schemas.feature_flag_schema import (
    FeatureFlagResponse,
    PatchFeatureFlagRequest,
)

router = APIRouter(prefix="/feature-flags", tags=["Feature Flags"])


@router.get("/", response_model=list[FeatureFlagResponse])
def list_feature_flags(
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    """List all feature flags. Admin only."""
    repo = FeatureFlagRepositoryImpl(db)
    service = FeatureFlagService(repo)
    flags = service.list_all()
    return [
        FeatureFlagResponse(
            id=f.id,
            key=f.key,
            enabled=f.enabled,
            description=f.description,
            created_at=f.created_at,
            updated_at=f.updated_at,
        )
        for f in flags
    ]


@router.patch("/{key}", response_model=FeatureFlagResponse)
def update_feature_flag(
    key: str,
    request: PatchFeatureFlagRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    """Toggle or set a feature flag by key. Admin only."""
    repo = FeatureFlagRepositoryImpl(db)
    service = FeatureFlagService(repo)
    try:
        updated = service.set_enabled(key, request.enabled)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feature flag not found: {key}",
        )
    return FeatureFlagResponse(
        id=updated.id,
        key=updated.key,
        enabled=updated.enabled,
        description=updated.description,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
    )
