"""Remove inventory_session_products; use inventory_counts as single source of truth.

Revision ID: e05f9b7c3d4f
Revises: d94e8f6a2c3e
Create Date: 2026-02-20

Option A: inventory_counts is both the association (session_id, product_id) and the
count (quantity_packages, quantity_units). UniqueConstraint(session_id, product_id)
already exists on inventory_counts. No separate session_products table.

- Upgrade: Migrate any (session_id, product_id) from inventory_session_products into
  inventory_counts with quantity 0 if not already present; then drop
  inventory_session_products.
- Downgrade: Recreate inventory_session_products table (empty; data in counts remains).
"""
from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

from app.infrastructure.database.database import GUID

revision = "e05f9b7c3d4f"
down_revision = "d94e8f6a2c3e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    # 1) Migrate associations to counts (insert 0-quantity count if not exists)
    rp = conn.execute(
        text(
            "SELECT id, session_id, product_id, created_at FROM inventory_session_products"
        )
    )
    rows = rp.fetchall()
    for row in rows:
        session_id, product_id, created_at = row[1], row[2], row[3]
        exists = conn.execute(
            text(
                "SELECT 1 FROM inventory_counts "
                "WHERE session_id = :sid AND product_id = :pid LIMIT 1"
            ),
            {"sid": str(session_id), "pid": str(product_id)},
        ).fetchone()
        if not exists:
            new_id = str(uuid4())
            conn.execute(
                text(
                    "INSERT INTO inventory_counts "
                    "(id, session_id, product_id, quantity_packages, quantity_units, created_at, updated_at) "
                    "VALUES (:id, :sid, :pid, 0, 0, :created_at, :created_at)"
                ),
                {
                    "id": new_id,
                    "sid": str(session_id),
                    "pid": str(product_id),
                    "created_at": created_at,
                },
            )

    # 2) Drop inventory_session_products
    op.drop_index(
        "ix_inventory_session_products_id",
        table_name="inventory_session_products",
    )
    op.drop_table("inventory_session_products")


def downgrade() -> None:
    op.create_table(
        "inventory_session_products",
        sa.Column("id", GUID(length=36), nullable=False),
        sa.Column("session_id", GUID(length=36), nullable=False),
        sa.Column("product_id", GUID(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["session_id"], ["inventory_sessions.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["product_id"], ["products.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_id", "product_id", name="uq_session_product"),
    )
    op.create_index(
        "ix_inventory_session_products_id",
        "inventory_session_products",
        ["id"],
    )
