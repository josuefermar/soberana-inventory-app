import os
from uuid import UUID

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session

from app.application.use_cases.sync_users_from_api import SyncUsersFromCorporateAPIUseCase
from app.application.use_cases.user_managment.create_user_case import CreateUserUseCase
from app.application.use_cases.user_managment.list_users_case import ListUsersUseCase
from app.application.use_cases.user_managment.update_user_case import UpdateUserUseCase
from app.domain.entities.user_role import UserRole
from app.infrastructure.external.random_user_client import RandomUserClient
from app.infrastructure.logging.logger import logger
from app.infrastructure.mock.corporate_users_faker import fetch_users as mock_fetch_users
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


MAX_RESULTS_PER_SYNC = 100


class SyncFromApiPayload(BaseModel):
    """Payload with raw results from randomuser.me API (e.g. fetched by frontend)."""

    results: list[dict]

    @field_validator("results")
    @classmethod
    def results_max_length(cls, v: list) -> list:
        if len(v) > MAX_RESULTS_PER_SYNC:
            raise ValueError(
                f"Maximum {MAX_RESULTS_PER_SYNC} results per sync. Received {len(v)}."
            )
        return v


class WarehouseRefResponse(BaseModel):
    id: str
    name: str


class UserResponse(BaseModel):
    id: str
    identification: str
    name: str
    email: str
    role: str
    warehouses: list[WarehouseRefResponse]
    is_active: bool

    @classmethod
    def from_user_list_dto(cls, dto):
        return cls(
            id=str(dto.id),
            identification=dto.identification,
            name=dto.name,
            email=dto.email,
            role=dto.role,
            warehouses=[
                WarehouseRefResponse(id=str(w.id), name=w.name)
                for w in dto.warehouses
            ],
            is_active=dto.is_active,
        )


def _get_corporate_users_fetcher():
    """Injection: USER_SYNC_MODE=mock uses Faker; external uses RandomUser API."""
    mode = (os.getenv("USER_SYNC_MODE") or "external").strip().lower()
    if mode == "mock":
        return mock_fetch_users
    client = RandomUserClient()
    return client.fetch_users


@router.post("/sync", response_model=SyncUsersResponse)
def sync_users(
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    """
    Sync users from corporate API. Fetcher chosen by USER_SYNC_MODE:
    - mock: Faker (internal, no external calls)
    - external: randomuser.me
    """
    repository = UserRepositoryImpl(db)
    fetcher = _get_corporate_users_fetcher()
    use_case = SyncUsersFromCorporateAPIUseCase(
        user_repository=repository,
        api_fetcher=fetcher,
    )
    try:
        created, fetched = use_case.execute(MAX_RESULTS_PER_SYNC)
    except httpx.HTTPError as e:
        logger.warning(
            "Sync users: external API failed",
            extra={"event": "sync_users_api_failed", "error": str(e)},
        )
        raise HTTPException(
            status_code=503,
            detail="No se pudo conectar con la API de usuarios. Comprueba USER_SYNC_MODE y red.",
        ) from e
    logger.info(
        "Sync users executed",
        extra={
            "event": "sync_users_executed",
            "users_created": created,
            "users_fetched": fetched,
            "user_id": _current_user.get("sub"),
        },
    )
    return SyncUsersResponse(users_created=created)


@router.post("/sync-from-api", response_model=SyncUsersResponse)
def sync_users_from_payload(
    payload: SyncFromApiPayload,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    """
    Accept raw results from randomuser.me (used by seed script at startup).
    """
    repository = UserRepositoryImpl(db)
    use_case = SyncUsersFromCorporateAPIUseCase(
        user_repository=repository,
        api_fetcher=lambda limit: {"results": []},
    )
    created, fetched = use_case.execute_from_results(payload.results)
    logger.info(
        "Sync users from API payload executed",
        extra={
            "event": "sync_users_from_api_payload_executed",
            "users_created": created,
            "users_fetched": fetched,
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
    dtos = use_case.execute()
    return [UserResponse.from_user_list_dto(dto) for dto in dtos]


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
    dto = repository.get_by_id_for_display(user.id)
    return UserResponse.from_user_list_dto(dto)


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID,
    request: UpdateUserRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    repository = UserRepositoryImpl(db)
    use_case = UpdateUserUseCase(repository)
    use_case.execute(
        user_id,
        identification=request.identification,
        name=request.name,
        email=request.email,
        role=request.role,
        password=request.password,
        warehouse_ids=request.warehouses,
        is_active=request.is_active,
    )
    dto = repository.get_by_id_for_display(user_id)
    return UserResponse.from_user_list_dto(dto)
