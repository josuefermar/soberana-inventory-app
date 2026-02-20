from datetime import datetime, timezone
from typing import List, Optional, cast
from uuid import UUID

from sqlalchemy.orm import Session

from app.domain.entities.feature_flag import FeatureFlag
from app.domain.repositories.feature_flag_repository import FeatureFlagRepository
from app.infrastructure.models.feature_flag_model import FeatureFlagModel


class FeatureFlagRepositoryImpl(FeatureFlagRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_key(self, key: str) -> Optional[FeatureFlag]:
        model = (
            self.db.query(FeatureFlagModel)
            .filter(FeatureFlagModel.key == key)
            .first()
        )
        if not model:
            return None
        return self._to_domain(model)

    def list_all(self) -> List[FeatureFlag]:
        models = (
            self.db.query(FeatureFlagModel)
            .order_by(FeatureFlagModel.key)
            .all()
        )
        return [self._to_domain(m) for m in models]

    def save(self, flag: FeatureFlag) -> FeatureFlag:
        model = (
            self.db.query(FeatureFlagModel)
            .filter(FeatureFlagModel.key == flag.key)
            .first()
        )
        now = datetime.now(timezone.utc)
        if model:
            model.enabled = flag.enabled
            model.description = flag.description
            model.updated_at = now
            self.db.commit()
            self.db.refresh(model)
            return self._to_domain(model)
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

    def _to_domain(self, model: FeatureFlagModel) -> FeatureFlag:
        return FeatureFlag(
            id=cast(UUID, model.id),
            key=cast(str, model.key),
            enabled=cast(bool, model.enabled),
            description=cast(Optional[str], model.description),
            created_at=cast(datetime, model.created_at),
            updated_at=cast(datetime, model.updated_at),
        )
