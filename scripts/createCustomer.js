// Create a test customer user
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');
const usersFile = path.join(dataDir, 'users.json');

// Make sure data directory exists
if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
    process.exit(1);
  }
}

// Create empty users file if it doesn't exist
if (!fs.existsSync(usersFile)) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
  } catch (error) {
    console.error('Error creating users file:', error);
    process.exit(1);
  }
}

async function createCustomer() {
  try {
    // Read existing users
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    
    // Check if customer already exists
    const existingUser = users.find(u => u.email === 'customer@example.com');
    
    if (existingUser) {
      console.log('Customer user already exists');
      return;
    }
    
    // Create new customer
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const newUser = {
      _id: `user_${Date.now()}`,
      name: 'Test Customer',
      email: 'customer@example.com',
      password: hashedPassword,
      isAdmin: false,
      createdAt: new Date()
    };
    
    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    
    console.log('Customer user created successfully');
    console.log('Email: customer@example.com');
    console.log('Password: password123');
  } catch (error) {
    console.error('Error creating customer:', error);
  }
}

createCustomer();
