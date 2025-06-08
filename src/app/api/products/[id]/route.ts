import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { productDb } from '@/lib/mockDb';
import { verifyToken } from '@/lib/auth';

// GET a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let useMockDb = false;
  
  try {
    await dbConnect();
  } catch (_error) {
    console.log('Using mock database instead of MongoDB for products');
    useMockDb = true;
  }
  
  const { id } = await params;
  
  try {
    let product;
    if (useMockDb) {
      product = await productDb.findById(id);
    } else {
      try {
        product = await Product.findById(id);
      } catch (_error) {
        console.log('MongoDB query failed, falling back to mock database');
        product = await productDb.findById(id);
      }
    }
    
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
  let useMockDb = false;
  
  try {
    await dbConnect();
  } catch (_error) {
    console.log('Using mock database instead of MongoDB for products');
    useMockDb = true;
  }
  
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
    console.log('Updating product with data:', productData);
    
    let product;
    if (useMockDb) {
      product = await productDb.findByIdAndUpdate(id, productData);
    } else {
      try {
        product = await Product.findByIdAndUpdate(
          id,
          productData,
          { new: true, runValidators: true }
        );
      } catch (_error) {
        console.log('MongoDB update failed, falling back to mock database');
        product = await productDb.findByIdAndUpdate(id, productData);
      }
    }
    
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
  let useMockDb = false;
  
  try {
    await dbConnect();
  } catch (_error) {
    console.log('Using mock database instead of MongoDB for products');
    useMockDb = true;
  }
  
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
    
    let product;
    if (useMockDb) {
      product = await productDb.findByIdAndDelete(id);
    } else {
      try {
        product = await Product.findByIdAndDelete(id);
      } catch (_error) {
        console.log('MongoDB delete failed, falling back to mock database');
        product = await productDb.findByIdAndDelete(id);
      }
    }
    
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
