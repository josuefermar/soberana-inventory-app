from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.entities.product import Product


class ProductRepository(ABC):
    @abstractmethod
    def get_by_id(self, product_id: UUID) -> Optional[Product]:
        pass

    @abstractmethod
    def list_active(self) -> List[Product]:
        """Return all active products (for selection/autocomplete)."""
        pass

    @abstractmethod
    def count(self) -> int:
        """Return total number of products (e.g. to check if table is empty)."""
        pass

    @abstractmethod
    def save(self, product: Product) -> Product:
        pass
