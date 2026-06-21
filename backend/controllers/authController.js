const jwt = require('jsonwebtoken');
const Patient = require('../model/Patient');
const Doctor = require('../model/Doctor');
const Admin = require('../model/Admin');

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Patient, Doctor, or Admin)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role, specialization, phoneNumber, dateOfBirth, gender } = req.body;

    if (!fullName || !email || !password) {
      res.status(400);
      throw new Error('Please enter all required fields (fullName, email, password)');
    }

    const targetRole = role || 'patient';

    if (targetRole === 'admin') {
      res.status(400);
      throw new Error('Admin registration is restricted. Please create admin accounts from the dashboard.');
    }

    if (!['patient', 'doctor'].includes(targetRole)) {
      res.status(400);
      throw new Error('Invalid user role specified');
    }

    if (targetRole === 'patient') {
      if (!gender) {
        res.status(400);
        throw new Error('Gender is required for patients');
      }
      if (!['Male', 'Female'].includes(gender)) {
        res.status(400);
        throw new Error('Invalid gender. Must be Male or Female');
      }
    }

    // Check email uniqueness across all tables to avoid overlaps
    const emailLower = email.toLowerCase();
    const patientExists = await Patient.findOne({ email: emailLower });
    const doctorExists = await Doctor.findOne({ email: emailLower });
    const adminExists = await Admin.findOne({ email: emailLower });

    if (patientExists || doctorExists || adminExists) {
      res.status(400);
      throw new Error('User already exists with this email address');
    }

    let user;

    if (targetRole === 'patient') {
      user = await Patient.create({
        fullName,
        email: emailLower,
        password,
        phoneNumber,
        dateOfBirth,
        gender
      });
    } else if (targetRole === 'doctor') {
      user = await Doctor.create({
        fullName,
        email: emailLower,
        password,
        specialization,
        phoneNumber,
        gender
      });
    } else if (targetRole === 'admin') {
      user = await Admin.create({
        fullName,
        email: emailLower,
        password
      });
    }

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        ...(user.patientId && { patientId: user.patientId }),
        ...(user.specialization && { specialization: user.specialization })
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data received');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user (Patient, Doctor, or Admin) & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      res.status(400);
      throw new Error('Please include email, password, and role');
    }

    if (!['patient', 'doctor', 'admin'].includes(role)) {
      res.status(400);
      throw new Error('Invalid role specified for login');
    }

    const emailLower = email.toLowerCase();
    let user;

    // Retrieve user based on the selected login role
    if (role === 'patient') {
      user = await Patient.findOne({ email: emailLower });
    } else if (role === 'doctor') {
      user = await Doctor.findOne({ email: emailLower });
    } else if (role === 'admin') {
      user = await Admin.findOne({ email: emailLower });
    }

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
        phoneNumber: user.phoneNumber,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        ...(user.patientId && { patientId: user.patientId }),
        ...(user.specialization && { specialization: user.specialization })
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password credentials');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const { role, _id } = req.user;
    let user;

    if (role === 'patient') {
      user = await Patient.findById(_id).select('-password');
    } else if (role === 'doctor') {
      user = await Doctor.findById(_id).select('-password');
    } else if (role === 'admin') {
      user = await Admin.findById(_id).select('-password');
    }

    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error('User profile not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors
// @route   GET /api/auth/doctors
// @access  Private
const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({}).select('-password');
    res.json(doctors);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients
// @route   GET /api/auth/patients
// @access  Private (Admin only)
const getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find({}).select('-password');
    res.json(patients);
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new admin (Internal/Protected)
// @route   POST /api/auth/admin/register
// @access  Private (Admin only)
const registerAdmin = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      res.status(400);
      throw new Error('Please enter all required fields (fullName, email, password)');
    }

    const emailLower = email.toLowerCase();
    const patientExists = await Patient.findOne({ email: emailLower });
    const doctorExists = await Doctor.findOne({ email: emailLower });
    const adminExists = await Admin.findOne({ email: emailLower });

    if (patientExists || doctorExists || adminExists) {
      res.status(400);
      throw new Error('User already exists with this email address');
    }

    const admin = await Admin.create({
      fullName,
      email: emailLower,
      password
    });

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id, admin.role)
      });
    } else {
      res.status(400);
      throw new Error('Invalid admin data received');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all admins
// @route   GET /api/auth/admins
// @access  Private (Admin only)
const getAllAdmins = async (req, res, next) => {
  try {
    const admins = await Admin.find({}).select('-password');
    res.json(admins);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const { role, _id } = req.user;
    let user;

    if (role === 'patient') {
      user = await Patient.findById(_id);
      if (!user) {
        res.status(404);
        throw new Error('Patient not found');
      }
      user.fullName = req.body.fullName || user.fullName;
      user.phoneNumber = req.body.phoneNumber !== undefined ? req.body.phoneNumber : user.phoneNumber;
      user.dateOfBirth = req.body.dateOfBirth !== undefined ? req.body.dateOfBirth : user.dateOfBirth;
      user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
      
      await user.save();
      
      const updatedUser = await Patient.findById(_id).select('-password');
      res.json(updatedUser);
    } else if (role === 'doctor') {
      user = await Doctor.findById(_id);
      if (!user) {
        res.status(404);
        throw new Error('Doctor not found');
      }
      user.fullName = req.body.fullName || user.fullName;
      user.phoneNumber = req.body.phoneNumber !== undefined ? req.body.phoneNumber : user.phoneNumber;
      user.specialization = req.body.specialization || user.specialization;
      user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
      
      await user.save();
      
      const updatedUser = await Doctor.findById(_id).select('-password');
      res.json(updatedUser);
    } else if (role === 'admin') {
      user = await Admin.findById(_id);
      if (!user) {
        res.status(404);
        throw new Error('Admin not found');
      }
      user.fullName = req.body.fullName || user.fullName;
      
      await user.save();
      
      const updatedUser = await Admin.findById(_id).select('-password');
      res.json(updatedUser);
    } else {
      res.status(400);
      throw new Error('Invalid role');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllDoctors,
  getAllPatients,
  registerAdmin,
  getAllAdmins,
  updateUserProfile,
};
