"""Update an existing feature flag by id. Key is not editable."""

from uuid import UUID

from app.domain.entities.feature_flag import FeatureFlag
from app.domain.exceptions.business_exceptions import NotFoundException
from app.domain.repositories.feature_flag_repository import FeatureFlagRepository


class UpdateFeatureFlagUseCase:
    def __init__(self, repository: FeatureFlagRepository):
        self.repository = repository

    def execute(
        self,
        id: UUID,
        enabled: bool | None = None,
        description: str | None = None,
    ) -> FeatureFlag:
        existing = self.repository.get_by_id(id)
        if not existing:
            raise NotFoundException("Feature flag not found.")
        new_description = (
            description.strip() if description is not None else existing.description
        )
        updated = FeatureFlag(
            id=existing.id,
            key=existing.key,
            enabled=enabled if enabled is not None else existing.enabled,
            description=new_description,
            created_at=existing.created_at,
            updated_at=existing.updated_at,
        )
        return self.repository.update(updated)
