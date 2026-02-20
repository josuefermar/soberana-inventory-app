from sqlalchemy import Column, Boolean, DateTime, String

from app.infrastructure.database.database import Base, GUID, utc_now


class FeatureFlagModel(Base):
    __tablename__ = "feature_flags"

    id = Column(GUID(), primary_key=True, index=True)
    key = Column(String(255), unique=True, nullable=False, index=True)
    enabled = Column(Boolean, nullable=False, default=False)
    description = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)
