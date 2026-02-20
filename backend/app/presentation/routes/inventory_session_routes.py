from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
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
from app.application.use_cases.close_inventory_session_use_case import (
    CloseInventorySessionUseCase,
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
from app.infrastructure.repositories.user_repository_impl import (
    UserRepositoryImpl,
)
from app.presentation.dependencies.database import get_db
from app.presentation.dependencies.role_dependencies import require_roles
from app.presentation.dependencies.warehouse_dependencies import assert_warehouse_access
from app.presentation.schemas.inventory_count_schema import (
    CreateInventoryCountRequest,
    InventoryCountResponse,
    MeasureUnitSummary,
    ProductSummary,
)
from app.infrastructure.repositories.measurement_unit_repository_impl import (
    MeasurementUnitRepositoryImpl,
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
    current_user=Depends(require_roles([UserRole.ADMIN, UserRole.PROCESS_LEADER, UserRole.WAREHOUSE_MANAGER])),
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
    warehouse_ids = None
    if current_user.get("role") in (
        UserRole.WAREHOUSE_MANAGER.value,
        UserRole.PROCESS_LEADER.value,
    ):
        warehouse_ids = [UUID(w) for w in current_user.get("warehouses", [])]
    session_repo = InventorySessionRepositoryImpl(db)
    warehouse_repo = WarehouseRepositoryImpl(db)
    count_repo = InventoryCountRepositoryImpl(db)
    user_repo = UserRepositoryImpl(db)
    use_case = ListInventorySessionsUseCase(
        session_repo, warehouse_repo, count_repo, user_repo
    )
    summaries = use_case.execute(
        warehouse_id=warehouse_id,
        warehouse_ids=warehouse_ids,
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
            created_by_id=s.created_by_id,
            created_by_name=s.created_by_name,
            created_at=s.created_at,
            closed_at=s.closed_at,
            status="CLOSED" if s.closed_at else "OPEN",
            products_count=s.products_count,
        )
        for s in summaries
    ]


@router.get("/{session_id}", response_model=InventorySessionListResponse)
def get_inventory_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles([UserRole.ADMIN, UserRole.PROCESS_LEADER, UserRole.WAREHOUSE_MANAGER])
    ),
):
    """Get a single inventory session by id (for header/subtitle in Register Count, etc.)."""
    session_repo = InventorySessionRepositoryImpl(db)
    warehouse_repo = WarehouseRepositoryImpl(db)
    count_repo = InventoryCountRepositoryImpl(db)
    user_repo = UserRepositoryImpl(db)

    session = session_repo.get_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Inventory session not found")
    if current_user.get("role") in (
        UserRole.WAREHOUSE_MANAGER.value,
        UserRole.PROCESS_LEADER.value,
    ):
        assert_warehouse_access(current_user, session.warehouse_id)

    warehouse = warehouse_repo.get_by_id(session.warehouse_id)
    warehouse_description = warehouse.description if warehouse else ""
    products_count = count_repo.count_by_session(session_id)
    creator = user_repo.get_by_id(session.created_by)

    return InventorySessionListResponse(
        id=session.id,
        warehouse_id=session.warehouse_id,
        warehouse_description=warehouse_description,
        month=session.month,
        count_number=session.count_number,
        created_by_id=session.created_by,
        created_by_name=creator.name if creator else "",
        created_at=session.created_at,
        closed_at=session.closed_at,
        status="CLOSED" if session.closed_at else "OPEN",
        products_count=products_count,
    )


@router.post("/", response_model=InventorySessionResponse)
def create_inventory_session(
    request: CreateInventorySessionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles([UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER])),
):
    repository = InventorySessionRepositoryImpl(db)
    feature_flag_repo = FeatureFlagRepositoryImpl(db)
    feature_flag_service = FeatureFlagService(feature_flag_repo)
    use_case = CreateInventorySessionUseCase(repository, feature_flag_service)

    user_warehouse_ids = [UUID(w) for w in current_user.get("warehouses", [])]
    is_admin = current_user.get("role") == UserRole.ADMIN.value
    result = use_case.execute(
        warehouse_id=request.warehouse_id,
        month=request.month,
        created_by=request.created_by,
        user_warehouse_ids=user_warehouse_ids,
        is_admin=is_admin,
    )

    user_repo = UserRepositoryImpl(db)
    creator = user_repo.get_by_id(result.created_by)
    return InventorySessionResponse(
        id=result.id,
        warehouse_id=result.warehouse_id,
        month=result.month,
        count_number=result.count_number,
        created_by_id=result.created_by,
        created_by_name=creator.name if creator else None,
        created_at=result.created_at,
        closed_at=result.closed_at,
        status="CLOSED" if result.closed_at else "OPEN",
    )


