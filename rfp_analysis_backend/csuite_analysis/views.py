from django.http import JsonResponse, StreamingHttpResponse
from rest_framework.response import Response
from .tasks import run_agent_analysis
from .dummy_data import folder_list_raw_dummy, local_folders
from .questions import IC_Questions
import os
import json
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view

@api_view(['GET'])
def get_folders(request):
    """Return available folders for analysis"""
    # Check if the folders exist in the filesystem
    valid_folders = []
    for folder in local_folders:
        # Convert relative path to absolute path
        abs_path = os.path.abspath(folder["path"])
        if os.path.exists(abs_path):
            folder_with_abs_path = folder.copy()
            folder_with_abs_path["abs_path"] = abs_path
            valid_folders.append(folder_with_abs_path)
        else:
            # If folder doesn't exist, create it
            try:
                os.makedirs(abs_path, exist_ok=True)
                folder_with_abs_path = folder.copy()
                folder_with_abs_path["abs_path"] = abs_path
                valid_folders.append(folder_with_abs_path)
            except Exception as e:
                print(f"Error creating folder {abs_path}: {str(e)}")
    
    return Response({"folders": valid_folders})

@csrf_exempt
def analyze(request):
    """Run the C-Suite analysis with provided questions and folder, streaming progress."""
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)
        
    try:
        data = json.loads(request.body)
        questions = data.get('questions', IC_Questions)
        folder = data.get('folder')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON in request body'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error processing request data: {str(e)}'}, status=400)

    # If folder is an object with an id, extract the folder data
    if isinstance(folder, dict) and 'id' in folder:
        folder_id = folder['id']
        # Find the matching folder in local_folders
        folder_data = next((f for f in local_folders if f['id'] == folder_id), None)
        if folder_data:
            # Use the absolute path if available
            if 'abs_path' in folder:
                folder_path = folder['abs_path']
            else:
                folder_path = os.path.abspath(folder_data['path'])
            
            # For now, still use dummy data for analysis
            # In a real implementation, you would use the folder_path
            folder_data = folder_list_raw_dummy
        else:
            folder_data = folder_list_raw_dummy
    else:
        folder_data = folder_list_raw_dummy
    
    # Define the generator for SSE
    def event_stream():
        analysis_generator = run_agent_analysis(questions=questions, folder=folder_data)
        for update in analysis_generator:
            # update is already a JSON string from the generator
            yield f'data: {update}\n\n'
        # Optionally, send a final 'done' event if needed, though 'complete' type handles it
        # yield 'event: done\ndata: {}\n\n'

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    return response
