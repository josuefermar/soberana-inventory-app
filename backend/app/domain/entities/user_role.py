from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    WAREHOUSE_MANAGER = "WAREHOUSE_MANAGER"
    PROCESS_LEADER = "PROCESS_LEADER"