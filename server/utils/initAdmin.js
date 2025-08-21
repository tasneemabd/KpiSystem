

const User = require('../models/User');
dotenv.config({ path: './config.env' });

const initializeAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user using environment variables
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
    console.log('Admin user created successfully');
    console.log(`Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD}`);
    console.log('Admin user is ready for login!');
    
  } catch (error) {
    console.error('Failed to initialize admin user:', error);
  }
};

module.exports = initializeAdmin;
