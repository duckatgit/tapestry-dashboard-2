from django.urls import path
from .views import get_company_info

urlpatterns = [
    path('api/company/<str:company_number>/', get_company_info),
]
