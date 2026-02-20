from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.application.use_cases.create_inventory_session_use_case import (
    CreateInventorySessionUseCase,
)
from app.application.use_cases.inventory import (
    ListInventoryCountsUseCase,
    RegisterInventoryCountUseCase,
)
from app.domain.entities.user_role import UserRole
from app.infrastructure.logging.logger import logger
from app.infrastructure.repositories.inventory_count_repository_impl import (
    InventoryCountRepositoryImpl,
)
from app.infrastructure.repositories.inventory_session_repository_impl import (
    InventorySessionRepositoryImpl,
)
from app.infrastructure.repositories.product_repository_impl import (
    ProductRepositoryImpl,
)
from app.presentation.dependencies.database import get_db
from app.presentation.dependencies.role_dependencies import require_roles
from app.presentation.schemas.inventory_count_schema import (
    CreateInventoryCountRequest,
    InventoryCountResponse,
    ProductSummary,
)
from app.presentation.schemas.inventory_session_schema import (
    CreateInventorySessionRequest,
    InventorySessionResponse,
)

router = APIRouter(prefix="/inventory-sessions", tags=["Inventory Sessions"])


@router.post("/", response_model=InventorySessionResponse)
def create_inventory_session(
    request: CreateInventorySessionRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER])),
):
    repository = InventorySessionRepositoryImpl(db)
    use_case = CreateInventorySessionUseCase(repository)

    result = use_case.execute(
        warehouse_id=request.warehouse_id,
        month=request.month,
        count_number=request.count_number,
        created_by=request.created_by,
    )

    return result


@router.post("/{session_id}/counts", response_model=InventoryCountResponse)
def register_inventory_count(
    session_id: UUID,
    request: CreateInventoryCountRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles([UserRole.WAREHOUSE_MANAGER])),
):
    session_repo = InventorySessionRepositoryImpl(db)
    product_repo = ProductRepositoryImpl(db)
    count_repo = InventoryCountRepositoryImpl(db)
    use_case = RegisterInventoryCountUseCase(session_repo, product_repo, count_repo)

    user_warehouse_ids = [UUID(w) for w in current_user.get("warehouses", [])]
    count = use_case.execute(
        session_id=session_id,
        product_id=request.product_id,
        packaging_quantity=request.packaging_quantity,
        user_warehouse_ids=user_warehouse_ids,
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
