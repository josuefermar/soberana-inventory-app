from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.application.use_cases.list_products_use_case import ListProductsUseCase
from app.domain.entities.user_role import UserRole
from app.infrastructure.repositories.product_repository_impl import (
    ProductRepositoryImpl,
)
from app.presentation.dependencies.database import get_db
from app.presentation.dependencies.role_dependencies import require_roles
from app.presentation.schemas.product_schema import ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=list[ProductResponse])
def list_products(
    db: Session = Depends(get_db),
    _current_user=Depends(require_roles([UserRole.ADMIN, UserRole.WAREHOUSE_MANAGER])),
):
    repository = ProductRepositoryImpl(db)
    use_case = ListProductsUseCase(repository)
    products = use_case.execute()
    return [
        ProductResponse(id=p.id, code=p.code, description=p.description)
        for p in products
    ]
