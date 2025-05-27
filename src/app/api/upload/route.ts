import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { generateUniqueFileName, saveToCloudStorage } from '@/lib/fileStorage';

export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json(
        { error: 'Not authorized as admin' },
        { status: 403 }
      );
    }

    // Process form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file received' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique file name
    const fileName = generateUniqueFileName(file.name);
    
    // Save file using our storage utility
    try {
      await saveToCloudStorage(buffer, fileName);
    
      // Return the path to the file
      return NextResponse.json({ 
        success: true, 
        filePath: `/uploads/${fileName}` 
      });
    } catch (uploadError) {
      console.error("Error saving file to cloud storage:", uploadError);
      return NextResponse.json(
        { error: 'Error saving file to cloud storage' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
