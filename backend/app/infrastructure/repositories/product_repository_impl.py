from typing import Optional, cast
from uuid import UUID

from sqlalchemy.orm import Session

from app.domain.entities.product import Product
from app.domain.repositories.product_repository import ProductRepository
from app.infrastructure.models.product_model import ProductModel


class ProductRepositoryImpl(ProductRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, product_id: UUID) -> Optional[Product]:
        model = self.db.query(ProductModel).filter(ProductModel.id == product_id).first()
        if not model:
            return None
        return self._to_domain(model)

    def _to_domain(self, model: ProductModel) -> Product:
        from datetime import datetime

        return Product(
            id=cast(UUID, model.id),
            code=cast(str, model.code),
            description=cast(str, model.description),
            inventory_unit=cast(UUID, model.inventory_unit_id),
            packaging_unit=cast(UUID, model.packaging_unit_id),
            conversion_factor=cast(float, model.conversion_factor),
            is_active=cast(bool, model.is_active),
            created_at=cast(datetime, model.created_at),
            updated_at=cast(datetime, model.updated_at),
        )
