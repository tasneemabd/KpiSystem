const User = require('../models/User');

const resetAdmin = async () => {
  try {
    console.log('Resetting admin user...');
    
    // Remove any existing admin users
    const deletedAdmins = await User.deleteMany({ role: 'admin' });
    console.log(`Deleted ${deletedAdmins.deletedCount} existing admin user(s)`);
    
    // Create new admin user
    const adminUser = new User({
      email: process.env.ADMIN_EMAIL || "admin@buniversemr.com",
      password: process.env.ADMIN_PASSWORD|| "admin123",
      name: 'System Administrator',
      employeeId: 'ADMIN001',
      role: 'admin',
      isFirstLogin: false,
      isActive: true
    });
   
    await adminUser.save();
    console.log('New admin user created successfully');
    console.log(`Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD}`);
    console.log('Admin user is ready for login!');
    
  } catch (error) {
    console.error('Failed to reset admin user:', error);
  }
};

module.exports = resetAdmin;
