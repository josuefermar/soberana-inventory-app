"""Seeder: ensure initial feature flags exist (e.g. ENABLE_INVENTORY_DATE_RESTRICTION)."""

import asyncio
from datetime import datetime, timezone
from uuid import uuid4

from app.domain.entities.feature_flag import FeatureFlag
from app.infrastructure.database.database import SessionLocal
from app.infrastructure.logging.logger import logger
from app.infrastructure.repositories.feature_flag_repository_impl import (
    FeatureFlagRepositoryImpl,
)

INITIAL_FLAG_KEY = "ENABLE_INVENTORY_DATE_RESTRICTION"
INITIAL_FLAG_DESCRIPTION = "Restrict inventory session creation to first 3 days"


def _seed_feature_flags_sync() -> None:
    """Insert ENABLE_INVENTORY_DATE_RESTRICTION if it does not already exist."""
    db = SessionLocal()
    try:
        repo = FeatureFlagRepositoryImpl(db)
        existing = repo.get_by_key(INITIAL_FLAG_KEY)
        if existing:
            logger.info(
                "Feature flag already exists, skipping seed",
                extra={"event": "feature_flag_seed_skipped", "key": INITIAL_FLAG_KEY},
            )
            return
        now = datetime.now(timezone.utc)
        flag = FeatureFlag(
            id=uuid4(),
            key=INITIAL_FLAG_KEY,
            enabled=True,
            description=INITIAL_FLAG_DESCRIPTION,
            created_at=now,
            updated_at=now,
        )
        repo.save(flag)
        logger.info(
            "Feature flag seeded",
            extra={"event": "feature_flag_seeded", "key": INITIAL_FLAG_KEY},
        )
    finally:
        db.close()


async def seed_feature_flags_if_missing() -> None:
    """Run feature flag seed in a thread to avoid blocking the event loop."""
    await asyncio.to_thread(_seed_feature_flags_sync)
