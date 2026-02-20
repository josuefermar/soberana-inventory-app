"""Toggle the enabled state of a feature flag by id."""

from uuid import UUID

from app.domain.entities.feature_flag import FeatureFlag
from app.domain.exceptions.business_exceptions import NotFoundException
from app.domain.repositories.feature_flag_repository import FeatureFlagRepository


class ToggleFeatureFlagUseCase:
    def __init__(self, repository: FeatureFlagRepository):
        self.repository = repository

    def execute(self, id: UUID) -> FeatureFlag:
        existing = self.repository.get_by_id(id)
        if not existing:
            raise NotFoundException("Feature flag not found.")
        return self.repository.toggle(id)
