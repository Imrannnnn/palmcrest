'use strict';

// Mock DB and models before requiring
jest.mock('../../db/db', () => jest.fn().mockResolvedValue(undefined));
jest.mock('../../model/Patient');
jest.mock('../../model/Doctor');
jest.mock('../../model/Admin');

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const Patient = require('../../model/Patient');
const Doctor = require('../../model/Doctor');
const Admin = require('../../model/Admin');
const authRoutes = require('../../routes/authRoutes');
const errorHandler = require('../../middleware/error');

const JWT_SECRET = process.env.JWT_SECRET || 'defaultjwtsecret';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use(errorHandler);
  return app;
}

describe('Auth Routes Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a patient', async () => {
      // Mock unique email check across all collections
      Patient.findOne.mockResolvedValueOnce(null);
      Doctor.findOne.mockResolvedValueOnce(null);
      Admin.findOne.mockResolvedValueOnce(null);

      // Mock creation
      const mockPatient = {
        _id: 'mockpatientid123',
        fullName: 'Johnathan Doe',
        email: 'johnathan@example.com',
        role: 'patient',
        patientId: '#PC-8821'
      };
      Patient.create.mockResolvedValueOnce(mockPatient);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Johnathan Doe',
          email: 'johnathan@example.com',
          password: 'securePassword123',
          role: 'patient'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body._id).toBe(mockPatient._id);
      expect(response.body.role).toBe('patient');
      expect(response.body.patientId).toBe('#PC-8821');
    });

    it('should successfully register a doctor with specialization', async () => {
      Patient.findOne.mockResolvedValueOnce(null);
      Doctor.findOne.mockResolvedValueOnce(null);
      Admin.findOne.mockResolvedValueOnce(null);

      const mockDoctor = {
        _id: 'mockdoctorid123',
        fullName: 'Dr. Elena Aris',
        email: 'elena@example.com',
        role: 'doctor',
        specialization: 'Audiology'
      };
      Doctor.create.mockResolvedValueOnce(mockDoctor);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Dr. Elena Aris',
          email: 'elena@example.com',
          password: 'securePassword123',
          role: 'doctor',
          specialization: 'Audiology'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.role).toBe('doctor');
      expect(response.body.specialization).toBe('Audiology');
    });

    it('should reject registration if email is already taken', async () => {
      // Mock existing patient
      Patient.findOne.mockResolvedValueOnce({ email: 'taken@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Duplicate User',
          email: 'taken@example.com',
          password: 'securePassword123',
          role: 'patient'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/already exists/i);
    });

    it('should reject registration if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'missingname@example.com',
          password: 'password123'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/required/i);
    });

    it('should reject registering as an admin via the public registration endpoint', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Malicious Admin',
          email: 'malicious@example.com',
          password: 'securePassword123',
          role: 'admin'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/admin registration is restricted/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should successfully log in a patient with correct credentials', async () => {
      const mockPatient = {
        _id: 'mockpatientid123',
        fullName: 'Johnathan Doe',
        email: 'johnathan@example.com',
        role: 'patient',
        patientId: '#PC-8821',
        comparePassword: jest.fn().mockResolvedValueOnce(true)
      };
      Patient.findOne.mockResolvedValueOnce(mockPatient);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'johnathan@example.com',
          password: 'securePassword123',
          role: 'patient'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.fullName).toBe('Johnathan Doe');
    });

    it('should fail login with incorrect credentials', async () => {
      const mockPatient = {
        email: 'johnathan@example.com',
        comparePassword: jest.fn().mockResolvedValueOnce(false)
      };
      Patient.findOne.mockResolvedValueOnce(mockPatient);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'johnathan@example.com',
          password: 'wrongpassword',
          role: 'patient'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toMatch(/invalid email or password/i);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should deny profile access if no token is provided', async () => {
      const response = await request(app).get('/api/auth/profile');
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toMatch(/no token provided/i);
    });

    it('should deny profile access if invalid token is provided', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtokenhere');

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toMatch(/token failed/i);
    });

    it('should return profile details for authenticated token', async () => {
      const mockUser = {
        _id: 'mockpatientid123',
        fullName: 'Johnathan Doe',
        email: 'johnathan@example.com',
        role: 'patient',
        patientId: '#PC-8821'
      };

      // Generate a valid mock token
      const token = jwt.sign({ id: mockUser._id, role: mockUser.role }, JWT_SECRET);

      // Mock database find for middleware protect AND controller getUserProfile
      // protect middleware does findById().select('-password')
      Patient.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.fullName).toBe('Johnathan Doe');
      expect(response.body.role).toBe('patient');
      expect(response.body.patientId).toBe('#PC-8821');
    });
  });

  describe('GET /api/auth/doctors', () => {
    it('should successfully get list of all doctors', async () => {
      const mockPatient = { _id: 'patient123', role: 'patient' };
      const token = jwt.sign({ id: mockPatient._id, role: mockPatient.role }, JWT_SECRET);

      Patient.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockPatient)
      });

      const mockDoctors = [{ fullName: 'Dr. Elena Rodriguez', specialization: 'Rhinology' }];
      Doctor.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDoctors)
      });

      const response = await request(app)
        .get('/api/auth/doctors')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body[0].fullName).toBe('Dr. Elena Rodriguez');
    });
  });

  describe('GET /api/auth/patients', () => {
    it('should allow admin to list all patients', async () => {
      const mockAdmin = { _id: 'admin123', role: 'admin' };
      const token = jwt.sign({ id: mockAdmin._id, role: mockAdmin.role }, JWT_SECRET);

      Admin.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin)
      });

      const mockPatients = [{ fullName: 'Johnathan Doe', patientId: '#PC-8821' }];
      Patient.find = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockPatients)
      });

      const response = await request(app)
        .get('/api/auth/patients')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body[0].fullName).toBe('Johnathan Doe');
    });

    it('should deny non-admin users from listing all patients', async () => {
      const mockDoctor = { _id: 'doctor456', role: 'doctor' };
      const token = jwt.sign({ id: mockDoctor._id, role: mockDoctor.role }, JWT_SECRET);

      Doctor.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDoctor)
      });

      const response = await request(app)
        .get('/api/auth/patients')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toMatch(/not authorized/i);
    });
  });

  describe('Admin-Only Management Routes', () => {
    describe('POST /api/auth/admin/register', () => {
      it('should successfully register a new admin when requested by an authorized admin', async () => {
        // Mock existing checks
        Patient.findOne.mockResolvedValueOnce(null);
        Doctor.findOne.mockResolvedValueOnce(null);
        Admin.findOne.mockResolvedValueOnce(null);

        // Mock creation
        const mockNewAdmin = {
          _id: 'newadmin123',
          fullName: 'Secondary Admin',
          email: 'secondary@example.com',
          role: 'admin'
        };
        Admin.create.mockResolvedValueOnce(mockNewAdmin);

        // Mock auth checks
        const loggedInAdmin = { _id: 'admin123', role: 'admin' };
        const token = jwt.sign({ id: loggedInAdmin._id, role: loggedInAdmin.role }, JWT_SECRET);
        Admin.findById = jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(loggedInAdmin)
        });

        const response = await request(app)
          .post('/api/auth/admin/register')
          .set('Authorization', `Bearer ${token}`)
          .send({
            fullName: 'Secondary Admin',
            email: 'secondary@example.com',
            password: 'securePassword123'
          });

        expect(response.statusCode).toBe(201);
        expect(response.body._id).toBe(mockNewAdmin._id);
        expect(response.body.role).toBe('admin');
      });

      it('should block non-admins from registering a new admin', async () => {
        const loggedInDoctor = { _id: 'doctor123', role: 'doctor' };
        const token = jwt.sign({ id: loggedInDoctor._id, role: loggedInDoctor.role }, JWT_SECRET);
        Doctor.findById = jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(loggedInDoctor)
        });

        const response = await request(app)
          .post('/api/auth/admin/register')
          .set('Authorization', `Bearer ${token}`)
          .send({
            fullName: 'Unauthorized Admin',
            email: 'unauth@example.com',
            password: 'securePassword123'
          });

        expect(response.statusCode).toBe(403);
        expect(response.body.message).toMatch(/not authorized/i);
      });
    });

    describe('GET /api/auth/admins', () => {
      it('should allow an authorized admin to get all admins list', async () => {
        const loggedInAdmin = { _id: 'admin123', role: 'admin' };
        const token = jwt.sign({ id: loggedInAdmin._id, role: loggedInAdmin.role }, JWT_SECRET);
        Admin.findById = jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(loggedInAdmin)
        });

        const mockAdmins = [
          { _id: 'admin123', fullName: 'Super Admin', email: 'murannasir22@gmail.com', role: 'admin' },
          { _id: 'admin456', fullName: 'Secondary Admin', email: 'secondary@example.com', role: 'admin' }
        ];
        Admin.find = jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockAdmins)
        });

        const response = await request(app)
          .get('/api/auth/admins')
          .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].email).toBe('murannasir22@gmail.com');
      });

      it('should block non-admins from getting all admins list', async () => {
        const loggedInPatient = { _id: 'patient123', role: 'patient' };
        const token = jwt.sign({ id: loggedInPatient._id, role: loggedInPatient.role }, JWT_SECRET);
        Patient.findById = jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(loggedInPatient)
        });

        const response = await request(app)
          .get('/api/auth/admins')
          .set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.message).toMatch(/not authorized/i);
      });
    });
  });
});
