from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.application.services.feature_flag_service import FeatureFlagService
from app.application.use_cases.create_inventory_session_use_case import (
    CreateInventorySessionUseCase,
)
from app.application.use_cases.inventory import (
    ListInventoryCountsUseCase,
    RegisterInventoryCountUseCase,
)
from app.application.use_cases.add_products_to_session_use_case import (
    AddProductsToSessionUseCase,
)
from app.application.use_cases.list_inventory_sessions_use_case import (
    ListInventorySessionsUseCase,
)
from app.application.use_cases.list_session_products_from_counts_use_case import (
    ListSessionProductsFromCountsUseCase,
)
from app.domain.entities.user_role import UserRole
from app.infrastructure.logging.logger import logger
from app.infrastructure.repositories.feature_flag_repository_impl import (
    FeatureFlagRepositoryImpl,
)
from app.infrastructure.repositories.inventory_count_repository_impl import (
    InventoryCountRepositoryImpl,
)
from app.infrastructure.repositories.inventory_session_repository_impl import (
    InventorySessionRepositoryImpl,
)
from app.infrastructure.repositories.product_repository_impl import (
    ProductRepositoryImpl,
)
from app.infrastructure.repositories.warehouse_repository_impl import (
    WarehouseRepositoryImpl,
)
from app.presentation.dependencies.database import get_db
from app.presentation.dependencies.role_dependencies import require_roles
from app.presentation.schemas.inventory_count_schema import (
    CreateInventoryCountRequest,
    InventoryCountResponse,
    ProductSummary,
)
from app.presentation.schemas.inventory_session_schema import (
    AddSessionProductsRequest,
    CreateInventorySessionRequest,
    InventorySessionListResponse,
    InventorySessionResponse,
)

router = APIRouter(prefix="/inventory-sessions", tags=["Inventory Sessions"])


@router.get("/", response_model=list[InventorySessionListResponse])
def list_inventory_sessions(
    warehouse_id: UUID | None = Query(None),
    month: str | None = Query(None, description="YYYY-MM"),
    status: str | None = Query(None, description="open | closed"),
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    month_dt = None
    if month:
        try:
            parts = month.strip().split("-")
            if len(parts) == 2:
                y, m = int(parts[0]), int(parts[1])
                month_dt = datetime(y, m, 1, tzinfo=timezone.utc)
        except (ValueError, IndexError):
            pass
    session_repo = InventorySessionRepositoryImpl(db)
    warehouse_repo = WarehouseRepositoryImpl(db)
    count_repo = InventoryCountRepositoryImpl(db)
    use_case = ListInventorySessionsUseCase(
        session_repo, warehouse_repo, count_repo
    )
    summaries = use_case.execute(
        warehouse_id=warehouse_id,
        month=month_dt,
        status=status,
    )
    return [
        InventorySessionListResponse(
            id=s.id,
            warehouse_id=s.warehouse_id,
            warehouse_description=s.warehouse_description,
            month=s.month,
            count_number=s.count_number,
            created_at=s.created_at,
            closed_at=s.closed_at,
            products_count=s.products_count,
        )
        for s in summaries
    ]


@router.post("/", response_model=InventorySessionResponse)
def create_inventory_session(
    request: CreateInventorySessionRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER])),
):
    repository = InventorySessionRepositoryImpl(db)
    feature_flag_repo = FeatureFlagRepositoryImpl(db)
    feature_flag_service = FeatureFlagService(feature_flag_repo)
    use_case = CreateInventorySessionUseCase(repository, feature_flag_service)

    result = use_case.execute(
        warehouse_id=request.warehouse_id,
        month=request.month,
        created_by=request.created_by,
    )

    return InventorySessionResponse(
        id=result.id,
        warehouse_id=result.warehouse_id,
        month=result.month,
        count_number=result.count_number,
        created_by=result.created_by,
        created_at=result.created_at,
        closed_at=result.closed_at,
    )


@router.post("/{session_id}/products")
def add_session_products(
    session_id: UUID,
    request: AddSessionProductsRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER])),
):
    session_repo = InventorySessionRepositoryImpl(db)
    count_repo = InventoryCountRepositoryImpl(db)
    product_repo = ProductRepositoryImpl(db)
    use_case = AddProductsToSessionUseCase(session_repo, count_repo, product_repo)
    added = use_case.execute(session_id, request.product_ids)
    return {"added": len(added)}


@router.get("/{session_id}/products", response_model=list)
def list_session_products(
    session_id: UUID,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER])),
):
    session_repo = InventorySessionRepositoryImpl(db)
    count_repo = InventoryCountRepositoryImpl(db)
    product_repo = ProductRepositoryImpl(db)
    use_case = ListSessionProductsFromCountsUseCase(
        session_repo, count_repo, product_repo
    )
    items = use_case.execute(session_id)
    return [
        {"product_id": i.product_id, "code": i.code, "description": i.description}
        for i in items
    ]


@router.post("/{session_id}/counts", response_model=InventoryCountResponse)
def register_inventory_count(
    session_id: UUID,
    request: CreateInventoryCountRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles([UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER])),
):
    session_repo = InventorySessionRepositoryImpl(db)
    product_repo = ProductRepositoryImpl(db)
    count_repo = InventoryCountRepositoryImpl(db)
    use_case = RegisterInventoryCountUseCase(session_repo, product_repo, count_repo)

    user_warehouse_ids = [UUID(w) for w in current_user.get("warehouses", [])]
    is_admin = current_user.get("role") == UserRole.ADMIN.value
    count = use_case.execute(
        session_id=session_id,
        product_id=request.product_id,
        packaging_quantity=request.packaging_quantity,
        user_warehouse_ids=user_warehouse_ids,
        is_admin=is_admin,
    )

    product = product_repo.get_by_id(count.product_id)
    logger.info(
        "Inventory count created",
        extra={
            "event": "inventory_count_created",
            "session_id": str(session_id),
            "product_id": str(count.product_id),
            "packaging_quantity": count.quantity_packages,
            "total_units": count.quantity_units,
            "user_id": current_user.get("sub"),
        },
    )

    return InventoryCountResponse(
        product=ProductSummary(
            id=product.id,
            code=product.code,
            description=product.description,
        )
        if product
        else ProductSummary(id=count.product_id, code="", description=""),
        packaging_quantity=count.quantity_packages,
        total_units=count.quantity_units,
        created_at=count.created_at,
    )


@router.get("/{session_id}/counts", response_model=list[InventoryCountResponse])
def list_inventory_counts(
    session_id: UUID,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN, UserRole.PROCESS_LEADER])),
):
    session_repo = InventorySessionRepositoryImpl(db)
    count_repo = InventoryCountRepositoryImpl(db)
    product_repo = ProductRepositoryImpl(db)
    use_case = ListInventoryCountsUseCase(session_repo, count_repo)

    counts = use_case.execute(session_id)
    result = []
    for count in counts:
        product = product_repo.get_by_id(count.product_id)
        result.append(
            InventoryCountResponse(
                product=ProductSummary(
                    id=product.id,
                    code=product.code,
                    description=product.description,
                )
                if product
                else ProductSummary(id=count.product_id, code="", description=""),
                packaging_quantity=count.quantity_packages,
                total_units=count.quantity_units,
                created_at=count.created_at,
            )
        )
    return result
