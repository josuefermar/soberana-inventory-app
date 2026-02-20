"""List all feature flags for admin dashboard."""

from typing import List

from app.domain.entities.feature_flag import FeatureFlag
from app.domain.repositories.feature_flag_repository import FeatureFlagRepository


class ListFeatureFlagsUseCase:
    def __init__(self, repository: FeatureFlagRepository):
        self.repository = repository

    def execute(self) -> List[FeatureFlag]:
        return self.repository.get_all()
