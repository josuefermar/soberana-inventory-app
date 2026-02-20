"""add unique constraint session_id+product_id on inventory_counts

Revision ID: c93d4e5f0a1b
Revises: b82f7a1c8eef
Create Date: 2026-02-20

Ensures one count per product per session. Existing DB must not contain
duplicate (session_id, product_id); otherwise upgrade will fail and duplicates
must be resolved before applying.
"""
from typing import Sequence, Union

from alembic import op


revision: str = "c93d4e5f0a1b"
down_revision: Union[str, Sequence[str], None] = "b82f7a1c8eef"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_unique_constraint(
        "uq_inventory_count_session_product",
        "inventory_counts",
        ["session_id", "product_id"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_inventory_count_session_product",
        "inventory_counts",
        type_="unique",
    )
