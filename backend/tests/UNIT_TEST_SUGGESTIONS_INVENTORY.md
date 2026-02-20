# Unit test suggestions – Inventory improvements

Suggestions for new unit tests after the inventory improvements (closed session, duplicate product, month normalization, business rules).

## 1. RegisterInventoryCountUseCase

- **Session closed**: Given a session with `closed_at` set, `execute` raises `BusinessRuleViolation` with message "Cannot register counts on a closed inventory session." (mock `session_repository.get_by_id` to return a session with `closed_at=datetime.now(UTC)`).
- **Duplicate product in session**: Given `count_repository.exists_by_session_and_product(session_id, product_id)` returns `True`, `execute` raises `BusinessRuleViolation` with message "This product has already been counted in this session."
- **Happy path with open session**: Session has `closed_at=None`, product not yet in session; assert count is saved and returned (mock all three repos, assert `count_repository.save` called with correct domain entity).

## 2. CreateInventorySessionUseCase

- **Month normalization**: Pass `month=datetime(2026, 2, 15, 10, 30, tzinfo=timezone.utc)`. Assert the entity passed to `repository.save` has `month == datetime(2026, 2, 1, 0, 0, 0, tzinfo=timezone.utc)`.
- **Month normalization naive datetime**: Pass `month=datetime(2026, 3, 20)` (no tz). Assert stored month is first day of March in UTC.
- **Day 4 of month**: Mock `datetime.now(timezone.utc)` to return day 4; assert `BusinessRuleViolation` "Inventory sessions can only be created during the first 3 days of the month."
- **count_number 0 or 4**: For `count_number` in (0, 4), assert `BusinessRuleViolation` "Count number must be 1, 2 or 3."
- **Max 3 sessions**: `list_by_warehouse` returns 3 sessions for the same month; assert `BusinessRuleViolation` "Maximum 3 sessions per month per warehouse."
- **Duplicate count_number**: Same warehouse and month, one session with `count_number=1`; create with `count_number=1` again; assert "This count number already exists for the month."

## 3. InventoryCountRepositoryImpl (integration or with real DB session)

- **exists_by_session_and_product**: Insert one count for (session_id, product_id). Assert `exists_by_session_and_product(session_id, product_id)` is True and `exists_by_session_and_product(session_id, other_product_id)` is False.

## 4. _normalize_month_to_first_utc (if exposed or tested via use case)

- First day already: `datetime(2026, 1, 1, 0, 0, 0, tzinfo=timezone.utc)` → unchanged.
- Mid-month: day 15 → day 1, time 00:00:00.
- Non-UTC input: e.g. `datetime(2026, 2, 14)` → result is 2026-02-01 00:00:00 UTC.

Use mocks for repositories so tests stay fast and do not require DB. Use `unittest.mock.patch` for `datetime.now` in CreateInventorySessionUseCase when testing day 1–3 rule.
