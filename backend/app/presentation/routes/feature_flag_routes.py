from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.application.use_cases.feature_flags import (
    CreateFeatureFlagUseCase,
    ListFeatureFlagsUseCase,
    ToggleFeatureFlagUseCase,
    UpdateFeatureFlagUseCase,
)
from app.domain.entities.user_role import UserRole
from app.infrastructure.repositories.feature_flag_repository_impl import (
    FeatureFlagRepositoryImpl,
)
from app.presentation.dependencies.database import get_db
from app.presentation.dependencies.role_dependencies import require_roles
from app.presentation.schemas.feature_flag_schema import (
    CreateFeatureFlagRequest,
    FeatureFlagResponse,
    UpdateFeatureFlagRequest,
)

router = APIRouter(prefix="/feature-flags", tags=["Feature Flags"])


def _to_response(f):
    return FeatureFlagResponse(
        id=f.id,
        key=f.key,
        enabled=f.enabled,
        description=f.description,
        created_at=f.created_at,
        updated_at=f.updated_at,
    )


@router.get("/", response_model=list[FeatureFlagResponse])
def list_feature_flags(
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    """List all feature flags. Admin only."""
    repo = FeatureFlagRepositoryImpl(db)
    use_case = ListFeatureFlagsUseCase(repo)
    flags = use_case.execute()
    return [_to_response(f) for f in flags]


@router.post("/", response_model=FeatureFlagResponse, status_code=201)
def create_feature_flag(
    body: CreateFeatureFlagRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    """Create a new feature flag. Key must be unique. Admin only."""
    repo = FeatureFlagRepositoryImpl(db)
    use_case = CreateFeatureFlagUseCase(repo)
    flag = use_case.execute(
        key=body.key.strip(),
        enabled=body.enabled,
        description=body.description,
    )
    return _to_response(flag)


@router.put("/{flag_id}", response_model=FeatureFlagResponse)
def update_feature_flag(
    flag_id: UUID,
    body: UpdateFeatureFlagRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    """Update description and/or enabled. Key is not editable. Admin only."""
    repo = FeatureFlagRepositoryImpl(db)
    use_case = UpdateFeatureFlagUseCase(repo)
    flag = use_case.execute(
        id=flag_id,
        enabled=body.enabled,
        description=body.description,
    )
    return _to_response(flag)


@router.patch("/{flag_id}/toggle", response_model=FeatureFlagResponse)
def toggle_feature_flag(
    flag_id: UUID,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    """Toggle enabled state. Admin only."""
    repo = FeatureFlagRepositoryImpl(db)
    use_case = ToggleFeatureFlagUseCase(repo)
    flag = use_case.execute(id=flag_id)
    return _to_response(flag)
