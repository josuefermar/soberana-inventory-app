from datetime import datetime
from typing import Optional, cast
from uuid import UUID

from sqlalchemy.orm import Session

from app.domain.entities.measurement_unit import MeasurementUnit
from app.domain.repositories.measurement_unit_repository import MeasurementUnitRepository
from app.infrastructure.models.measurement_unit_model import MeasurementUnitModel


class MeasurementUnitRepositoryImpl(MeasurementUnitRepository):
    def __init__(self, db: Session):
        self.db = db

    def count(self) -> int:
        return self.db.query(MeasurementUnitModel).count()

    def get_by_name(self, name: str) -> Optional[MeasurementUnit]:
        model = (
            self.db.query(MeasurementUnitModel).filter(MeasurementUnitModel.name == name).first()
        )
        if not model:
            return None
        return self._to_domain(model)

    def save(self, unit: MeasurementUnit) -> MeasurementUnit:
        model = MeasurementUnitModel(
            id=unit.id,
            name=unit.name,
            description=unit.description,
            is_active=unit.is_active,
            created_at=unit.created_at,
            updated_at=unit.updated_at,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def _to_domain(self, model: MeasurementUnitModel) -> MeasurementUnit:
        return MeasurementUnit(
            id=cast(UUID, model.id),
            name=cast(str, model.name),
            description=cast(str | None, model.description),
            is_active=cast(bool, model.is_active),
            created_at=cast(datetime, model.created_at),
            updated_at=cast(datetime, model.updated_at),
        )
