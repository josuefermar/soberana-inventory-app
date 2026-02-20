from app.application.use_cases.user_managment.dto import UserListDto
from app.application.use_cases.user_managment.user_list_query import UserListQuery


class ListUsersUseCase:

    def __init__(self, user_list_query: UserListQuery):
        self.user_list_query = user_list_query

    def execute(self) -> list[UserListDto]:
        return self.user_list_query.list_all_with_warehouses()
