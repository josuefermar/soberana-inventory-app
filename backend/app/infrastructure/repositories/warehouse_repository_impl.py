from datetime import datetime
from typing import List, cast
from uuid import UUID

from sqlalchemy.orm import Session

from app.domain.entities.warehouse import Warehouse
from app.domain.entities.warehouse_status import WarehouseStatus
from app.domain.repositories.warehouse_repository import WarehouseRepository
from app.infrastructure.models.warehouse_model import WarehouseModel


class WarehouseRepositoryImpl(WarehouseRepository):
    def __init__(self, db: Session):
        self.db = db

    def count(self) -> int:
        return self.db.query(WarehouseModel).count()

    def list_active(self) -> List[Warehouse]:
        models = (
            self.db.query(WarehouseModel)
            .filter(WarehouseModel.is_active == True)
            .all()
        )
        return [self._to_domain(m) for m in models]

    def save(self, warehouse: Warehouse) -> Warehouse:
        model = WarehouseModel(
            id=warehouse.id,
            code=warehouse.code,
            description=warehouse.description,
            is_active=warehouse.is_active,
            status=warehouse.status.value,
            status_description=warehouse.status_description,
            created_at=warehouse.created_at,
            updated_at=warehouse.updated_at,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def _to_domain(self, model: WarehouseModel) -> Warehouse:
        return Warehouse(
            id=cast(UUID, model.id),
            code=cast(str, model.code),
            description=cast(str, model.description),
            is_active=cast(bool, model.is_active),
            status=WarehouseStatus(cast(str, model.status)),
            status_description=cast(str | None, model.status_description),
            created_at=cast(datetime, model.created_at),
            updated_at=cast(datetime, model.updated_at),
        )
