require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/secure_gateway');
  console.log('Connected');

  const users = [
    { username: 'admin',  email: 'admin@gateway.com',  password: 'Admin@12345',  role: 'admin' },
    { username: 'dev1',   email: 'dev@gateway.com',    password: 'Dev@123456',   role: 'developer' },
    { username: 'user1',  email: 'user@gateway.com',   password: 'User@123456',  role: 'user' }
  ];

  for (const u of users) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) { await User.create(u); console.log(`✅ Created: ${u.email}`); }
    else console.log(`⏭  Exists: ${u.email}`);
  }

  console.log('\n📋 Credentials:');
  console.log('  admin@gateway.com  / Admin@12345  (admin)');
  console.log('  dev@gateway.com    / Dev@123456   (developer)');
  console.log('  user@gateway.com   / User@123456  (user)');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
