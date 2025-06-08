const fetch = require('node-fetch');

async function testProductCreation() {
    console.log('🧪 Testing Product Creation via API...');
    
    // Login first
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
        return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful, token obtained');
    
    // Test product creation
    const products = [
        {
            name: 'Test Product from Admin-Fixed Dashboard Test',
            description: 'This product tests if the admin-fixed dashboard would work',
            price: 150,
            category: 'saree',
            imageUrl: '/uploads/sample1.jpg',
            images: ['/uploads/sample1.jpg'],
            stock: 25,
            discount: 0
        },
        {
            name: 'Test Product from Simple-Admin Dashboard Test',
            description: 'This product tests if the simple-admin dashboard would work',
            price: 175,
            category: 'suit',
            imageUrl: '/uploads/sample1.jpg',
            images: ['/uploads/sample1.jpg'],
            stock: 35,
            discount: 0
        },
        {
            name: 'Test Product from Original Admin Dashboard Test',
            description: 'This product tests if the original admin dashboard would work',
            price: 200,
            category: 'kurta',
            imageUrl: '/uploads/sample1.jpg',
            images: ['/uploads/sample1.jpg'],
            stock: 40,
            discount: 0
        }
    ];
    
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`\n${i + 1}️⃣ Creating product: ${product.name}`);
        
        const response = await fetch('http://localhost:3002/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(product)
        });
        
        if (response.ok) {
            const newProduct = await response.json();
            console.log(`✅ Success: Product "${newProduct.name}" created with ID ${newProduct._id}`);
        } else {
            const error = await response.json();
            console.error(`❌ Failed: ${error.error || 'Unknown error'}`);
        }
    }
    
    // Fetch all products to verify
    console.log('\n📋 Current products in database:');
    const productsResponse = await fetch('http://localhost:3002/api/products');
    if (productsResponse.ok) {
        const allProducts = await productsResponse.json();
        console.log(`Total products: ${allProducts.length}`);
        allProducts.forEach((p, index) => {
            console.log(`${index + 1}. ${p.name} - $${p.price} (${p.category})`);
        });
    }
}

testProductCreation().catch(console.error);
