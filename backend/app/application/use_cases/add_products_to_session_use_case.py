"""
Add products to an inventory session by creating 0-quantity count rows.

Uses inventory_counts as the single source of truth: one row per (session, product)
with UniqueConstraint(session_id, product_id). No separate session_products table.
"""

from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.domain.entities.inventory_count import InventoryCount
from app.domain.exceptions.business_exceptions import BusinessRuleViolation, NotFoundException
from app.domain.repositories.inventory_count_repository import InventoryCountRepository
from app.domain.repositories.inventory_session_repository import InventorySessionRepository
from app.domain.repositories.product_repository import ProductRepository


class AddProductsToSessionUseCase:
    """Add products to a session by inserting 0-quantity counts. Skips duplicates."""

    def __init__(
        self,
        session_repository: InventorySessionRepository,
        count_repository: InventoryCountRepository,
        product_repository: ProductRepository,
    ):
        self.session_repository = session_repository
        self.count_repository = count_repository
        self.product_repository = product_repository

    def execute(self, session_id: UUID, product_ids: list[UUID]) -> list[InventoryCount]:
        session = self.session_repository.get_by_id(session_id)
        if not session:
            raise NotFoundException("Inventory session not found")

        if session.closed_at is not None:
            raise BusinessRuleViolation(
                "Cannot add products to a closed inventory session."
            )

        now = datetime.now(timezone.utc)
        added = []
        for product_id in product_ids:
            if self.count_repository.exists_by_session_and_product(session_id, product_id):
                continue
            product = self.product_repository.get_by_id(product_id)
            if not product:
                raise NotFoundException(f"Product not found: {product_id}")

            count = InventoryCount(
                id=uuid4(),
                session_id=session_id,
                product_id=product_id,
                quantity_packages=0,
                quantity_units=0,
                created_at=now,
                updated_at=now,
            )
            added.append(self.count_repository.save(count))
        return added
