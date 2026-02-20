from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.entities.feature_flag import FeatureFlag


class FeatureFlagRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[FeatureFlag]:
        """Return all feature flags ordered by key."""
        pass

    @abstractmethod
    def get_by_key(self, key: str) -> Optional[FeatureFlag]:
        pass

    @abstractmethod
    def get_by_id(self, id: UUID) -> Optional[FeatureFlag]:
        pass

    @abstractmethod
    def save(self, flag: FeatureFlag) -> FeatureFlag:
        """Create or update; used for create and full replace."""
        pass

    @abstractmethod
    def update(self, flag: FeatureFlag) -> FeatureFlag:
        """Update an existing flag by id."""
        pass

    @abstractmethod
    def toggle(self, id: UUID) -> FeatureFlag:
        """Toggle enabled for flag by id; returns updated entity."""
        pass
