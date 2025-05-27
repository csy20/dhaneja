import { NextRequest, NextResponse } from 'next/server';
import { initializeAdmin, userDb } from '@/lib/mockDb';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

// This endpoint will check if admin exists, and if not, create one
export async function GET(_request: NextRequest) {
  let useMockDb = false;
  
  try {
    await dbConnect();
  } catch (_error) {
    console.log('Using mock database instead of MongoDB');
    useMockDb = true;
  }

  try {
    // Initialize the admin user if needed
    if (useMockDb) {
      await initializeAdmin();

      // Check if admin exists in mock DB
      const adminEmail = process.env.ADMIN_EMAIL || 'jageshwarsahu910@gmail.com';
      const admin = await userDb.findOne({ email: adminEmail });
      
      if (admin) {
        return NextResponse.json({ 
          message: 'Admin user exists', 
          adminEmail,
          exists: true 
        });
      }
    } else {
      // Check if admin exists in MongoDB
      const adminEmail = process.env.ADMIN_EMAIL || 'jageshwarsahu910@gmail.com';
      const admin = await User.findOne({ email: adminEmail });
      
      if (admin) {
        return NextResponse.json({ 
          message: 'Admin user exists', 
          adminEmail,
          exists: true 
        });
      }
    }
    
    return NextResponse.json({ 
      message: 'Admin user could not be verified',
      exists: false
    });
  } catch (error) {
    console.error('Error checking admin:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}
