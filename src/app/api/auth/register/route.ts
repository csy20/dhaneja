import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { userDb } from '@/lib/mockDb';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  let useMockDb = false;
  
  try {
    await dbConnect();
  } catch (_error) {
    console.log('Using mock database instead of MongoDB');
    useMockDb = true;
  }

  try {
    const { name, email, password } = await request.json();

    // Check if user already exists
    let existingUser;
    try {
      existingUser = useMockDb ? 
        await userDb.findOne({ email }) : 
        await User.findOne({ email });
    } catch (_error) {
      console.log('Falling back to mock database for user check');
      existingUser = await userDb.findOne({ email });
      useMockDb = true;
    }
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if this is the admin email
    const isAdmin = email === process.env.ADMIN_EMAIL;

    if (useMockDb) {
      // Create new user in mock DB
      await userDb.create({
        name,
        email,
        password: hashedPassword,
        isAdmin,
      });
    } else {
      // Create new user in MongoDB
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        isAdmin,
      });
      await newUser.save();
    }

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
