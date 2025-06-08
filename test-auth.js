const http = require('http');

async function testAdminLogin() {
  const data = JSON.stringify({
    email: 'admin@test.com',
    password: 'password'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log('Login response:', JSON.stringify(parsed, null, 2));
          if (parsed.token) {
            console.log('\n=== AUTHENTICATION TOKEN ===');
            console.log(parsed.token);
            console.log('=============================\n');
            
            // Test creating a product with this token
            testCreateProduct(parsed.token);
          }
          resolve(parsed);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function testCreateProduct(token) {
  const productData = JSON.stringify({
    name: 'Test Product via API',
    description: 'This is a test product created via API',
    price: 99.99,
    category: 'test',
    images: ['/uploads/placeholder.jpg'],
    mainImage: '/uploads/placeholder.jpg',
    featured: false,
    inStock: true,
    stock: 10
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/products',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': productData.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          console.log('Product creation status:', res.statusCode);
          if (responseData) {
            const parsed = JSON.parse(responseData);
            console.log('Product creation response:', JSON.stringify(parsed, null, 2));
          }
          resolve(responseData);
        } catch (error) {
          console.log('Raw response:', responseData);
          resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(productData);
    req.end();
  });
}

// Run the test
testAdminLogin().catch(console.error);
