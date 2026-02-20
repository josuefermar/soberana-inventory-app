from typing import List

from app.domain.entities.warehouse import Warehouse
from app.domain.repositories.warehouse_repository import WarehouseRepository


class ListWarehousesUseCase:
    """List all warehouses for admin (e.g. assignment to users or sessions)."""

    def __init__(self, repository: WarehouseRepository):
        self.repository = repository

    def execute(self) -> List[Warehouse]:
        return self.repository.list_all()
