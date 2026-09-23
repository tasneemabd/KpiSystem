const User = require('../models/User');

const initializeSampleData = async () => {
  try {
    // Check if sample employee already exists
    const existingEmployee = await User.findOne({ email: 'employee@kpisystem.com' });
    
    if (existingEmployee) {
      console.log('Sample employee already exists');
      return;
    }

    // Create sample employee
    const sampleEmployee = new User({
      email: 'employee@kpisystem.com',
      password: 'employee123',
      name: 'Sample Employee',
      employeeId: 'EMP001',
      role: 'employee',
      isFirstLogin: true,
      isActive: true
    });

    await sampleEmployee.save();
    console.log('Sample employee created successfully');
    console.log('Email: employee@kpisystem.com');
    console.log('Password: employee123');
    console.log('This employee will be prompted to change password on first login');
    
  } catch (error) {
    console.error('Failed to initialize sample employee:', error);
  }
};

module.exports = initializeSampleData;
