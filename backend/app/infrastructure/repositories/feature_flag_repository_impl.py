from datetime import datetime, timezone
from typing import List, Optional, cast
from uuid import UUID

from sqlalchemy.orm import Session

from app.domain.entities.feature_flag import FeatureFlag
from app.domain.exceptions.business_exceptions import NotFoundException
from app.domain.repositories.feature_flag_repository import FeatureFlagRepository
from app.infrastructure.models.feature_flag_model import FeatureFlagModel


class FeatureFlagRepositoryImpl(FeatureFlagRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[FeatureFlag]:
        models = (
            self.db.query(FeatureFlagModel)
            .order_by(FeatureFlagModel.key)
            .all()
        )
        return [self._to_domain(m) for m in models]

    def get_by_key(self, key: str) -> Optional[FeatureFlag]:
        model = (
            self.db.query(FeatureFlagModel)
            .filter(FeatureFlagModel.key == key)
            .first()
        )
        if not model:
            return None
        return self._to_domain(model)

    def get_by_id(self, id: UUID) -> Optional[FeatureFlag]:
        model = (
            self.db.query(FeatureFlagModel)
            .filter(FeatureFlagModel.id == id)
            .first()
        )
        if not model:
            return None
        return self._to_domain(model)

    def save(self, flag: FeatureFlag) -> FeatureFlag:
        """Insert new flag (create). Caller must ensure key is unique."""
        now = datetime.now(timezone.utc)
        db_model = FeatureFlagModel(
            id=flag.id,
            key=flag.key,
            enabled=flag.enabled,
            description=flag.description,
            created_at=flag.created_at,
            updated_at=flag.updated_at,
        )
        self.db.add(db_model)
        self.db.commit()
        self.db.refresh(db_model)
        return self._to_domain(db_model)

    def update(self, flag: FeatureFlag) -> FeatureFlag:
        """Update existing flag by id (key is not changed)."""
        model = (
            self.db.query(FeatureFlagModel)
            .filter(FeatureFlagModel.id == flag.id)
            .first()
        )
        if not model:
            raise NotFoundException("Feature flag not found.")
        now = datetime.now(timezone.utc)
        model.enabled = flag.enabled
        model.description = flag.description
        model.updated_at = now
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def toggle(self, id: UUID) -> FeatureFlag:
        """Toggle enabled for flag by id."""
        model = (
            self.db.query(FeatureFlagModel)
            .filter(FeatureFlagModel.id == id)
            .first()
        )
        if not model:
            raise NotFoundException("Feature flag not found.")
        model.enabled = not model.enabled
        model.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def _to_domain(self, model: FeatureFlagModel) -> FeatureFlag:
        return FeatureFlag(
            id=cast(UUID, model.id),
            key=cast(str, model.key),
            enabled=cast(bool, model.enabled),
            description=cast(Optional[str], model.description),
            created_at=cast(datetime, model.created_at),
            updated_at=cast(datetime, model.updated_at),
        )
