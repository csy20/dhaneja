import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { userDb } from '@/lib/mockDb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
  } catch (error) {
    console.log('Using mock database instead of MongoDB');
    // We'll use the mock database if MongoDB connection fails
  }

  try {
    const { email, password } = await request.json();

    // Check if user exists - try MongoDB first, then mock DB
    let user;
    try {
      user = await User.findOne({ email });
    } catch (error) {
      console.log('Falling back to mock database for login');
      user = await userDb.findOne({ email });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 400 }
      );
    }

    // Create JWT token
    // Ensure user has an _id field (could be MongoDB ObjectId or our custom string id)
    const userId = user._id?.toString() || user.id?.toString();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { userId, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
