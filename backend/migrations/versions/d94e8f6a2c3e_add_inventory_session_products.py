"""add inventory_session_products table

Revision ID: d94e8f6a2c3e
Revises: c93d4e5f0a1b
Create Date: 2026-02-20

Table for associating products with inventory sessions.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.infrastructure.database.database import GUID

revision = "d94e8f6a2c3e"
down_revision = "c93d4e5f0a1b"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "inventory_session_products",
        sa.Column("id", GUID(length=36), nullable=False),
        sa.Column("session_id", GUID(length=36), nullable=False),
        sa.Column("product_id", GUID(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["session_id"], ["inventory_sessions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_id", "product_id", name="uq_session_product"),
    )
    op.create_index("ix_inventory_session_products_id", "inventory_session_products", ["id"])


def downgrade():
    op.drop_index("ix_inventory_session_products_id", table_name="inventory_session_products")
    op.drop_table("inventory_session_products")
