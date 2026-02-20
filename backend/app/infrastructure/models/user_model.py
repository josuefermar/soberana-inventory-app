from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.infrastructure.database.database import Base, GUID
from app.infrastructure.models.associations import user_warehouses


class UserModel(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, index=True)
    identification = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # nullable for existing rows; require on create
    role = Column(String, nullable=False)  # UserRole enum value
    is_active = Column(Boolean, default=True, nullable=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    warehouses = relationship(
        "WarehouseModel",
        secondary=user_warehouses,
        back_populates="users",
    )
