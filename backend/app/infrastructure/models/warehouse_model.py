from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.infrastructure.database.database import Base, GUID, utc_now
from app.infrastructure.models.associations import user_warehouses


class WarehouseModel(Base):
    __tablename__ = "warehouses"

    id = Column(GUID(), primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    status = Column(String, nullable=False)  # WarehouseStatus enum value
    status_description = Column(String, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    users = relationship(
        "UserModel",
        secondary=user_warehouses,
        back_populates="warehouses",
    )
    sessions = relationship("InventorySessionModel", back_populates="warehouse")
