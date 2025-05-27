import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/auth';

// GET a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  
  try {
    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT update a product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  
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
    
    const productData = await request.json();
    const product = await Product.findByIdAndUpdate(
      id,
      productData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE a product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await params;
  
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
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
