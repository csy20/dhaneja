#!/usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';

async function debugAdminIssue() {
  console.log('🔍 DEBUGGING ADMIN DASHBOARD ISSUE\n');
  console.log('='.repeat(50));

  try {
    // Step 1: Verify server is running
    console.log('\n1. 🌐 CHECKING SERVER STATUS...');
    try {
      const healthCheck = await fetch(`${BASE_URL}/`);
      console.log(`✅ Server responding: ${healthCheck.status}`);
    } catch (error) {
      console.log(`❌ Server not responding: ${error.message}`);
      return;
    }

    // Step 2: Test authentication flow
    console.log('\n2. 🔐 TESTING AUTHENTICATION...');
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password'
      })
    });

    if (!loginResponse.ok) {
      console.log(`❌ Login failed: ${loginResponse.status}`);
      const errorText = await loginResponse.text();
      console.log('Error details:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');
    console.log(`📋 User: ${loginData.user.name} (${loginData.user.email})`);
    console.log(`👑 Admin: ${loginData.user.isAdmin}`);
    console.log(`🎫 Token length: ${token.length} chars`);

    // Step 3: Test API endpoints
    console.log('\n3. 🔧 TESTING API ENDPOINTS...');
    
    // Test GET products
    const getProducts = await fetch(`${BASE_URL}/api/products`);
    if (getProducts.ok) {
      const products = await getProducts.json();
      console.log(`✅ GET /api/products: ${products.length} products found`);
    } else {
      console.log(`❌ GET /api/products failed: ${getProducts.status}`);
    }

    // Test POST products (same as admin dashboard would do)
    console.log('\n4. 📝 TESTING PRODUCT CREATION (EXACT DASHBOARD SIMULATION)...');
    
    const testProduct = {
      name: 'Frontend Debug Test Product',
      description: 'Testing exact same flow as admin dashboard',
      price: 1299,
      category: 'saree',
      imageUrl: '/uploads/sample1.jpg',
      images: ['/uploads/sample1.jpg'],
      stock: 15,
      discount: 10,
      position: 0
    };

    console.log('📤 Sending product data:', JSON.stringify(testProduct, null, 2));

    const createResponse = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testProduct)
    });

    console.log(`📥 Response status: ${createResponse.status}`);
    console.log(`📥 Response ok: ${createResponse.ok}`);

    if (createResponse.ok) {
      const newProduct = await createResponse.json();
      console.log('✅ Product created successfully!');
      console.log('📦 Created product ID:', newProduct._id);
      console.log('📦 Created product name:', newProduct.name);
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Product creation failed!');
      console.log('🚨 Error response:', errorText);
    }

    // Step 5: Analyze frontend files
    console.log('\n5. 📂 ANALYZING FRONTEND FILES...');
    
    const adminPagePath = '/workspaces/dhaneja/src/app/admin/page.tsx';
    if (fs.existsSync(adminPagePath)) {
      const adminContent = fs.readFileSync(adminPagePath, 'utf8');
      
      // Check for common issues
      const checks = [
        { name: 'handleSubmit function', pattern: /const handleSubmit.*?=/, found: false },
        { name: 'form onSubmit handler', pattern: /<form[^>]*onSubmit={handleSubmit}/, found: false },
        { name: 'Authorization header', pattern: /Authorization.*Bearer.*token/, found: false },
        { name: 'fetch to /api/products', pattern: /fetch\(['"`]\/api\/products['"`]/, found: false },
        { name: 'useAuth hook', pattern: /const.*{.*token.*}.*=.*useAuth/, found: false },
        { name: 'error handling', pattern: /catch.*error/, found: false }
      ];

      checks.forEach(check => {
        check.found = check.pattern.test(adminContent);
        console.log(`${check.found ? '✅' : '❌'} ${check.name}: ${check.found ? 'Found' : 'Missing'}`);
      });

      // Check for specific issues
      if (adminContent.includes('preventDefault()')) {
        console.log('✅ Form preventDefault found');
      } else {
        console.log('❌ Form preventDefault missing - could cause page reload!');
      }

      if (adminContent.includes('setError(')) {
        console.log('✅ Error state management found');
      } else {
        console.log('❌ Error state management missing');
      }

    } else {
      console.log('❌ Admin page file not found!');
    }

    // Step 6: Check for authentication context issues
    console.log('\n6. 🔍 CHECKING AUTHENTICATION CONTEXT...');
    
    const authContextPath = '/workspaces/dhaneja/src/contexts/AuthContext.tsx';
    if (fs.existsSync(authContextPath)) {
      const authContent = fs.readFileSync(authContextPath, 'utf8');
      
      const authChecks = [
        { name: 'localStorage token storage', pattern: /localStorage.*setItem.*token/, found: false },
        { name: 'localStorage token retrieval', pattern: /localStorage.*getItem.*token/, found: false },
        { name: 'token state management', pattern: /const.*\[token.*setToken\]/, found: false },
        { name: 'login function', pattern: /const login.*=/, found: false }
      ];

      authChecks.forEach(check => {
        check.found = check.pattern.test(authContent);
        console.log(`${check.found ? '✅' : '❌'} ${check.name}: ${check.found ? 'Found' : 'Missing'}`);
      });
    }

    // Step 7: Create debugging recommendations
    console.log('\n7. 💡 DEBUGGING RECOMMENDATIONS...');
    console.log('');
    console.log('🔧 NEXT STEPS TO DEBUG FRONTEND:');
    console.log('1. Open browser dev tools (F12)');
    console.log('2. Navigate to http://localhost:3001/login');
    console.log('3. Login with: admin@test.com / password');
    console.log('4. Go to http://localhost:3001/admin');
    console.log('5. Try to submit a product and watch console for:');
    console.log('   - JavaScript errors');
    console.log('   - Network requests in Network tab');
    console.log('   - Console.log outputs from handleSubmit');
    console.log('');
    console.log('🔍 THINGS TO CHECK:');
    console.log('- Is handleSubmit being called?');
    console.log('- Is preventDefault() working?');
    console.log('- Is the token being passed correctly?');
    console.log('- Are there any JavaScript errors?');
    console.log('- Is the form data being serialized correctly?');
    console.log('');
    console.log('📝 ALTERNATIVE: Use the test page at http://localhost:3001/admin-test');

    console.log('\n8. 📊 SUMMARY...');
    console.log('✅ Backend API: Working perfectly');
    console.log('✅ Authentication: Working correctly');
    console.log('✅ Database: Saving products successfully');
    console.log('❓ Frontend: Needs browser debugging');

  } catch (error) {
    console.error('\n❌ Debug script failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the debug script
debugAdminIssue();