"""Create a new feature flag. Key must be unique."""

from datetime import datetime, timezone
from uuid import uuid4

from app.domain.entities.feature_flag import FeatureFlag
from app.domain.exceptions.business_exceptions import BusinessRuleViolation
from app.domain.repositories.feature_flag_repository import FeatureFlagRepository


class CreateFeatureFlagUseCase:
    def __init__(self, repository: FeatureFlagRepository):
        self.repository = repository

    def execute(
        self,
        key: str,
        enabled: bool = False,
        description: str | None = None,
    ) -> FeatureFlag:
        key = (key or "").strip()
        if not key:
            raise BusinessRuleViolation("Key is required.")
        if self.repository.get_by_key(key):
            raise BusinessRuleViolation("A feature flag with this key already exists.")
        now = datetime.now(timezone.utc)
        flag = FeatureFlag(
            id=uuid4(),
            key=key,
            enabled=enabled,
            description=description.strip() if description else None,
            created_at=now,
            updated_at=now,
        )
        return self.repository.save(flag)
