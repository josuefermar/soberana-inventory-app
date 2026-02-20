from datetime import datetime, timezone
from typing import cast
from uuid import UUID, uuid4

from sqlalchemy.orm import Session, joinedload

from app.domain.entities.inventory_count import InventoryCount
from app.domain.repositories.inventory_count_repository import InventoryCountRepository
from app.infrastructure.models.inventory_count_model import InventoryCountModel
from app.infrastructure.models.product_model import ProductModel


class InventoryCountRepositoryImpl(InventoryCountRepository):
    def __init__(self, db: Session):
        self.db = db

    def save(self, count: InventoryCount) -> InventoryCount:
        model = InventoryCountModel(
            id=count.id,
            session_id=count.session_id,
            product_id=count.product_id,
            quantity_packages=count.quantity_packages,
            quantity_units=count.quantity_units,
            created_at=count.created_at,
            updated_at=count.updated_at,
        )
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def list_by_session(self, session_id: UUID) -> list[InventoryCount]:
        models = (
            self.db.query(InventoryCountModel)
            .filter(InventoryCountModel.session_id == session_id)
            .order_by(InventoryCountModel.created_at.asc())
            .all()
        )
        return [self._to_domain(m) for m in models]

    def exists_by_session_and_product(self, session_id: UUID, product_id: UUID) -> bool:
        return (
            self.db.query(InventoryCountModel)
            .filter(
                InventoryCountModel.session_id == session_id,
                InventoryCountModel.product_id == product_id,
            )
            .first()
            is not None
        )

    def count_by_session(self, session_id: UUID) -> int:
        from sqlalchemy import func
        return (
            self.db.query(func.count(InventoryCountModel.id))
            .filter(InventoryCountModel.session_id == session_id)
            .scalar()
            or 0
        )

    def _to_domain(self, model: InventoryCountModel) -> InventoryCount:
        return InventoryCount(
            id=cast(UUID, model.id),
            session_id=cast(UUID, model.session_id),
            product_id=cast(UUID, model.product_id),
            quantity_packages=cast(int, model.quantity_packages),
            quantity_units=cast(int, model.quantity_units),
            created_at=cast(datetime, model.created_at),
            updated_at=cast(datetime, model.updated_at),
        )
