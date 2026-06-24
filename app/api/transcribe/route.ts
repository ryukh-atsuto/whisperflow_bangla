import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('file');

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: 'No valid audio file provided in request' },
        { status: 400 }
      ) ;
    }

    // Prepare form data to send to Python server
    const backendFormData = new FormData();
    // Re-create the file blob with a filename to satisfy Python multipart parser
    backendFormData.append('file', audioFile, 'audio.wav');

    // Proxy request to Python backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000/transcribe';
    
    console.log(`Forwarding audio to backend: ${backendUrl}`);
    const response = await fetch(backendUrl, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend returned error status: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Transcription backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error in transcription API proxy route:', error);
    
    // Check if error is due to backend being offline
    if (error.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      return NextResponse.json(
        { error: 'Transcription backend is currently offline. Please start the Python backend server.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
