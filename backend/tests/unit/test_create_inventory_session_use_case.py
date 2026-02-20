"""Unit tests for CreateInventorySessionUseCase: automatic count_number."""
from datetime import datetime, timezone
from unittest.mock import patch
from uuid import uuid4

import pytest

from app.application.use_cases.create_inventory_session_use_case import (
    CreateInventorySessionUseCase,
)
from app.domain.entities.inventory_session import InventorySession
from app.domain.exceptions.business_exceptions import BusinessRuleViolation


class _FakeRepo:
    def __init__(self, sessions_by_warehouse=None):
        self.sessions_by_warehouse = sessions_by_warehouse or {}
        self.saved = []

    def list_by_warehouse(self, warehouse_id):
        return self.sessions_by_warehouse.get(warehouse_id, [])

    def save(self, session: InventorySession) -> InventorySession:
        self.saved.append(session)
        return session


class _FakeFeatureFlagService:
    """Returns False for is_enabled so date-restriction rule is not applied in these tests."""

    def is_enabled(self, key: str) -> bool:
        return False


def _session(warehouse_id, month_year_month, count_number):
    y, m = month_year_month
    month = datetime(y, m, 1, tzinfo=timezone.utc)
    return InventorySession(
        id=uuid4(),
        warehouse_id=warehouse_id,
        month=month,
        count_number=count_number,
        created_by=uuid4(),
        created_at=datetime.now(timezone.utc),
        closed_at=None,
    )


def test_auto_count_number_first_session():
    """When no sessions exist for warehouse+month, count_number is 1."""
    wh_id = uuid4()
    repo = _FakeRepo({wh_id: []})
    use_case = CreateInventorySessionUseCase(repo, _FakeFeatureFlagService())
    month = datetime(2025, 2, 1, tzinfo=timezone.utc)
    created_by = uuid4()

    with patch(
        "app.application.use_cases.create_inventory_session_use_case.datetime"
    ) as m_dt:
        m_dt.now.return_value = datetime(2025, 2, 1, 12, 0, 0, tzinfo=timezone.utc)
        result = use_case.execute(warehouse_id=wh_id, month=month, created_by=created_by)

    assert result.count_number == 1
    assert len(repo.saved) == 1
    assert repo.saved[0].count_number == 1


def test_auto_count_number_second_session():
    """When one session exists, count_number is 2."""
    wh_id = uuid4()
    existing = [_session(wh_id, (2025, 2), 1)]
    repo = _FakeRepo({wh_id: existing})
    use_case = CreateInventorySessionUseCase(repo, _FakeFeatureFlagService())
    month = datetime(2025, 2, 1, tzinfo=timezone.utc)
    created_by = uuid4()

    with patch(
        "app.application.use_cases.create_inventory_session_use_case.datetime"
    ) as m_dt:
        m_dt.now.return_value = datetime(2025, 2, 2, 12, 0, 0, tzinfo=timezone.utc)
        result = use_case.execute(warehouse_id=wh_id, month=month, created_by=created_by)

    assert result.count_number == 2
    assert repo.saved[0].count_number == 2


def test_auto_count_number_third_session():
    """When two sessions exist, count_number is 3."""
    wh_id = uuid4()
    existing = [
        _session(wh_id, (2025, 2), 1),
        _session(wh_id, (2025, 2), 2),
    ]
    repo = _FakeRepo({wh_id: existing})
    use_case = CreateInventorySessionUseCase(repo, _FakeFeatureFlagService())
    month = datetime(2025, 2, 1, tzinfo=timezone.utc)
    created_by = uuid4()

    with patch(
        "app.application.use_cases.create_inventory_session_use_case.datetime"
    ) as m_dt:
        m_dt.now.return_value = datetime(2025, 2, 3, 12, 0, 0, tzinfo=timezone.utc)
        result = use_case.execute(warehouse_id=wh_id, month=month, created_by=created_by)

    assert result.count_number == 3
    assert repo.saved[0].count_number == 3


def test_max_three_sessions_per_month_raises():
    """When 3 sessions already exist for the month, raises BusinessRuleViolation."""
    wh_id = uuid4()
    existing = [
        _session(wh_id, (2025, 2), 1),
        _session(wh_id, (2025, 2), 2),
        _session(wh_id, (2025, 2), 3),
    ]
    repo = _FakeRepo({wh_id: existing})
    use_case = CreateInventorySessionUseCase(repo, _FakeFeatureFlagService())
    month = datetime(2025, 2, 1, tzinfo=timezone.utc)
    created_by = uuid4()

    with patch(
        "app.application.use_cases.create_inventory_session_use_case.datetime"
    ) as m_dt:
        m_dt.now.return_value = datetime(2025, 2, 3, 12, 0, 0, tzinfo=timezone.utc)
        with pytest.raises(BusinessRuleViolation) as exc_info:
            use_case.execute(warehouse_id=wh_id, month=month, created_by=created_by)
    assert "Maximum 3" in str(exc_info.value)
    assert len(repo.saved) == 0
