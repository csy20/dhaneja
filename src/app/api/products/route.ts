import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import { productDb } from '@/lib/mockDb';
import { verifyToken } from '@/lib/auth';

// GET all products
export async function GET(request: NextRequest) {
  let useMockDb = false;
  
  try {
    await dbConnect();
  } catch (_error) {
    console.log('Using mock database instead of MongoDB for products');
    useMockDb = true;
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let query = {};
    if (category && category !== 'all') {
      query = { category };
    }
    
    let products;
    if (useMockDb) {
      products = await productDb.find(query);
    } else {
      try {
        products = await Product.find(query);
      } catch (_error) {
        console.log('MongoDB query failed, falling back to mock database');
        products = await productDb.find(query);
      }
    }
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST a new product (admin only)
export async function POST(request: NextRequest) {
  let useMockDb = false;
  
  try {
    await dbConnect();
  } catch (_error) {
    console.log('Using mock database instead of MongoDB for products');
    useMockDb = true;
  }
  
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
    console.log('Creating product with data:', productData);
    
    let product;
    if (useMockDb) {
      product = await productDb.create(productData);
      console.log('Product created in mock database:', product);
    } else {
      try {
        const mongoProduct = new Product(productData);
        product = await mongoProduct.save();
        console.log('Product created in MongoDB:', product);
      } catch (mongoError) {
        console.log('MongoDB save failed, falling back to mock database:', mongoError);
        product = await productDb.create(productData);
        console.log('Product created in mock database (fallback):', product);
      }
    }
    
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
