from sqlalchemy import Column, String, Boolean, DateTime
from datetime import datetime
from app.infrastructure.database.database import Base, GUID


class MeasurementUnitModel(Base):
    __tablename__ = "measurement_units"

    id = Column(GUID(), primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
