import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    const djangoBackendUrl = 'http://localhost:8004/api/csuite/analyze/'; // Ensure this port is correct

    // Forward the request to your Django backend using fetch
    const djangoResponse = await fetch(djangoBackendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream' // Request SSE from backend
      },
      body: JSON.stringify(body),
    });

    // Check if the backend responded successfully
    if (!djangoResponse.ok) {
      // If backend returned an error, try to pass it along
      const errorText = await djangoResponse.text();
      console.error(`Backend error: ${djangoResponse.status} ${djangoResponse.statusText}`, errorText);
      return new Response(
        JSON.stringify({ error: `Backend request failed: ${djangoResponse.statusText}`, details: errorText }),
        { status: djangoResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the response is actually a stream
    const contentType = djangoResponse.headers.get('content-type');
    if (!contentType || !contentType.includes('text/event-stream')) {
        console.error('Backend did not return an event stream. Content-Type:', contentType);
        // Handle as plain JSON if not a stream (or return error)
        const responseData = await djangoResponse.json(); 
        return NextResponse.json(responseData);
    }

    // Ensure the response body exists before creating the stream
    if (!djangoResponse.body) {
      throw new Error('Backend response body is null');
    }

    // Create a streaming response back to the client
    const stream = djangoResponse.body;
    return new Response(stream, {
      headers: { 
        'Content-Type': 'text/event-stream', 
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Error in Next.js API route:', error);
    // Ensure error is an Error instance for safer property access
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = error instanceof Error ? error.stack : JSON.stringify(error);
    
    return NextResponse.json(
      { error: 'Failed to process request in Next.js API', message: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}