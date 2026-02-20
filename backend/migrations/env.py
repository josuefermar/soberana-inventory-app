import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from backend root (parent of migrations/) so DATABASE_URL is used
backend_root = Path(__file__).resolve().parent.parent
load_dotenv(backend_root / ".env")

from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Import Base and load all models so they register with Base.metadata
from app.infrastructure.database.database import Base, GUID
import app.infrastructure.models  # noqa: F401 - load all models for autogenerate

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# For 'autogenerate' support: use our app's Base metadata
target_metadata = Base.metadata


def render_item(type_, obj, autogen_context):
    """Render custom types in migrations so they use GUID instead of full module path."""
    if type_ == GUID:
        autogen_context.imports.add("from app.infrastructure.database.database import GUID")
        return "GUID(length=36)"
    return None


def get_url() -> str:
    """Use DATABASE_URL from environment if set; otherwise alembic.ini."""
    return os.getenv("DATABASE_URL") or config.get_main_option("sqlalchemy.url")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_item=render_item,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_url()
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_item=render_item,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
