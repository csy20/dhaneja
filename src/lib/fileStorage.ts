// This is a utility file that helps with file operations in a way that works both in development and production
import fs from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Helper to check if we're in production (Vercel)
export const isProduction = process.env.NODE_ENV === 'production';

// Get the upload directory path
export const getUploadsDir = () => {
  const publicDir = join(process.cwd(), 'public');
  return join(publicDir, 'uploads');
};

// Ensure uploads directory exists
export const ensureUploadsDir = async () => {
  const uploadsDir = getUploadsDir();
  
  if (!fs.existsSync(uploadsDir)) {
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating uploads directory:', error);
      throw new Error('Failed to create uploads directory');
    }
  }
  
  return uploadsDir;
};

// Save file to uploads directory
export const saveFile = async (buffer: Buffer, fileName: string) => {
  const uploadsDir = await ensureUploadsDir();
  const filePath = join(uploadsDir, fileName);
  
  try {
    await writeFile(filePath, buffer);
    return `/uploads/${fileName}`; // Return the relative URL
  } catch (error) {
    console.error('Error writing file:', error);
    throw new Error('Failed to save file');
  }
};

// Generate a unique filename
export const generateUniqueFileName = (originalName: string) => {
  const timestamp = Date.now();
  const cleanName = originalName.replaceAll(' ', '_').toLowerCase();
  return `${timestamp}-${cleanName}`;
};

// For Vercel environment, this would be replaced with S3, Cloudinary, etc.
// This is a placeholder for future implementation
export const saveToCloudStorage = async (buffer: Buffer, fileName: string) => {
  if (isProduction) {
    // Future implementation: Upload to S3 or Cloudinary
    // For now, we'll still use local file system (with warning)
    console.warn('Production file storage not configured. Using local storage, which may not persist.');
    const filePath = await saveFile(buffer, fileName);
    return filePath;
  }
  
  // In development, use local filesystem
  const filePath = await saveFile(buffer, fileName);
  console.log(`File saved to: ${filePath}`);
  return filePath;
};
