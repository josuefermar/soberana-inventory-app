from sqlalchemy import Column, String, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.infrastructure.database.database import Base, GUID, utc_now


class ProductModel(Base):
    __tablename__ = "products"

    id = Column(GUID(), primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=False)
    inventory_unit_id = Column(GUID(), ForeignKey("measurement_units.id"), nullable=False)
    packaging_unit_id = Column(GUID(), ForeignKey("measurement_units.id"), nullable=False)
    conversion_factor = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    inventory_unit = relationship("MeasurementUnitModel", foreign_keys=[inventory_unit_id])
    packaging_unit = relationship("MeasurementUnitModel", foreign_keys=[packaging_unit_id])
