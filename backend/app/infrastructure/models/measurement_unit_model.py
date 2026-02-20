from sqlalchemy import Column, String, Boolean, DateTime
from app.infrastructure.database.database import Base, GUID, utc_now


class MeasurementUnitModel(Base):
    __tablename__ = "measurement_units"

    id = Column(GUID(), primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)
