from sqlalchemy import Table, Column, ForeignKey
from app.infrastructure.database.database import Base, GUID

user_warehouses = Table(
    "user_warehouses",
    Base.metadata,
    Column("user_id", GUID(), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("warehouse_id", GUID(), ForeignKey("warehouses.id", ondelete="CASCADE"), primary_key=True),
)
