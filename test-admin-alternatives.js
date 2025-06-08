const puppeteer = require('puppeteer');

async function testAdminAlternatives() {
    console.log('🧪 Testing Admin Dashboard Alternatives...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        // Test 1: Admin Fixed Dashboard
        console.log('1️⃣ Testing /admin-fixed dashboard...');
        const page1 = await browser.newPage();
        await page1.goto('http://localhost:3002/admin-fixed', { waitUntil: 'networkidle0' });
        
        // Check if login form is present
        const loginForm = await page1.$('form');
        if (loginForm) {
            console.log('✅ Login form found in admin-fixed');
            
            // Fill login credentials
            await page1.type('input[type="email"]', 'admin@test.com');
            await page1.type('input[type="password"]', 'password');
            
            // Submit login
            await Promise.all([
                page1.waitForNavigation({ waitUntil: 'networkidle0' }),
                page1.click('button[type="submit"]')
            ]);
            
            console.log('✅ Login submitted for admin-fixed');
            
            // Check if we're now on admin dashboard
            await page1.waitForTimeout(2000);
            const currentUrl = page1.url();
            console.log(`Current URL: ${currentUrl}`);
            
            // Look for product form
            const productForm = await page1.$('form');
            if (productForm) {
                console.log('✅ Product form found in admin-fixed dashboard');
                
                // Try to fill and submit product form
                await page1.type('input[name="name"]', 'Test Product from Admin-Fixed');
                await page1.type('textarea[name="description"]', 'This is a test product created from the admin-fixed dashboard');
                await page1.type('input[name="price"]', '150');
                await page1.select('select[name="category"]', 'saree');
                await page1.type('input[name="stock"]', '25');
                
                console.log('✅ Form filled in admin-fixed');
                
                // Submit the form
                await page1.click('button[type="submit"]');
                await page1.waitForTimeout(3000);
                
                console.log('✅ Product creation attempted in admin-fixed');
            } else {
                console.log('❌ No product form found in admin-fixed dashboard');
            }
        } else {
            console.log('❌ No login form found in admin-fixed');
        }
        
        await page1.close();
        
        // Test 2: Simple Admin Dashboard
        console.log('\n2️⃣ Testing /simple-admin dashboard...');
        const page2 = await browser.newPage();
        await page2.goto('http://localhost:3002/simple-admin', { waitUntil: 'networkidle0' });
        
        const loginForm2 = await page2.$('form');
        if (loginForm2) {
            console.log('✅ Login form found in simple-admin');
            
            // Fill login credentials
            await page2.type('input[type="email"]', 'admin@test.com');
            await page2.type('input[type="password"]', 'password');
            
            // Submit login
            await Promise.all([
                page2.waitForNavigation({ waitUntil: 'networkidle0' }),
                page2.click('button[type="submit"]')
            ]);
            
            console.log('✅ Login submitted for simple-admin');
            
            // Check if we're now on admin dashboard
            await page2.waitForTimeout(2000);
            const currentUrl2 = page2.url();
            console.log(`Current URL: ${currentUrl2}`);
            
            // Look for product form
            const productForm2 = await page2.$('form');
            if (productForm2) {
                console.log('✅ Product form found in simple-admin dashboard');
                
                // Try to fill and submit product form
                await page2.type('input[name="name"]', 'Test Product from Simple-Admin');
                await page2.type('textarea[name="description"]', 'This is a test product created from the simple-admin dashboard');
                await page2.type('input[name="price"]', '175');
                await page2.select('select[name="category"]', 'suit');
                await page2.type('input[name="stock"]', '35');
                
                console.log('✅ Form filled in simple-admin');
                
                // Submit the form
                await page2.click('button[type="submit"]');
                await page2.waitForTimeout(3000);
                
                console.log('✅ Product creation attempted in simple-admin');
            } else {
                console.log('❌ No product form found in simple-admin dashboard');
            }
        } else {
            console.log('❌ No login form found in simple-admin');
        }
        
        await page2.close();
        
        // Test 3: Original Admin Dashboard (for comparison)
        console.log('\n3️⃣ Testing original /admin dashboard...');
        const page3 = await browser.newPage();
        await page3.goto('http://localhost:3002/admin', { waitUntil: 'networkidle0' });
        
        const loginForm3 = await page3.$('form');
        if (loginForm3) {
            console.log('✅ Login form found in original admin');
            
            // Fill login credentials
            await page3.type('input[type="email"]', 'admin@test.com');
            await page3.type('input[type="password"]', 'password');
            
            // Submit login
            await Promise.all([
                page3.waitForNavigation({ waitUntil: 'networkidle0' }),
                page3.click('button[type="submit"]')
            ]);
            
            console.log('✅ Login submitted for original admin');
            
            // Check if we're now on admin dashboard
            await page3.waitForTimeout(2000);
            const currentUrl3 = page3.url();
            console.log(`Current URL: ${currentUrl3}`);
            
            // Look for product form
            const productForm3 = await page3.$('form');
            if (productForm3) {
                console.log('✅ Product form found in original admin dashboard');
                
                // Try to fill and submit product form
                await page3.type('input[name="name"]', 'Test Product from Original Admin');
                await page3.type('textarea[name="description"]', 'This is a test product created from the original admin dashboard');
                await page3.type('input[name="price"]', '200');
                await page3.select('select[name="category"]', 'kurta');
                await page3.type('input[name="stock"]', '40');
                
                console.log('✅ Form filled in original admin');
                
                // Submit the form
                await page3.click('button[type="submit"]');
                await page3.waitForTimeout(3000);
                
                console.log('✅ Product creation attempted in original admin');
            } else {
                console.log('❌ No product form found in original admin dashboard');
            }
        } else {
            console.log('❌ No login form found in original admin');
        }
        
        await page3.close();
        
        console.log('\n📊 Test Summary:');
        console.log('- Tested all three admin dashboard versions');
        console.log('- Check the products.json file to see which ones successfully created products');
        console.log('- Browser windows should show any error messages or success feedback');
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
    } finally {
        // Don't close browser automatically to allow manual inspection
        console.log('\n🔍 Browser left open for manual inspection. Close it manually when done.');
        // await browser.close();
    }
}

testAdminAlternatives().catch(console.error);
