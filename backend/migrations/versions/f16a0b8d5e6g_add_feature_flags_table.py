"""Add feature_flags table

Revision ID: f16a0b8d5e6g
Revises: e05f9b7c3d4f
Create Date: 2026-02-20

Table for feature flags (e.g. ENABLE_INVENTORY_DATE_RESTRICTION).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.infrastructure.database.database import GUID

revision = "f16a0b8d5e6g"
down_revision = "e05f9b7c3d4f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "feature_flags",
        sa.Column("id", GUID(length=36), nullable=False),
        sa.Column("key", sa.String(255), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("description", sa.String(512), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("key", name="uq_feature_flags_key"),
    )
    op.create_index("ix_feature_flags_id", "feature_flags", ["id"])
    op.create_index("ix_feature_flags_key", "feature_flags", ["key"])


def downgrade() -> None:
    op.drop_index("ix_feature_flags_key", table_name="feature_flags")
    op.drop_index("ix_feature_flags_id", table_name="feature_flags")
    op.drop_table("feature_flags")
