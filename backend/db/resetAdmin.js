const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from the parent .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const Admin = require('../model/Admin');

const resetAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be defined in environment variables (.env)');
    }

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables (.env)');
    }

    // Connect to the database
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully.');

    const emailLower = email.toLowerCase();
    
    // Find any existing admin first to prevent duplicate/overlapping admin records
    let admin = await Admin.findOne();

    if (admin) {
      console.log(`Updating existing Admin record: ${admin.email} -> ${emailLower}`);
      admin.fullName = 'Super Admin';
      admin.email = emailLower;
      admin.password = password; // The Schema's pre-save hook will hash it automatically
      await admin.save();
      console.log('Super Admin credentials updated successfully.');
    } else {
      console.log(`No existing admin found. Creating a new Admin record with: ${emailLower}`);
      await Admin.create({
        fullName: 'Super Admin',
        email: emailLower,
        password: password
      });
      console.log('Super Admin seeded successfully.');
    }

    await mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Failed to reset Admin credentials:', error.message);
    process.exit(1);
  }
};

resetAdmin();
