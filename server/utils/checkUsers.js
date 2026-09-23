const User = require('../models/User');

const checkUsers = async () => {
  try {
    console.log('Checking existing users in database...');
    
    // Find all users
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found in database');
      return;
    }
    
    console.log(`Found ${users.length} user(s):`);
    users.forEach(user => {
      console.log(`- Email: ${user.email}, Role: ${user.role}, Active: ${user.isActive}`);
    });
    
    // Check specifically for admin users
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`\nAdmin users found: ${adminUsers.length}`);
    
    if (adminUsers.length > 0) {
      adminUsers.forEach(admin => {
        console.log(`- Admin: ${admin.email}, Active: ${admin.isActive}, First Login: ${admin.isFirstLogin}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
  }
};

module.exports = checkUsers;
