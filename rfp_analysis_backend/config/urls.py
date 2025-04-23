from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/rfp/", include("rfp.urls")),  # Include RFP API routes
    path('csuite/', include('csuite_analysis.urls')),
    path('api/csuite/', include('csuite_analysis.urls')),
    path('', include('modeldecision.urls')), 
]
