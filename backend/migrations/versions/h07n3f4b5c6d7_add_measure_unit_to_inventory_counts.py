"""Add measure_unit_id to inventory_counts; backfill from product.packaging_unit_id.

Revision ID: h07n3f4b5c6d7
Revises: g01m2e3a4b5c6
Create Date: 2026-02-20

- Adds measure_unit_id FK to measurement_units (nullable first).
- Backfills existing rows: set measure_unit_id = product.packaging_unit_id
  (historical counts were registered as packaging_quantity only).
- Makes column NOT NULL so new counts must have a unit.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

from app.infrastructure.database.database import GUID

revision: str = "h07n3f4b5c6d7"
down_revision: Union[str, Sequence[str], None] = "g01m2e3a4b5c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add column nullable so existing rows remain valid
    op.add_column(
        "inventory_counts",
        sa.Column("measure_unit_id", GUID(length=36), nullable=True),
    )
    op.create_foreign_key(
        "fk_inventory_counts_measure_unit_id",
        "inventory_counts",
        "measurement_units",
        ["measure_unit_id"],
        ["id"],
    )

    # Backfill: set measure_unit_id from product's packaging_unit_id
    conn = op.get_bind()
    conn.execute(
        sa.text("""
            UPDATE inventory_counts
            SET measure_unit_id = (
                SELECT packaging_unit_id FROM products
                WHERE products.id = inventory_counts.product_id
            )
            WHERE measure_unit_id IS NULL
        """)
    )

    # If any row still has NULL (product missing or product had NULL packaging_unit),
    # set to first measurement_unit to avoid NOT NULL violation
    conn.execute(
        sa.text("""
            UPDATE inventory_counts
            SET measure_unit_id = (SELECT id FROM measurement_units ORDER BY name LIMIT 1)
            WHERE measure_unit_id IS NULL
        """)
    )

    op.alter_column(
        "inventory_counts",
        "measure_unit_id",
        existing_type=GUID(length=36),
        nullable=False,
    )


def downgrade() -> None:
    op.drop_constraint(
        "fk_inventory_counts_measure_unit_id",
        "inventory_counts",
        type_="foreignkey",
    )
    op.drop_column("inventory_counts", "measure_unit_id")
