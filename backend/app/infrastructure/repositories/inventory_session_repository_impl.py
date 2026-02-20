from uuid import UUID
from datetime import datetime
from typing import Optional, List, cast
from sqlalchemy.orm import Session

from app.domain.entities.inventory_session import InventorySession
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
    

