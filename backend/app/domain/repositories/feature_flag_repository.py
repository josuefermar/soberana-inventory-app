from abc import ABC, abstractmethod
from typing import List, Optional

from app.domain.entities.feature_flag import FeatureFlag


class FeatureFlagRepository(ABC):
    @abstractmethod
    def get_by_key(self, key: str) -> Optional[FeatureFlag]:
        pass

    @abstractmethod
    def list_all(self) -> List[FeatureFlag]:
        pass

    @abstractmethod
    def save(self, flag: FeatureFlag) -> FeatureFlag:
        pass
