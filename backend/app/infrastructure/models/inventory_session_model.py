from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.infrastructure.database.database import Base, GUID


class InventorySessionModel(Base):
    __tablename__ = "inventory_sessions"

    id = Column(GUID(), primary_key=True, index=True)
    warehouse_id = Column(GUID(), ForeignKey("warehouses.id"), nullable=False)
    month = Column(DateTime, nullable=False)
    count_number = Column(Integer, nullable=False)
    created_by = Column(GUID(), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    closed_at = Column(DateTime, nullable=True)

    warehouse = relationship("WarehouseModel", back_populates="sessions")
    counts = relationship("InventoryCountModel", back_populates="session")

    __table_args__ = (
        UniqueConstraint("warehouse_id", "month", "count_number", name="uq_inventory_session"),
    )
