"""Seeder: warehouses and products when tables are empty."""

import asyncio
from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.domain.entities.measurement_unit import MeasurementUnit
from app.domain.entities.product import Product
from app.domain.entities.warehouse import Warehouse
from app.domain.entities.warehouse_status import WarehouseStatus
from app.domain.repositories.measurement_unit_repository import MeasurementUnitRepository
from app.infrastructure.database.database import SessionLocal
from app.infrastructure.logging.logger import logger
from app.infrastructure.repositories.measurement_unit_repository_impl import (
    MeasurementUnitRepositoryImpl,
)
from app.infrastructure.repositories.product_repository_impl import ProductRepositoryImpl
from app.infrastructure.repositories.warehouse_repository_impl import (
    WarehouseRepositoryImpl,
)


def _seed_master_data_sync() -> None:
    """
    If warehouse table is empty, insert default warehouses.
    If product table is empty, insert default products (and ensure measurement units exist).
    Uses repository pattern only; no direct ORM access.
    """
    db = SessionLocal()
    try:
        warehouse_repo = WarehouseRepositoryImpl(db)
        product_repo = ProductRepositoryImpl(db)
        unit_repo = MeasurementUnitRepositoryImpl(db)

        warehouses_created = 0
        products_created = 0

        if warehouse_repo.count() == 0:
            now = datetime.now(timezone.utc)
            warehouses_data = [
                ("00009", "Cereté", WarehouseStatus.ACTIVE),
                ("00014", "Central", WarehouseStatus.ACTIVE),
                ("00006", "Valledupar", WarehouseStatus.ACTIVE),
                ("00090", "Maicao", WarehouseStatus.INACTIVE),
            ]
            for code, description, status in warehouses_data:
                wh = Warehouse(
                    id=uuid4(),
                    code=code,
                    description=description,
                    is_active=(status == WarehouseStatus.ACTIVE),
                    status=status,
                    status_description=None,
                    created_at=now,
                    updated_at=now,
                )
                warehouse_repo.save(wh)
                warehouses_created += 1

        if product_repo.count() == 0:
            now = datetime.now(timezone.utc)
            und_id = _ensure_measurement_unit(unit_repo, "UND", "Unidad", now)
            caja_id = _ensure_measurement_unit(unit_repo, "CAJA", "Caja", now)
            arroba_id = _ensure_measurement_unit(unit_repo, "ARROBA", "Arroba", now)

            packaging_units = [caja_id, caja_id, caja_id, arroba_id, arroba_id]
            factors = [6, 12, 24, 48]
            for i in range(1, 16):
                code = f"P{i:03d}"
                description = f"Product {i}"
                packaging_unit = packaging_units[(i - 1) % len(packaging_units)]
                factor = factors[(i - 1) % len(factors)]
                product = Product(
                    id=uuid4(),
                    code=code,
                    description=description,
                    inventory_unit=und_id,
                    packaging_unit=packaging_unit,
                    conversion_factor=float(factor),
                    is_active=True,
                    created_at=now,
                    updated_at=now,
                )
                product_repo.save(product)
                products_created += 1

        if warehouses_created > 0 or products_created > 0:
            logger.info(
                "Master data seeded",
                extra={
                    "event": "master_data_seeded",
                    "warehouses_created": warehouses_created,
                    "products_created": products_created,
                },
            )
        else:
            logger.info(
                "Master data skipped (tables not empty)",
                extra={"event": "master_data_skipped"},
            )
    finally:
        db.close()


async def seed_master_data_if_empty() -> None:
    """Run master data seeding in a thread to avoid blocking the event loop."""
    await asyncio.to_thread(_seed_master_data_sync)


def _ensure_measurement_unit(
    unit_repo: MeasurementUnitRepository,
    name: str,
    description: str,
    now: datetime,
) -> UUID:
    existing = unit_repo.get_by_name(name)
    if existing:
        return existing.id
    unit = MeasurementUnit(
        id=uuid4(),
        name=name,
        description=description,
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    return unit_repo.save(unit).id
