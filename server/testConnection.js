const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: './config.env' });

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
    
    // Check existing users
    const users = await User.find({});
    console.log(`Found ${users.length} existing users`);
    
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });
    
    // Check for admin users specifically
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`\nAdmin users: ${adminUsers.length}`);
    
    // if (adminUsers.length === 0) {
    //   console.log('No admin user found. Creating one...');
      
    //   // Create admin user
    //   const adminUser = new User({
    //     email: process.env.ADMIN_EMAIL ,
    //     password: process.env.ADMIN_PASSWORD,
    //     name: 'System Administrator',
    //     employeeId: 'ADMIN001',
    //     role: 'admin',
    //     isFirstLogin: false,
    //     isActive: true
    //   });
      
    //   await adminUser.save();
    //   console.log('✅ Admin user created successfully');
    //   console.log(`Email: ${process.env.ADMIN_EMAIL}`);
    //   console.log(`Password: ${process.env.ADMIN_PASSWORD}`);
    // } else {
    //   console.log('Admin user already exists');
    //   adminUsers.forEach(admin => {
    //     console.log(`- ${admin.email} (Active: ${admin.isActive})`);
    //   });
    // }
    if (adminUsers.length === 0) {
  // Create admin user
  const adminUser = new User({
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: 'System Administrator',
    employeeId: 'ADMIN001',
    role: 'admin',
    isFirstLogin: false,
    isActive: true
  });
  
  await adminUser.save();
  console.log('✅ Admin user created successfully');
} else {
  // Update existing admin email
  const admin = adminUsers[0];
  admin.email = process.env.ADMIN_EMAIL;
  
  // لو عندك تشفير لكلمة السر، احرص على تحديثها مش مشفرة
  // admin.password = hashedPassword;
  
  await admin.save();
  console.log('✅ Admin email updated successfully');
}

    // Test password comparison
    if (adminUsers.length > 0) {
      const admin = adminUsers[0];
      console.log('\nTesting password comparison...');
      
      const isPasswordValid = await admin.comparePassword(process.env.ADMIN_PASSWORD);
      console.log(`Password comparison result: ${isPasswordValid}`);
      
      if (!isPasswordValid) {
        console.log('❌ Password comparison failed. This explains the login issue!');
        console.log('The stored password hash does not match the plain text password.');
      } else {
        console.log('✅ Password comparison successful');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testConnection();
