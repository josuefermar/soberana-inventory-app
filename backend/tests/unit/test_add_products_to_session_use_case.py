"""Unit tests for AddProductsToSessionUseCase: add via 0-quantity counts, no duplicates."""
from datetime import datetime, timezone
from uuid import uuid4

import pytest

from app.application.use_cases.add_products_to_session_use_case import (
    AddProductsToSessionUseCase,
)
from app.domain.entities.inventory_count import InventoryCount
from app.domain.entities.inventory_session import InventorySession
from app.domain.entities.product import Product
from app.domain.exceptions.business_exceptions import (
    BusinessRuleViolation,
    NotFoundException,
)


class _FakeSessionRepo:
    def __init__(self, session=None, closed=False):
        self.session = session
        self.closed = closed

    def get_by_id(self, session_id):
        if self.session is None:
            return None
        s = self.session
        if self.closed:
            return InventorySession(
                id=s.id,
                warehouse_id=s.warehouse_id,
                month=s.month,
                count_number=s.count_number,
                created_by=s.created_by,
                created_at=s.created_at,
                closed_at=datetime.now(timezone.utc),
            )
        return s


class _FakeCountRepo:
    def __init__(self, existing=None):
        self.existing = set(existing or [])
        self.saved = []

    def exists_by_session_and_product(self, session_id, product_id):
        return (str(session_id), str(product_id)) in self.existing

    def save(self, count: InventoryCount) -> InventoryCount:
        self.saved.append(count)
        self.existing.add((str(count.session_id), str(count.product_id)))
        return count


class _FakeProductRepo:
    def __init__(self, product_ids=None, now=None):
        self.product_ids = set(product_ids or [])
        self.now = now or datetime.now(timezone.utc)

    def get_by_id(self, product_id):
        if str(product_id) not in {str(p) for p in self.product_ids}:
            return None
        unit_id = uuid4()
        return Product(
            id=product_id,
            code="CODE",
            description="Product",
            inventory_unit=unit_id,
            packaging_unit=unit_id,
            conversion_factor=1.0,
            is_active=True,
            created_at=self.now,
            updated_at=self.now,
        )


def test_add_products_skips_duplicates():
    """Adding the same product twice only creates one count row."""
    session_id = uuid4()
    product_id = uuid4()
    session = InventorySession(
        id=session_id,
        warehouse_id=uuid4(),
        month=datetime(2025, 2, 1, tzinfo=timezone.utc),
        count_number=1,
        created_by=uuid4(),
        created_at=datetime.now(timezone.utc),
        closed_at=None,
    )
    session_repo = _FakeSessionRepo(session=session)
    count_repo = _FakeCountRepo()
    product_repo = _FakeProductRepo([product_id])
    use_case = AddProductsToSessionUseCase(
        session_repo, count_repo, product_repo
    )

    added = use_case.execute(session_id, [product_id, product_id])

    assert len(added) == 1
    assert len(count_repo.saved) == 1
    assert count_repo.saved[0].product_id == product_id
    assert count_repo.saved[0].quantity_packages == 0
    assert count_repo.saved[0].quantity_units == 0


def test_add_products_session_not_found_raises():
    """When session does not exist, raises NotFoundException."""
    session_id = uuid4()
    product_id = uuid4()
    session_repo = _FakeSessionRepo(session=None)
    count_repo = _FakeCountRepo()
    product_repo = _FakeProductRepo([product_id])
    use_case = AddProductsToSessionUseCase(
        session_repo, count_repo, product_repo
    )

    with pytest.raises(NotFoundException) as exc_info:
        use_case.execute(session_id, [product_id])
    assert "not found" in str(exc_info.value).lower()
    assert len(count_repo.saved) == 0


def test_add_products_closed_session_raises():
    """When session is closed, raises BusinessRuleViolation."""
    session_id = uuid4()
    product_id = uuid4()
    session = InventorySession(
        id=session_id,
        warehouse_id=uuid4(),
        month=datetime(2025, 2, 1, tzinfo=timezone.utc),
        count_number=1,
        created_by=uuid4(),
        created_at=datetime.now(timezone.utc),
        closed_at=None,
    )
    session_repo = _FakeSessionRepo(session=session, closed=True)
    count_repo = _FakeCountRepo()
    product_repo = _FakeProductRepo([product_id])
    use_case = AddProductsToSessionUseCase(
        session_repo, count_repo, product_repo
    )

    with pytest.raises(BusinessRuleViolation) as exc_info:
        use_case.execute(session_id, [product_id])
    assert "closed" in str(exc_info.value).lower()
    assert len(count_repo.saved) == 0


def test_add_products_product_not_found_raises():
    """When product does not exist, raises NotFoundException."""
    session_id = uuid4()
    product_id = uuid4()
    session = InventorySession(
        id=session_id,
        warehouse_id=uuid4(),
        month=datetime(2025, 2, 1, tzinfo=timezone.utc),
        count_number=1,
        created_by=uuid4(),
        created_at=datetime.now(timezone.utc),
        closed_at=None,
    )
    session_repo = _FakeSessionRepo(session=session)
    count_repo = _FakeCountRepo()
    product_repo = _FakeProductRepo([])  # product not in repo
    use_case = AddProductsToSessionUseCase(
        session_repo, count_repo, product_repo
    )

    with pytest.raises(NotFoundException) as exc_info:
        use_case.execute(session_id, [product_id])
    assert "product" in str(exc_info.value).lower() or "not found" in str(
        exc_info.value
    ).lower()
    assert len(count_repo.saved) == 0
