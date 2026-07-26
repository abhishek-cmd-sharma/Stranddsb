const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URL || process.env.ATLASDB_URI || process.env.MONGO_URI;
  console.log('✔ Connecting to MongoDB Atlas...');
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log('✔ MongoDB Connected Successfully');
    console.log(`✔ Database Name: ${conn.connection.name}`);

    // Automatically create default admin if none exists
    const User = require('../models/User');
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('✔ Creating default Admin account...');
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin@123',
        role: 'admin',
      });
      console.log('✔ Default Admin account created successfully (admin@example.com / Admin@123)');
    }
  } catch (error) {
    console.error('✔ Connection Error:', error.message);
    console.error('CRITICAL: Failed to connect to MongoDB Atlas. Stopping the server.');
    process.exit(1);
  }
};

module.exports = connectDB;
