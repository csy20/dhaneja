require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Create mock users data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Mock users data file
const usersFile = path.join(dataDir, 'users.json');

// Admin credentials
const adminEmail = process.env.ADMIN_EMAIL || 'jageshwarsahu910@gmail.com';
const adminPassword = 'Jaggu@29';
const adminName = 'Admin User';

// Hash the password
async function createMockUsers() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);
    
    // Create mock user data
    const users = [
      {
        _id: '60d0fe4f5311236168a109ca',
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: '60d0fe4f5311236168a109cb',
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('Password123!', salt),
        isAdmin: false,
        createdAt: new Date().toISOString()
      }
    ];
    
    // Write to file
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    
    console.log('Mock users created successfully:');
    console.log(`Admin: ${adminEmail} / ${adminPassword}`);
    console.log('Test User: test@example.com / Password123!');
    console.log(`Data stored at: ${usersFile}`);
  } catch (error) {
    console.error('Error creating mock users:', error);
  }
}

// Run the function
createMockUsers();
