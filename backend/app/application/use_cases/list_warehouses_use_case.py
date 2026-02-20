from typing import List, Optional
from uuid import UUID

from app.domain.entities.warehouse import Warehouse
from app.domain.repositories.warehouse_repository import WarehouseRepository


class ListWarehousesUseCase:
    """List warehouses. If warehouse_ids is given, return only those (for WAREHOUSE_MANAGER)."""

    def __init__(self, repository: WarehouseRepository):
        self.repository = repository

    def execute(self, warehouse_ids: Optional[List[UUID]] = None) -> List[Warehouse]:
        if warehouse_ids is not None:
            return self.repository.list_by_ids(warehouse_ids)
        return self.repository.list_all()
