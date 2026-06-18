const path = require('path');
const Admin = require('../model/Admin');

const seedAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'murannasir22@gmail.com';
    const password = process.env.ADMIN_PASSWORD || 'SuperAdminpalm';

    const emailLower = email.toLowerCase();
    const adminExists = await Admin.findOne({ email: emailLower });

    if (!adminExists) {
      await Admin.create({
        fullName: 'Super Admin',
        email: emailLower,
        password: password
      });
      console.log(`Admin account seeded successfully: ${emailLower}`);
    } else {
      console.log(`Admin account already exists: ${emailLower}`);
    }
  } catch (error) {
    console.error('Error seeding admin account:', error);
  }
};

module.exports = seedAdmin;

if (require.main === module) {
  const dotenv = require('dotenv');
  const mongoose = require('mongoose');
  // Load .env relative to this file
  dotenv.config({ path: path.join(__dirname, '../.env') });

  const run = async () => {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in environment variables');
      }
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected for seeding...');
      await seedAdmin();
      await mongoose.connection.close();
      console.log('Database connection closed.');
    } catch (err) {
      console.error('Seeding script failed:', err);
      process.exit(1);
    }
  };
  run();
}
