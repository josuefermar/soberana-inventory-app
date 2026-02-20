from typing import List, Optional

from app.domain.entities.feature_flag import FeatureFlag
from app.domain.repositories.feature_flag_repository import FeatureFlagRepository


class FeatureFlagService:
    """Application service for feature flags. Use case layer depends on this, not the repository directly."""

    def __init__(self, repository: FeatureFlagRepository):
        self._repository = repository

    def is_enabled(self, key: str) -> bool:
        """Return True if a flag with the given key exists and is enabled; False otherwise."""
        flag = self._repository.get_by_key(key)
        return flag is not None and flag.enabled

    def get_by_key(self, key: str) -> Optional[FeatureFlag]:
        """Return the feature flag for the given key, or None if not found."""
        return self._repository.get_by_key(key)

    def list_all(self) -> List[FeatureFlag]:
        """Return all feature flags."""
        return self._repository.get_all()

    def set_enabled(self, key: str, enabled: bool) -> FeatureFlag:
        """Update the enabled state of a flag by key. Creates the flag if it does not exist (caller should seed)."""
        flag = self._repository.get_by_key(key)
        if flag is None:
            raise ValueError(f"Feature flag not found: {key}")
        updated = FeatureFlag(
            id=flag.id,
            key=flag.key,
            enabled=enabled,
            description=flag.description,
            created_at=flag.created_at,
            updated_at=flag.updated_at,
        )
        return self._repository.save(updated)
