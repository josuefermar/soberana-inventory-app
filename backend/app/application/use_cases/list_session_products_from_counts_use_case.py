"""
List products associated with an inventory session, derived from inventory_counts.

Uses inventory_counts as the single source of truth: "products in session" = products
that have a count row for that session. No separate session_products table.
"""

from dataclasses import dataclass
from uuid import UUID

from app.domain.exceptions.business_exceptions import NotFoundException
from app.domain.repositories.inventory_count_repository import InventoryCountRepository
from app.domain.repositories.inventory_session_repository import InventorySessionRepository
from app.domain.repositories.product_repository import ProductRepository


@dataclass
class SessionProductItem:
    product_id: UUID
    code: str
    description: str


class ListSessionProductsFromCountsUseCase:
    """Return list of products that have a count in the session (from inventory_counts)."""

    def __init__(
        self,
        session_repository: InventorySessionRepository,
        count_repository: InventoryCountRepository,
        product_repository: ProductRepository,
    ):
        self.session_repository = session_repository
        self.count_repository = count_repository
        self.product_repository = product_repository

    def execute(self, session_id: UUID) -> list[SessionProductItem]:
        session = self.session_repository.get_by_id(session_id)
        if not session:
            raise NotFoundException("Inventory session not found")

        counts = self.count_repository.list_by_session(session_id)
        result = []
        for count in counts:
            product = self.product_repository.get_by_id(count.product_id)
            result.append(
                SessionProductItem(
                    product_id=count.product_id,
                    code=product.code if product else "",
                    description=product.description if product else "",
                )
            )
        return result
