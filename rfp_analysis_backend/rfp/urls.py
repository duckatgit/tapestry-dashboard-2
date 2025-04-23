from django.urls import path
from .views import (
    upload_pdf, 
    analyze_pdf, 
    analyze_documents,
    analyze_rfp, 
    generate_bid_matrix, 
    download_matrix, 
    chat_with_rfp,
    compare_indexes,
    download_report,
    cleanup_session,
    clear_session,
    check_model_limits
)

urlpatterns = [
    path('upload/', upload_pdf, name='upload_pdf'),
    path('analyze-pdf/', analyze_pdf, name='analyze_pdf'),
    path('analyze-documents/', analyze_documents, name='analyze_documents'),
    path('analyze-rfp/', analyze_rfp, name='analyze_rfp'),
    path('generate-matrix/<str:doc_id>/', generate_bid_matrix, name='generate_bid_matrix'),
    path('download-matrix/<str:doc_id>/', download_matrix, name='download_matrix'),
    path('chat/', chat_with_rfp, name='chat_with_rfp'),
    path('compare-indexes/', compare_indexes, name='compare_indexes'),
    path('download-report/', download_report, name='download_report'),
    path('cleanup-session/', cleanup_session, name='cleanup_session'),
    path('clear-session/', clear_session, name='clear_session'),
    path('check-model-limits/', check_model_limits, name='check-model-limits'),
]