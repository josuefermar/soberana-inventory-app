from uuid import UUID
from datetime import datetime, timezone
from typing import Optional, List, cast
from sqlalchemy.orm import Session

from app.domain.entities.inventory_session import InventorySession
from app.domain.exceptions.business_exceptions import NotFoundException
from app.domain.repositories.inventory_session_repository import InventorySessionRepository
from app.infrastructure.models.inventory_session_model import InventorySessionModel

class InventorySessionRepositoryImpl(InventorySessionRepository):

    def __init__(self, db: Session):
        self.db = db

    def save(self, session: InventorySession) -> InventorySession:
        db_session = InventorySessionModel(
            id=session.id,
            warehouse_id=session.warehouse_id,
            month=session.month,
            count_number=session.count_number,
            created_by=session.created_by,
            created_at=session.created_at,
            closed_at=session.closed_at
        )
        self.db.add(db_session)
        self.db.commit()
        self.db.refresh(db_session)

        return self._to_domain(db_session)

    def update(self, session: InventorySession) -> InventorySession:
        db_session = (
            self.db.query(InventorySessionModel)
            .filter(InventorySessionModel.id == session.id)
            .first()
        )
        if not db_session:
            raise NotFoundException("Inventory session not found")
        db_session.closed_at = session.closed_at
        self.db.commit()
        self.db.refresh(db_session)
        return self._to_domain(db_session)

    def get_by_id(self, session_id: UUID) -> Optional[InventorySession]:
        db_session = (
            self.db.query(InventorySessionModel)
            .filter(InventorySessionModel.id == session_id)
            .first()
        )

        if not db_session:
            return None
        
        return self._to_domain(db_session)

    def list_by_warehouse(self, warehouse_id: UUID) -> List[InventorySession]:
        db_sessions = (
            self.db.query(InventorySessionModel)
            .filter(InventorySessionModel.warehouse_id == warehouse_id)
            .all()
        )
        return [self._to_domain(db_session) for db_session in db_sessions]

    def list_filtered(
        self,
        warehouse_id: Optional[UUID] = None,
        month: Optional[datetime] = None,
        status: Optional[str] = None,
    ) -> List[InventorySession]:
        q = self.db.query(InventorySessionModel)
        if warehouse_id is not None:
            q = q.filter(InventorySessionModel.warehouse_id == warehouse_id)
        if month is not None:
            from calendar import monthrange
            from datetime import timedelta
            month_utc = month if month.tzinfo else month.replace(tzinfo=timezone.utc)
            start = month_utc.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            ndays = monthrange(start.year, start.month)[1]
            end = start + timedelta(days=ndays)
            q = q.filter(
                InventorySessionModel.month >= start,
                InventorySessionModel.month < end,
            )
        if status == "open":
            q = q.filter(InventorySessionModel.closed_at.is_(None))
        elif status == "closed":
            q = q.filter(InventorySessionModel.closed_at.isnot(None))
        q = q.order_by(InventorySessionModel.created_at.desc())
        return [self._to_domain(m) for m in q.all()]

    def _to_domain(self, model: InventorySessionModel) -> InventorySession:
        return InventorySession(
            id=cast(UUID, model.id),
            warehouse_id=cast(UUID, model.warehouse_id),
            month=cast(datetime, model.month),
            count_number=cast(int, model.count_number),
            created_by=cast(UUID, model.created_by),
            created_at=cast(datetime, model.created_at),
            closed_at=cast(Optional[datetime], model.closed_at),
        )
    

