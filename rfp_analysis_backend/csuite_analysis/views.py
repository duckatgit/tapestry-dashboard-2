from django.http import JsonResponse, StreamingHttpResponse
from rest_framework.response import Response
from .tasks import run_agent_analysis
from .questions import IC_Questions
import os
import json
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from tapestrysdk import fetch_library_data

@api_view(['GET', 'POST'])
def get_folders(request):
    """Return available folders for analysis"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            folder_id = data.get('folder_id')
            if not folder_id or not isinstance(folder_id, dict):
                return Response({'error': 'Invalid folder_id format'}, status=400)
            
            # Fetch folder data from Tapestry
            folder_data = fetch_library_data(request.headers.get('X-Tapestry-API-Key'), folder_id)
            if not folder_data:
                return Response({'error': 'Failed to fetch folder data'}, status=400)
            
            return Response({"folders": [folder_data]})
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    # GET request - return empty list as we now require folder_id
    return Response({"folders": []})

@csrf_exempt
def analyze(request):
    """Run the C-Suite analysis with provided questions and folder, streaming progress."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        questions = data.get('questions', IC_Questions)
        folder = data.get('folder')
        
        if not folder:
            return JsonResponse({'error': 'No folder provided'}, status=400)
            
        # Get folder data from Tapestry
        folder_data = fetch_library_data(request.headers.get('X-Tapestry-API-Key'), folder)
        if not folder_data:
            return JsonResponse({'error': 'Failed to fetch folder data'}, status=400)
            
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error processing request data: {str(e)}'}, status=400)
    
    # Define the generator for SSE
    def event_stream():
        analysis_generator = run_agent_analysis(questions=questions, folder=folder_data)
        for update in analysis_generator:
            yield f'data: {update}\n\n'

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    return response
