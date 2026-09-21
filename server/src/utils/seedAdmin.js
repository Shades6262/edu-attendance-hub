require('dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existingAdmin = await User.findOne({ email: 'admin@school.com' });
    if (existingAdmin) {
      console.log('Admin already exists. Skipping seed.');
      process.exit();
    }

    const hashedPassword = await bcrypt.hash('Hereiamtoworship1$', 10);

    const admin = await User.create({
      name: 'Super Admin',
      email: 'vicshade12@gmail.com',
      password: hashedPassword,
      role: 'admin',
      status: 'approved' // bypass the pending flow — this is the bootstrap account
    });

    console.log('Bootstrap admin created:', admin.email);
    process.exit();
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seedAdmin();