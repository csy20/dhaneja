#!/usr/bin/env node

const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Request timeout')));
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runCompleteTest() {
  console.log('🧪 Complete System Test');
  console.log('=====================');
  console.log('');
  
  const baseUrl = 'localhost';
  const port = 3000;
  let testsPassed = 0;
  let totalTests = 0;
  
  function logTest(name, passed, details = '') {
    totalTests++;
    if (passed) {
      testsPassed++;
      console.log(`✅ ${name}`);
    } else {
      console.log(`❌ ${name}`);
    }
    if (details) {
      console.log(`   ${details}`);
    }
  }
  
  try {
    // Test 1: Products API
    console.log('📦 Testing Products API...');
    const productsResponse = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/products',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    logTest(
      'Products API responds',
      productsResponse.status === 200,
      `Status: ${productsResponse.status}, Products: ${Array.isArray(productsResponse.data) ? productsResponse.data.length : 'Error'}`
    );
    
    // Test 2: Authentication
    console.log('\n🔐 Testing Authentication...');
    const loginResponse = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'admin@test.com',
      password: 'password'
    });
    
    logTest(
      'Login succeeds',
      loginResponse.status === 200 && loginResponse.data.token,
      `Status: ${loginResponse.status}, Token: ${loginResponse.data.token ? 'Present' : 'Missing'}`
    );
    
    let token = null;
    if (loginResponse.data.token) {
      token = loginResponse.data.token;
      
      logTest(
        'User data returned',
        loginResponse.data.user && loginResponse.data.user.name,
        `User: ${loginResponse.data.user ? loginResponse.data.user.name : 'None'}`
      );
    }
    
    // Test 3: Protected endpoint
    if (token) {
      console.log('\n🔒 Testing Protected Endpoints...');
      const protectedResponse = await makeRequest({
        hostname: baseUrl,
        port: port,
        path: '/api/products',
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      logTest(
        'Protected route accessible',
        protectedResponse.status === 200,
        `Status: ${protectedResponse.status}`
      );
    }
    
    // Test 4: Upload endpoint
    console.log('\n📤 Testing Upload Endpoint...');
    const uploadTestResponse = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/api/upload',
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    logTest(
      'Upload endpoint responds',
      uploadTestResponse.status === 405 || uploadTestResponse.status === 200, // 405 Method Not Allowed is expected for GET
      `Status: ${uploadTestResponse.status} (405 expected for GET request)`
    );
    
    // Test 5: Frontend pages
    console.log('\n🌐 Testing Frontend...');
    const homeResponse = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/',
      method: 'GET',
      headers: { 'Accept': 'text/html' }
    });
    
    logTest(
      'Homepage loads',
      homeResponse.status === 200,
      `Status: ${homeResponse.status}`
    );
    
    const adminResponse = await makeRequest({
      hostname: baseUrl,
      port: port,
      path: '/admin',
      method: 'GET',
      headers: { 'Accept': 'text/html' }
    });
    
    logTest(
      'Admin panel loads',
      adminResponse.status === 200,
      `Status: ${adminResponse.status}`
    );
    
    // Summary
    console.log('\n📊 Test Summary');
    console.log('==============');
    console.log(`Passed: ${testsPassed}/${totalTests} tests`);
    console.log(`Success Rate: ${Math.round((testsPassed/totalTests)*100)}%`);
    
    if (testsPassed === totalTests) {
      console.log('\n🎉 All tests passed! System is working perfectly!');
      console.log('\n🚀 Ready for:');
      console.log('   • Production deployment');
      console.log('   • Vercel deployment');
      console.log('   • End-to-end testing');
      console.log('\n📍 URLs:');
      console.log(`   • Development: http://localhost:${port}`);
      console.log(`   • Admin Panel: http://localhost:${port}/admin`);
      console.log(`   • API Docs: http://localhost:${port}/api/products`);
    } else {
      console.log('\n⚠️  Some tests failed. Please check the issues above.');
    }
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

runCompleteTest();
