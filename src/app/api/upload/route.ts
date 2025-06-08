import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { generateUniqueFileName, saveToCloudStorage } from '@/lib/fileStorage';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request received');

    // Verify admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('No authorization header found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.isAdmin) {
      console.log('Not authorized as admin');
      return NextResponse.json(
        { error: 'Not authorized as admin' },
        { status: 403 }
      );
    }

    console.log('Admin verification successful');

    // Process form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file received in request');
      return NextResponse.json(
        { error: 'No file received' },
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      console.log(`Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.log(`File too large: ${file.size} bytes`);
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique file name
    const fileName = generateUniqueFileName(file.name);
    console.log(`Generated filename: ${fileName}`);
    
    // Save file using our storage utility
    try {
      const filePath = await saveToCloudStorage(buffer, fileName);
      console.log(`File saved successfully: ${filePath}`);
    
      // Return the path to the file
      return NextResponse.json({ 
        success: true, 
        filePath: filePath,
        originalName: file.name,
        size: file.size
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
