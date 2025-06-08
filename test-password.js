const bcrypt = require('bcryptjs');

// Test password combinations
const passwords = ['password123', 'admin123', 'password', 'admin'];
const hash = '$2b$10$msrWepELG0OXpqvYn9K27.078B.y1tRffFhbhb25EaWoOa6hCSH0K';

console.log('Testing password hashes...\n');

passwords.forEach(async (password) => {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    console.log(`Password "${password}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
  } catch (error) {
    console.log(`Password "${password}": ❌ ERROR - ${error.message}`);
  }
});

// Also test the second admin
const hash2 = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
console.log('\nTesting second admin hash...\n');

passwords.forEach(async (password) => {
  try {
    const isMatch = await bcrypt.compare(password, hash2);
    console.log(`Password "${password}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
  } catch (error) {
    console.log(`Password "${password}": ❌ ERROR - ${error.message}`);
  }
});
