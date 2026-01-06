from rest_framework import pagination


class DishPaginator(pagination.PageNumberPagination):
    page_size = 20
    max_page_size = 20