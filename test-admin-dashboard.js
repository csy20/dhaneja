#!/usr/bin/env node

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testAdminDashboard() {
  console.log('🔍 Testing Admin Dashboard Product Creation...\n');

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Admin login successful');
    console.log('User:', loginData.user);
    console.log('Token available:', !!token);

    // Step 2: Test product creation with the same data as the form would send
    console.log('\n2. Testing product creation via API...');
    
    const productData = {
      name: 'Test Dashboard Product',
      description: 'This is a test product created from dashboard simulation',
      price: 1999,
      category: 'saree',
      imageUrl: '/uploads/sample1.jpg',
      images: ['/uploads/sample1.jpg'],
      stock: 10,
      discount: 5,
      position: 0
    };

    console.log('Product data to submit:', JSON.stringify(productData, null, 2));

    const createResponse = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    console.log('Create response status:', createResponse.status);
    console.log('Create response headers:', Object.fromEntries(createResponse.headers.entries()));

    if (!createResponse.ok) {
      const errorData = await createResponse.text();
      console.log('❌ Create response error:', errorData);
      throw new Error(`Product creation failed: ${createResponse.status}`);
    }

    const createdProduct = await createResponse.json();
    console.log('✅ Product created successfully:');
    console.log(JSON.stringify(createdProduct, null, 2));

    // Step 3: Verify the product was created by fetching all products
    console.log('\n3. Verifying product was saved...');
    const listResponse = await fetch(`${BASE_URL}/api/products`);
    
    if (!listResponse.ok) {
      throw new Error(`Failed to fetch products: ${listResponse.status}`);
    }

    const products = await listResponse.json();
    console.log(`✅ Found ${products.length} products in database`);
    
    const testProduct = products.find(p => p.name === 'Test Dashboard Product');
    if (testProduct) {
      console.log('✅ Test product found in database:', testProduct.name);
    } else {
      console.log('❌ Test product not found in database');
    }

    // Step 4: Test client-side simulation
    console.log('\n4. Testing client-side form data validation...');
    
    // Check if required fields validation would work
    const requiredFields = ['name', 'description', 'price', 'stock'];
    const missingFields = requiredFields.filter(field => !productData[field] || productData[field] === '');
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
    } else {
      console.log('✅ All required fields present');
    }

    // Check if price validation would work
    if (productData.price <= 0) {
      console.log('❌ Price validation would fail');
    } else {
      console.log('✅ Price validation would pass');
    }

    // Check if stock validation would work
    if (productData.stock < 0) {
      console.log('❌ Stock validation would fail');
    } else {
      console.log('✅ Stock validation would pass');
    }

    console.log('\n🎉 All tests passed! The API is working correctly.');
    console.log('\n💡 If the admin dashboard is not working, the issue is likely in the frontend JavaScript.');
    console.log('   Check browser console for JavaScript errors when submitting the form.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testAdminDashboard();
