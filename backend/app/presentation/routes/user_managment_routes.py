from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.application.use_cases.sync_users_from_api import SyncUsersFromCorporateAPIUseCase
from app.application.use_cases.user_managment.create_user_case import CreateUserUseCase
from app.application.use_cases.user_managment.list_users_case import ListUsersUseCase
from app.application.use_cases.user_managment.update_user_case import UpdateUserUseCase
from app.domain.entities.user_role import UserRole
from app.infrastructure.external.random_user_client import RandomUserClient
from app.infrastructure.logging.logger import logger
from app.infrastructure.repositories.user_repository_impl import UserRepositoryImpl
from app.presentation.dependencies.database import get_db
from app.presentation.dependencies.role_dependencies import require_roles


router = APIRouter(prefix="/users", tags=["Users"])


class CreateUserRequest(BaseModel):
    identification: str
    name: str
    email: str
    role: str
    password: str
    warehouses: list[str]


class UpdateUserRequest(BaseModel):
    identification: str | None = None
    name: str | None = None
    email: str | None = None
    role: str | None = None
    password: str | None = None
    warehouses: list[str] | None = None
    is_active: bool | None = None


class SyncUsersResponse(BaseModel):
    users_created: int


class UserResponse(BaseModel):
    id: str
    identification: str
    name: str
    email: str
    role: str
    warehouses: list[str]
    is_active: bool

    @classmethod
    def from_user(cls, user):
        return cls(
            id=str(user.id),
            identification=user.identification,
            name=user.name,
            email=user.email,
            role=user.role.value,
            warehouses=[str(w) for w in user.warehouses],
            is_active=user.is_active,
        )


@router.post("/sync", response_model=SyncUsersResponse)
def sync_users(
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    repository = UserRepositoryImpl(db)
    client = RandomUserClient()
    use_case = SyncUsersFromCorporateAPIUseCase(
        user_repository=repository,
        api_fetcher=lambda limit: client.fetch_users(limit),
    )
    created = use_case.execute(100)
    logger.info(
        "Sync users endpoint executed",
        extra={
            "event": "sync_users_executed",
            "users_created": created,
            "user_id": _current_user.get("sub"),
        },
    )
    return SyncUsersResponse(users_created=created)


@router.get("/", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    repository = UserRepositoryImpl(db)
    use_case = ListUsersUseCase(repository)
    users = use_case.execute()
    return [UserResponse.from_user(u) for u in users]


@router.post("/", response_model=UserResponse)
def create_user(
    request: CreateUserRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    repository = UserRepositoryImpl(db)
    use_case = CreateUserUseCase(repository)
    user = use_case.execute(
        request.identification,
        request.name,
        request.email,
        request.role,
        request.password,
        request.warehouses,
    )
    return UserResponse.from_user(user)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    request: UpdateUserRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    repository = UserRepositoryImpl(db)
    use_case = UpdateUserUseCase(repository)
    user = use_case.execute(
        user_id,
        identification=request.identification,
        name=request.name,
        email=request.email,
        role=request.role,
        password=request.password,
        warehouse_ids=request.warehouses,
        is_active=request.is_active,
    )
    return UserResponse.from_user(user)
