from django.urls import path
from .views import analyze, get_folders

urlpatterns = [
    path('analyze/', analyze, name='analyze'),
    path('folders/', get_folders, name='csuite_folders'),
]