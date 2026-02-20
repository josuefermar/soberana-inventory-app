"""
Register an inventory count for a session.
Only allowed when user is assigned to the session's warehouse.
"""

from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.domain.entities.inventory_count import InventoryCount
from app.domain.exceptions.business_exceptions import BusinessRuleViolation, NotFoundException
from app.domain.repositories.inventory_count_repository import InventoryCountRepository
from app.domain.repositories.inventory_session_repository import InventorySessionRepository
from app.domain.repositories.product_repository import ProductRepository
from app.domain.services.unit_conversion_service import UnitConversionService


class RegisterInventoryCountUseCase:
    def __init__(
        self,
        session_repository: InventorySessionRepository,
        product_repository: ProductRepository,
        count_repository: InventoryCountRepository,
    ):
        self.session_repository = session_repository
        self.product_repository = product_repository
        self.count_repository = count_repository

    def execute(
        self,
        session_id: UUID,
        product_id: UUID,
        packaging_quantity: int,
        user_warehouse_ids: list[UUID],
    ) -> InventoryCount:
        session = self.session_repository.get_by_id(session_id)
        if not session:
            raise NotFoundException("Inventory session not found")

        if session.warehouse_id not in user_warehouse_ids:
            raise BusinessRuleViolation(
                "You are not assigned to the warehouse of this inventory session"
            )

        product = self.product_repository.get_by_id(product_id)
        if not product:
            raise NotFoundException("Product not found")

        factor = int(product.conversion_factor)
        total_units = UnitConversionService.calculate_total_units(packaging_quantity, factor)

        now = datetime.now(timezone.utc)
        count = InventoryCount(
            id=uuid4(),
            session_id=session_id,
            product_id=product_id,
            quantity_packages=packaging_quantity,
            quantity_units=total_units,
            created_at=now,
            updated_at=now,
        )
        return self.count_repository.save(count)
