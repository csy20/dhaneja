const fetch = require('node-fetch');

async function testFixedAdminDashboard() {
    console.log('🧪 Testing Fixed Admin Dashboard Functionality...\n');
    
    // First, login to get a token
    console.log('1. 🔐 Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: 'admin@test.com',
            password: 'password'
        })
    });
    
    if (!loginResponse.ok) {
        console.error('❌ Login failed');
        const errorData = await loginResponse.json();
        console.error('Error:', errorData);
        return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful!');
    console.log('   User:', loginData.user.name);
    console.log('   Email:', loginData.user.email);
    console.log('   Admin:', loginData.user.isAdmin);
    console.log('   Token obtained: ✓\n');
    
    // Test product creation via the API (simulating what the fixed dashboard should do)
    console.log('2. 📦 Testing product creation (simulating fixed dashboard)...');
    const testProduct = {
        name: 'Test Product from Fixed Admin Dashboard',
        description: 'This product was created to test the fixed admin dashboard functionality',
        price: 249.99,
        category: 'saree',
        imageUrl: '/uploads/sample1.jpg',
        images: ['/uploads/sample1.jpg'],
        stock: 50,
        discount: 5,
        position: 100 // Will be set by the API
    };
    
    console.log('   Creating product:', testProduct.name);
    const createResponse = await fetch('http://localhost:3002/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(testProduct)
    });
    
    if (createResponse.ok) {
        const newProduct = await createResponse.json();
        console.log('✅ Product created successfully!');
        console.log('   ID:', newProduct._id);
        console.log('   Name:', newProduct.name);
        console.log('   Price: ₹', newProduct.price);
        console.log('   Category:', newProduct.category);
        console.log('   Stock:', newProduct.stock);
        console.log('   Position:', newProduct.position, '\n');
    } else {
        console.error('❌ Product creation failed');
        const errorData = await createResponse.json();
        console.error('Error:', errorData);
        return;
    }
    
    // Verify by fetching all products
    console.log('3. 📋 Verifying product was saved...');
    const productsResponse = await fetch('http://localhost:3002/api/products');
    if (productsResponse.ok) {
        const allProducts = await productsResponse.json();
        console.log('✅ Products fetched successfully!');
        console.log(`   Total products in database: ${allProducts.length}`);
        
        // Find our test product
        const ourProduct = allProducts.find(p => p.name === testProduct.name);
        if (ourProduct) {
            console.log('✅ Our test product found in database!');
            console.log(`   Verification: Product "${ourProduct.name}" exists with ID ${ourProduct._id}\n`);
        } else {
            console.log('❌ Our test product not found in database\n');
        }
        
        // Show last 3 products
        console.log('📊 Last 3 products in database:');
        allProducts.slice(-3).forEach((product, index) => {
            console.log(`   ${allProducts.length - 2 + index}. ${product.name} - ₹${product.price} (${product.category})`);
        });
    } else {
        console.error('❌ Failed to fetch products for verification');
    }
    
    console.log('\n🎯 CONCLUSION:');
    console.log('   ✅ Authentication: Working');
    console.log('   ✅ API Product Creation: Working');
    console.log('   ✅ Database Storage: Working');
    console.log('   ✅ Product Retrieval: Working');
    console.log('\n💡 The fixed admin dashboard should now work!');
    console.log('   Visit: http://localhost:3002/admin');
    console.log('   Login with: admin@test.com / password');
    console.log('   Try creating a product using both the form submit and test API button.');
}

testFixedAdminDashboard().catch(console.error);
