const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Function to seed a normal user
const seedNormalUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // Check if the normal user already exists
    const userExists = await User.findOne({ email: 'user@example.com' });
    
    if (userExists) {
      console.log('Normal user already exists. Skipping seed.');
      return;
    }

    // Create normal user
    const user = new User({
      email: 'user@example.com',
      password: 'user123', // This will be hashed by the pre-save hook
      firstName: 'Normal',
      lastName: 'User',
      role: 'user', // Regular user role
      department: 'Science'
    });

    await user.save();
    console.log('Normal user created successfully:');
    console.log('Email: user@example.com');
    console.log('Password: user123');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding normal user:', error);
    process.exit(1);
  }
};

// Run the seed
seedNormalUser();
