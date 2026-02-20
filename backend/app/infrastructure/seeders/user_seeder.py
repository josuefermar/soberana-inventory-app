"""Seeder: sync users from external API when user table is empty; ensure default admin exists."""

import asyncio
from datetime import datetime, timezone
from uuid import uuid4

from app.application.use_cases.sync_users_from_api import SyncUsersFromCorporateAPIUseCase
from app.domain.entities.user import User
from app.domain.entities.user_role import UserRole
from app.infrastructure.database.database import SessionLocal
from app.infrastructure.external.random_user_client import RandomUserClient
from app.infrastructure.logging.logger import logger
from app.infrastructure.repositories.user_repository_impl import UserRepositoryImpl
from app.infrastructure.repositories.warehouse_repository_impl import (
    WarehouseRepositoryImpl,
)
from app.infrastructure.security.password_hasher import PasswordHasher


DEFAULT_ADMIN_EMAIL = "admin@admin.com"
DEFAULT_ADMIN_PASSWORD = "admin"  # noqa: S105 - documented default for local/Docker


def _ensure_default_admin_sync() -> None:
    """
    If user with email admin@admin.com does not exist, create default admin.
    Uses PasswordHasher for hashing; assigns all active warehouses.
    Does not overwrite existing admin.
    """
    db = SessionLocal()
    try:
        user_repo = UserRepositoryImpl(db)
        existing = user_repo.get_by_email(DEFAULT_ADMIN_EMAIL)
        if existing:
            logger.info(
                "Default admin already exists",
                extra={"event": "default_admin_exists", "email": DEFAULT_ADMIN_EMAIL},
            )
            return

        hashed = PasswordHasher().hash_password(DEFAULT_ADMIN_PASSWORD)
        warehouse_repo = WarehouseRepositoryImpl(db)
        active_warehouses = warehouse_repo.list_active()
        warehouse_ids = [w.id for w in active_warehouses]

        now = datetime.now(timezone.utc)
        user = User(
            id=uuid4(),
            identification="admin",
            name="Default Admin",
            email=DEFAULT_ADMIN_EMAIL,
            role=UserRole.ADMIN,
            hashed_password=hashed,
            warehouses=warehouse_ids,
            is_active=True,
            last_login=None,
            created_at=now,
            updated_at=now,
        )
        user_repo.create(user)
        logger.info(
            "Default admin user created",
            extra={"event": "default_admin_created", "email": DEFAULT_ADMIN_EMAIL},
        )
    finally:
        db.close()


async def ensure_default_admin_exists() -> None:
    """Run default admin creation in a thread to avoid blocking the event loop."""
    await asyncio.to_thread(_ensure_default_admin_sync)


async def seed_users_if_empty() -> None:
    """
    If user table is empty, run SyncUsersFromCorporateAPIUseCase and log number created.
    """
    db = SessionLocal()
    try:
        repository = UserRepositoryImpl(db)
        if repository.count() > 0:
            logger.info(
                "Seeder skipped: user table not empty",
                extra={"event": "seeder_skipped", "reason": "users_exist"},
            )
            return

        client = RandomUserClient()
        use_case = SyncUsersFromCorporateAPIUseCase(
            user_repository=repository,
            api_fetcher=lambda limit: client.fetch_users(limit),
        )
        # Run sync in thread to avoid blocking event loop
        created = await asyncio.to_thread(use_case.execute, 100)

        logger.info(
            "Seeder completed: users synced from API",
            extra={"event": "seeder_executed", "users_created": created},
        )
    finally:
        db.close()
