"""Add abbreviation to measurement_units; migrate name/description semantics.

Revision ID: g01m2e3a4b5c6
Revises: f16a0b8d5e6g
Create Date: 2026-02-20

- Add column abbreviation (nullable initially).
- Migrate: abbreviation = old name, name = COALESCE(description, name).
- Drop description; set abbreviation NOT NULL; add UNIQUE(name), UNIQUE(abbreviation).
- Downgrade restores description and reverses data.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.infrastructure.database.database import GUID


revision = "g01m2e3a4b5c6"
down_revision: Union[str, Sequence[str], None] = "f16a0b8d5e6g"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1) Add abbreviation nullable, max length 10
    op.add_column(
        "measurement_units",
        sa.Column("abbreviation", sa.String(length=10), nullable=True),
    )

    # 2) Data migration: abbreviation = current name; name = COALESCE(description, name)
    #    so we never set name to NULL and we preserve existing data
    conn = op.get_bind()
    conn.execute(
        sa.text("""
            UPDATE measurement_units
            SET abbreviation = name,
                name = COALESCE(NULLIF(TRIM(description), ''), name)
        """)
    )

    # 3) Drop description column
    op.drop_column("measurement_units", "description")

    # 4) Make abbreviation NOT NULL (all rows now have value)
    op.alter_column(
        "measurement_units",
        "abbreviation",
        existing_type=sa.String(length=10),
        nullable=False,
    )

    # 5) Add unique constraints (name and abbreviation must be unique)
    op.create_unique_constraint(
        "uq_measurement_units_name",
        "measurement_units",
        ["name"],
    )
    op.create_unique_constraint(
        "uq_measurement_units_abbreviation",
        "measurement_units",
        ["abbreviation"],
    )


def downgrade() -> None:
    # 1) Drop unique constraints
    op.drop_constraint(
        "uq_measurement_units_abbreviation",
        "measurement_units",
        type_="unique",
    )
    op.drop_constraint(
        "uq_measurement_units_name",
        "measurement_units",
        type_="unique",
    )

    # 2) Add description column back (nullable)
    op.add_column(
        "measurement_units",
        sa.Column("description", sa.String(), nullable=True),
    )

    # 3) Reverse data: old semantics were name=abbreviation, description=name
    conn = op.get_bind()
    conn.execute(
        sa.text("""
            UPDATE measurement_units
            SET description = name,
                name = abbreviation
        """)
    )

    # 4) Drop abbreviation column
    op.drop_column("measurement_units", "abbreviation")
