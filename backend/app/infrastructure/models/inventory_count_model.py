from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.infrastructure.database.database import Base, GUID


class InventoryCountModel(Base):
    __tablename__ = "inventory_counts"

    id = Column(GUID(), primary_key=True, index=True)
    session_id = Column(GUID(), ForeignKey("inventory_sessions.id"), nullable=False)
    product_id = Column(GUID(), ForeignKey("products.id"), nullable=False)
    quantity_packages = Column(Integer, nullable=False)
    quantity_units = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    session = relationship("InventorySessionModel", back_populates="counts")
