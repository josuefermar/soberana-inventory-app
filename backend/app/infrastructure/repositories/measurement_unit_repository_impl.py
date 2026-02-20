from datetime import datetime
from typing import List, Optional, cast
from uuid import UUID

from sqlalchemy.orm import Session

from app.domain.entities.measurement_unit import MeasurementUnit
from app.domain.exceptions.business_exceptions import NotFoundException
from app.domain.repositories.measurement_unit_repository import MeasurementUnitRepository
from app.infrastructure.models.measurement_unit_model import MeasurementUnitModel


class MeasurementUnitRepositoryImpl(MeasurementUnitRepository):
    def __init__(self, db: Session):
        self.db = db

    def count(self) -> int:
        return self.db.query(MeasurementUnitModel).count()

    def list_active(self) -> List[MeasurementUnit]:
        models = (
            self.db.query(MeasurementUnitModel)
            .filter(MeasurementUnitModel.is_active == True)
            .order_by(MeasurementUnitModel.name)
            .all()
        )
        return [self._to_domain(m) for m in models]

    def list_all(self) -> List[MeasurementUnit]:
        models = (
            self.db.query(MeasurementUnitModel)
            .order_by(MeasurementUnitModel.name)
            .all()
        )
        return [self._to_domain(m) for m in models]

    def get_by_id(self, id: UUID) -> Optional[MeasurementUnit]:
        model = self.db.query(MeasurementUnitModel).filter(MeasurementUnitModel.id == id).first()
        if not model:
            return None
        return self._to_domain(model)

    def get_by_name(self, name: str) -> Optional[MeasurementUnit]:
        model = (
            self.db.query(MeasurementUnitModel).filter(MeasurementUnitModel.name == name).first()
        )
        if not model:
            return None
        return self._to_domain(model)

    def get_by_abbreviation(self, abbreviation: str) -> Optional[MeasurementUnit]:
        model = (
            self.db.query(MeasurementUnitModel)
            .filter(MeasurementUnitModel.abbreviation == abbreviation)
            .first()
        )
        if not model:
            return None
        return self._to_domain(model)

    def save(self, unit: MeasurementUnit) -> MeasurementUnit:
        model = MeasurementUnitModel(
            id=unit.id,
            name=unit.name,
            abbreviation=unit.abbreviation,
            is_active=unit.is_active,
            created_at=unit.created_at,
            updated_at=unit.updated_at,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, unit: MeasurementUnit) -> MeasurementUnit:
        model = (
            self.db.query(MeasurementUnitModel).filter(MeasurementUnitModel.id == unit.id).first()
        )
        if not model:
            raise NotFoundException("Measurement unit not found")
        model.name = unit.name
        model.abbreviation = unit.abbreviation
        model.is_active = unit.is_active
        model.updated_at = unit.updated_at
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def _to_domain(self, model: MeasurementUnitModel) -> MeasurementUnit:
        return MeasurementUnit(
            id=cast(UUID, model.id),
            name=cast(str, model.name),
            abbreviation=cast(str, model.abbreviation),
            is_active=cast(bool, model.is_active),
            created_at=cast(datetime, model.created_at),
            updated_at=cast(datetime, model.updated_at),
        )
