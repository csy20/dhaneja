require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Make sure we're using the correct MongoDB URI
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in the environment variables');
  console.log('Checking .env file directly...');
  
  // Try to read from .env file directly
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const mongoMatch = envContent.match(/MONGODB_URI=(.+)/);
    if (mongoMatch && mongoMatch[1]) {
      console.log('Found MongoDB URI in .env file');
      process.env.MONGODB_URI = mongoMatch[1];
    } else {
      console.error('Could not find MONGODB_URI in .env file');
      process.exit(1);
    }
  } else {
    console.error('.env file not found');
    process.exit(1);
  }
}

// Define User model schema for script
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

async function createOrUpdateAdmin() {
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB with URI:', process.env.MONGODB_URI.replace(/<db_password>/, '********'));
    
    // Extract password from URI if needed
    let uri = process.env.MONGODB_URI;
    if (uri.includes('<db_password>')) {
      console.log('MongoDB URI contains placeholder password. Please update your .env file with the correct password.');
      process.exit(1);
    }
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Create User model
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || 'jageshwarsahu910@gmail.com';
    const adminPassword = 'Jaggu@29';
    const adminName = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    if (existingAdmin) {
      // Update existing admin
      existingAdmin.password = hashedPassword;
      existingAdmin.isAdmin = true;
      await existingAdmin.save();
      console.log('Admin user updated successfully');
    } else {
      // Create new admin
      const newAdmin = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true
      });
      await newAdmin.save();
      console.log('Admin user created successfully');
    }

    console.log(`Admin credentials: 
  Email: ${adminEmail}
  Password: ${adminPassword} (unhashed)
  Admin Rights: true`);

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    try {
      // Close MongoDB connection
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (err) {
      console.error('Error disconnecting from MongoDB:', err);
    }
    process.exit(0);
  }
}

// Run the function
createOrUpdateAdmin();
