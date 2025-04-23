import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    // Forward the request to your Django backend
    const response = await axios.get('https://tapestry-dashboard-api.mmopro.in/api/csuite/folders/');
    
    // Return the response from the backend
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error forwarding request to backend:', error);
    
    // Provide fallback folders if the backend is unavailable
    const fallbackFolders = [
      { id: 'rhetorik', name: 'Rhetorik', path: './sample_data' }
    ];
    
    return NextResponse.json({ folders: fallbackFolders });
  }
} 