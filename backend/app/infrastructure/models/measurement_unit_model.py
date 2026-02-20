from sqlalchemy import Column, String, Boolean, DateTime, UniqueConstraint
from app.infrastructure.database.database import Base, GUID, utc_now


class MeasurementUnitModel(Base):
    __tablename__ = "measurement_units"
    __table_args__ = (
        UniqueConstraint("name", name="uq_measurement_units_name"),
        UniqueConstraint("abbreviation", name="uq_measurement_units_abbreviation"),
    )

    id = Column(GUID(), primary_key=True, index=True)
    name = Column(String, nullable=False)
    abbreviation = Column(String(10), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)
