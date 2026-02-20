from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.infrastructure.database.database import Base, GUID, utc_now


class InventoryCountModel(Base):
    __tablename__ = "inventory_counts"

    id = Column(GUID(), primary_key=True, index=True)
    session_id = Column(GUID(), ForeignKey("inventory_sessions.id"), nullable=False)
    product_id = Column(GUID(), ForeignKey("products.id"), nullable=False)
    quantity_packages = Column(Integer, nullable=False)
    quantity_units = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    session = relationship("InventorySessionModel", back_populates="counts")

    __table_args__ = (
        UniqueConstraint("session_id", "product_id", name="uq_inventory_count_session_product"),
    )
