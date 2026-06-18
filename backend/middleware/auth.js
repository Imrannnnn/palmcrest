const jwt = require('jsonwebtoken');
const Patient = require('../model/Patient');
const Doctor = require('../model/Doctor');
const Admin = require('../model/Admin');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check role and load user from database
      let user;
      if (decoded.role === 'patient') {
        user = await Patient.findById(decoded.id).select('-password');
      } else if (decoded.role === 'doctor') {
        user = await Doctor.findById(decoded.id).select('-password');
      } else if (decoded.role === 'admin') {
        user = await Admin.findById(decoded.id).select('-password');
      }

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach user to request object
      req.user = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        ...(user.patientId && { patientId: user.patientId }),
        ...(user.specialization && { specialization: user.specialization })
      };
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
