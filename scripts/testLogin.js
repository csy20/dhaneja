// Test login functionality with different user types
const testLogin = async () => {
  try {
    console.log('Testing login with admin credentials...');
    
    // Test admin login
    const adminRes = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'jageshwarsahu910@gmail.com',
        password: 'secureAdminPassword123', // This should be changed to the actual admin password
      }),
    });
    
    const adminData = await adminRes.json();
    console.log('Admin login result:', adminData);
    
    // Test customer login
    console.log('\nTesting login with customer credentials...');
    const customerRes = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'customer@example.com',
        password: 'password123',
      }),
    });
    
    const customerData = await customerRes.json();
    console.log('Customer login result:', customerData);
    
  } catch (error) {
    console.error('Test login error:', error);
  }
};

// Run the test
testLogin();
