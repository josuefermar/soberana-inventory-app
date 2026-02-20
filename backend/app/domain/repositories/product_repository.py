from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.domain.entities.product import Product


class ProductRepository(ABC):
    @abstractmethod
    def get_by_id(self, product_id: UUID) -> Optional[Product]:
        pass
