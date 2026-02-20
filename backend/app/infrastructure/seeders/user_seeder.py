"""Seeder: sync users from external API when user table is empty."""

import asyncio
import os

from app.application.use_cases.sync_users_from_api import SyncUsersFromCorporateAPIUseCase
from app.infrastructure.database.database import SessionLocal
from app.infrastructure.external.random_user_client import RandomUserClient
from app.infrastructure.logging.logger import logger
from app.infrastructure.repositories.user_repository_impl import UserRepositoryImpl


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