@router.put("/{session_id}/close", response_model=InventorySessionResponse)
def close_inventory_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN])),
):
    """Close an inventory session. Only open sessions can be closed."""
    session_repo = InventorySessionRepositoryImpl(db)
    user_repo = UserRepositoryImpl(db)
    use_case = CloseInventorySessionUseCase(session_repo)
    result = use_case.execute(session_id)
    creator = user_repo.get_by_id(result.created_by)
    return InventorySessionResponse(
        id=result.id,
        warehouse_id=result.warehouse_id,
        month=result.month,
        count_number=result.count_number,
        created_by_id=result.created_by,
        created_by_name=creator.name if creator else None,
        created_at=result.created_at,
        closed_at=result.closed_at,
        status="CLOSED",
    )


@router.post("/{session_id}/products")
def add_session_products(
    session_id: UUID,
    request: AddSessionProductsRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles([UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER])),
):
    session_repo = InventorySessionRepositoryImpl(db)
    session = session_repo.get_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Inventory session not found")
    assert_warehouse_access(current_user, session.warehouse_id)
    count_repo = InventoryCountRepositoryImpl(db)
    product_repo = ProductRepositoryImpl(db)
    use_case = AddProductsToSessionUseCase(session_repo, count_repo, product_repo)
    added = use_case.execute(session_id, request.product_ids)
    return {"added": len(added)}


@router.get("/{session_id}/products", response_model=list)
def list_session_products(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles([UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER])),
):
    session_repo = InventorySessionRepositoryImpl(db)
    session = session_repo.get_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Inventory session not found")
    assert_warehouse_access(current_user, session.warehouse_id)
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
    unit_repo = MeasurementUnitRepositoryImpl(db)
    use_case = RegisterInventoryCountUseCase(session_repo, product_repo, count_repo)

    user_warehouse_ids = [UUID(w) for w in current_user.get("warehouses", [])]
    is_admin = current_user.get("role") == UserRole.ADMIN.value
    count = use_case.execute(
        session_id=session_id,
        product_id=request.product_id,
        packaging_quantity=request.packaging_quantity,
        user_warehouse_ids=user_warehouse_ids,
        is_admin=is_admin,
        measure_unit_id=request.measure_unit_id,
    )

    product = product_repo.get_by_id(count.product_id)
    measure_unit = unit_repo.get_by_id(count.measure_unit_id)
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
            conversion_factor=product.conversion_factor,
        )
        if product
        else ProductSummary(id=count.product_id, code="", description="", conversion_factor=1.0),
        measure_unit=MeasureUnitSummary(
            id=measure_unit.id,
            name=measure_unit.name,
            abbreviation=measure_unit.abbreviation,
        )
        if measure_unit
        else None,
        packaging_quantity=count.quantity_packages,
        total_units=count.quantity_units,
        created_at=count.created_at,
    )


@router.get("/{session_id}/counts", response_model=list[InventoryCountResponse])
def list_inventory_counts(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles([UserRole.ADMIN, UserRole.PROCESS_LEADER, UserRole.WAREHOUSE_MANAGER])
    ),
):
    session_repo = InventorySessionRepositoryImpl(db)
    session = session_repo.get_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Inventory session not found")
    if current_user.get("role") == UserRole.WAREHOUSE_MANAGER.value:
        assert_warehouse_access(current_user, session.warehouse_id)
    count_repo = InventoryCountRepositoryImpl(db)
    product_repo = ProductRepositoryImpl(db)
    unit_repo = MeasurementUnitRepositoryImpl(db)
    use_case = ListInventoryCountsUseCase(session_repo, count_repo)

    counts = use_case.execute(session_id)
    unit_ids = list({c.measure_unit_id for c in counts})
    units = {u.id: u for u in unit_repo.get_by_ids(unit_ids)}
    result = []
    for count in counts:
        product = product_repo.get_by_id(count.product_id)
        mu = units.get(count.measure_unit_id)
        result.append(
            InventoryCountResponse(
                product=ProductSummary(
                    id=product.id,
                    code=product.code,
                    description=product.description,
                    conversion_factor=product.conversion_factor,
                )
                if product
                else ProductSummary(id=count.product_id, code="", description="", conversion_factor=1.0),
                measure_unit=MeasureUnitSummary(
                    id=mu.id,
                    name=mu.name,
                    abbreviation=mu.abbreviation,
                )
                if mu
                else None,
                packaging_quantity=count.quantity_packages,
                total_units=count.quantity_units,
                created_at=count.created_at,
            )
        )
    return result
