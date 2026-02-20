from datetime import datetime
from typing import Optional, cast
from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.domain.entities.user import User
from app.domain.entities.user_role import UserRole
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.models.user_model import UserModel
from app.infrastructure.models.warehouse_model import WarehouseModel


class UserRepositoryImpl(UserRepository):

    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> Optional[User]:
        model = (
            self.db.query(UserModel)
            .options(joinedload(UserModel.warehouses))
            .filter(UserModel.email == email)
            .first()
        )
        if not model:
            return None
        return self._to_domain(model)

    def get_by_id(self, user_id: UUID) -> Optional[User]:
        model = (
            self.db.query(UserModel)
            .options(joinedload(UserModel.warehouses))
            .filter(UserModel.id == user_id)
            .first()
        )
        if not model:
            return None
        return self._to_domain(model)

    def get_by_ids(self, user_ids: list[UUID]) -> list[User]:
        if not user_ids:
            return []
        models = (
            self.db.query(UserModel)
            .filter(UserModel.id.in_(user_ids))
            .all()
        )
        return [self._to_domain(m) for m in models]

    def list_all(self) -> list[User]:
        models = (
            self.db.query(UserModel)
            .options(joinedload(UserModel.warehouses))
            .order_by(UserModel.created_at.desc())
            .all()
        )
        return [self._to_domain(m) for m in models]

    def create(self, user: User) -> User:
        warehouse_models = (
            self.db.query(WarehouseModel)
            .filter(WarehouseModel.id.in_(user.warehouses))
            .all()
        ) if user.warehouses else []
        model = UserModel(
            id=user.id,
            identification=user.identification,
            name=user.name,
            email=user.email,
            role=user.role.value,
            hashed_password=user.hashed_password,
            is_active=user.is_active,
            last_login=user.last_login,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )
        model.warehouses = warehouse_models
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def update(self, user: User) -> Optional[User]:
        model = self.db.query(UserModel).filter(UserModel.id == user.id).first()
        if not model:
            return None
        warehouse_models = (
            self.db.query(WarehouseModel)
            .filter(WarehouseModel.id.in_(user.warehouses))
            .all()
        ) if user.warehouses else []
        model.identification = user.identification  # type: ignore[assignment]
        model.name = user.name  # type: ignore[assignment]
        model.email = user.email  # type: ignore[assignment]
        model.role = user.role.value  # type: ignore[assignment]
        model.hashed_password = user.hashed_password  # type: ignore[assignment]
        model.warehouses = warehouse_models
        model.is_active = user.is_active  # type: ignore[assignment]
        model.last_login = user.last_login  # type: ignore[assignment]
        self.db.commit()
        self.db.refresh(model)
        return self._to_domain(model)

    def count(self) -> int:
        return self.db.query(UserModel).count()

    def _to_domain(self, model: UserModel) -> User:
        return User(
            id=cast(UUID, model.id),
            identification=cast(str, model.identification),
            name=cast(str, model.name),
            email=cast(str, model.email),
            role=UserRole(cast(str, model.role)),
            hashed_password=cast(Optional[str], model.hashed_password),
            warehouses=[cast(UUID, w.id) for w in model.warehouses],
            is_active=cast(bool, model.is_active),
            last_login=cast(Optional[datetime], model.last_login),
            created_at=cast(datetime, model.created_at),
            updated_at=cast(datetime, model.updated_at),
        )