"""
Sync users from corporate (Random User) API.
Fetches users, maps to domain User, avoids duplicates by email, persists via repository.
"""

import random
import string
import uuid
from datetime import datetime, timezone
from uuid import UUID

from app.domain.entities.user import User
from app.domain.entities.user_role import UserRole
from app.domain.repositories.user_repository import UserRepository


def _random_8_digit_string() -> str:
    return "".join(random.choices(string.digits, k=8))


def _raw_to_user(raw: dict, now: datetime) -> User | None:
    """Map one API result to User. Returns None if email missing."""
    email = (raw.get("email") or "").strip().lower()
    if not email:
        return None
    name_first = (raw.get("name") or {}).get("first") or ""
    name_last = (raw.get("name") or {}).get("last") or ""
    name = f"{name_first} {name_last}".strip() or "Unknown"
    login = raw.get("login") or {}
    uuid_str = login.get("uuid")
    try:
        user_id = UUID(uuid_str) if uuid_str else None
    except (TypeError, ValueError):
        user_id = None
    if user_id is None:
        user_id = uuid.uuid4()
    return User(
        id=user_id,
        identification=_random_8_digit_string(),
        name=name,
        email=email,
        role=UserRole.WAREHOUSE_MANAGER,
        hashed_password=None,
        warehouses=[],
        is_active=True,
        last_login=None,
        created_at=now,
        updated_at=now,
    )


class SyncUsersFromCorporateAPIUseCase:
    """Fetches users from external API and persists new ones (no duplicate email)."""

    def __init__(self, user_repository: UserRepository, api_fetcher: callable):
        """
        api_fetcher: callable that returns dict with "results" key (list of raw user dicts).
        """
        self.user_repository = user_repository
        self.api_fetcher = api_fetcher

    def execute(self, limit: int = 100) -> int:
        """
        Fetch users from API, map to User, skip existing email, create rest.
        Returns number of users created.
        """
        data = self.api_fetcher(limit)
        results = data.get("results") or []
        now = datetime.now(timezone.utc)
        created = 0

        for raw in results:
            user = _raw_to_user(raw, now)
            if not user or self.user_repository.get_by_email(user.email):
                continue
            self.user_repository.create(user)
            created += 1

        return created
