'use strict';

// Mock DB and models before requiring
jest.mock('../../db/db', () => jest.fn().mockResolvedValue(undefined));
jest.mock('../../model/Patient');
jest.mock('../../model/Doctor');
jest.mock('../../model/Admin');
jest.mock('../../model/Appointment');
jest.mock('../../model/Note');

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const Patient = require('../../model/Patient');
const Doctor = require('../../model/Doctor');
const Appointment = require('../../model/Appointment');
const Note = require('../../model/Note');
const Admin = require('../../model/Admin');

const appointmentRoutes = require('../../routes/appointmentRoutes');
const noteRoutes = require('../../routes/noteRoutes');
const errorHandler = require('../../middleware/error');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'defaultjwtsecret';
const JWT_SECRET = process.env.JWT_SECRET;

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/notes', noteRoutes);
  app.use(errorHandler);
  return app;
}

describe('Appointments & Notes Routes Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Appointments Endpoints', () => {
    it('should allow patient to schedule an appointment', async () => {
      const mockPatient = { _id: 'patient123', role: 'patient' };
      const token = jwt.sign({ id: mockPatient._id, role: mockPatient.role }, JWT_SECRET);

      Patient.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockPatient)
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toLocaleDateString('en-CA');

      const mockAppointment = {
        _id: 'appt123',
        patient: 'patient123',
        doctor: 'doctor456',
        title: 'Audiology Exam',
        date: tomorrow,
        timeSlot: '10:30 AM',
        status: 'Pending'
      };
      Appointment.create.mockResolvedValueOnce(mockAppointment);

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          doctor: 'doctor456',
          title: 'Audiology Exam',
          date: tomorrowStr,
          timeSlot: '10:30 AM'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body._id).toBe('appt123');
      expect(response.body.status).toBe('Pending');
    });

    it('should reject appointment scheduling if user is not a patient', async () => {
      const mockDoctor = { _id: 'doctor456', role: 'doctor' };
      const token = jwt.sign({ id: mockDoctor._id, role: mockDoctor.role }, JWT_SECRET);

      Doctor.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDoctor)
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toLocaleDateString('en-CA');

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          doctor: 'doctor456',
          title: 'Audiology Exam',
          date: tomorrowStr,
          timeSlot: '10:30 AM'
        });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toMatch(/only patients/i);
    });

    it('should reject appointment scheduling if date is in the past', async () => {
      const mockPatient = { _id: 'patient123', role: 'patient' };
      const token = jwt.sign({ id: mockPatient._id, role: mockPatient.role }, JWT_SECRET);

      Patient.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockPatient)
      });

      // Get a past date (yesterday)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          doctor: 'doctor456',
          title: 'Audiology Exam',
          date: yesterdayStr,
          timeSlot: '10:30 AM'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/past/i);
    });

    it('should reject appointment scheduling if date is today but the time slot has already passed', async () => {
      const mockPatient = { _id: 'patient123', role: 'patient' };
      const token = jwt.sign({ id: mockPatient._id, role: mockPatient.role }, JWT_SECRET);

      Patient.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockPatient)
      });

      // Mock date to 2026-07-15 12:00 PM local time
      const realDate = global.Date;
      const mockTime = new realDate('2026-07-15T12:00:00').getTime();
      global.Date = class extends realDate {
        constructor(...args) {
          if (args.length === 0) {
            return new realDate(mockTime);
          }
          return new realDate(...args);
        }
      };

      try {
        const response = await request(app)
          .post('/api/appointments')
          .set('Authorization', `Bearer ${token}`)
          .send({
            doctor: 'doctor456',
            title: 'Audiology Exam',
            date: '2026-07-15',
            timeSlot: '09:00 AM'
          });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toMatch(/time slot that has already passed/i);
      } finally {
        global.Date = realDate;
      }
    });

    it('should return appointments for the logged-in patient', async () => {
      const mockPatient = { _id: 'patient123', role: 'patient' };
      const token = jwt.sign({ id: mockPatient._id, role: mockPatient.role }, JWT_SECRET);

      Patient.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockPatient)
      });

      const mockAppointments = [{ _id: 'appt123', title: 'Audiology Exam' }];
      Appointment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockAppointments)
          })
        })
      });

      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0].title).toBe('Audiology Exam');
      expect(Appointment.find).toHaveBeenCalledWith({ patient: 'patient123' });
    });

    it('should allow doctors to approve their own appointments', async () => {
      const mockDoctor = { _id: 'doctor456', role: 'doctor' };
      const token = jwt.sign({ id: mockDoctor._id, role: mockDoctor.role }, JWT_SECRET);

      Doctor.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDoctor)
      });

      const mockAppt = {
        _id: 'appt123',
        doctor: 'doctor456',
        status: 'Pending',
        save: jest.fn().mockResolvedValue(true)
      };
      Appointment.findById = jest.fn()
        .mockResolvedValueOnce(mockAppt) // first find
        .mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue({ ...mockAppt, status: 'Approved' }) // second find
          })
        });

      const response = await request(app)
        .put('/api/appointments/appt123/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'Approved' });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('Approved');
    });

    it('should block doctors from modifying other doctors\' appointments', async () => {
      const mockDoctor = { _id: 'doctor456', role: 'doctor' };
      const token = jwt.sign({ id: mockDoctor._id, role: mockDoctor.role }, JWT_SECRET);

      Doctor.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDoctor)
      });

      const mockAppt = {
        _id: 'appt123',
        doctor: 'otherdoctor789',
        status: 'Pending'
      };
      Appointment.findById.mockResolvedValueOnce(mockAppt);

      const response = await request(app)
        .put('/api/appointments/appt123/status')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'Approved' });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toMatch(/not authorized to update status/i);
    });
  });

  describe('Notes Endpoints', () => {
    it('should allow doctors to create a clinical note', async () => {
      const mockDoctor = { _id: 'doctor456', role: 'doctor' };
      const token = jwt.sign({ id: mockDoctor._id, role: mockDoctor.role }, JWT_SECRET);

      Doctor.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDoctor)
      });

      const mockNote = {
        _id: 'note123',
        patient: 'patient123',
        doctor: 'doctor456',
        note: 'Patient needs tympanometry',
        priority: 'Urgent'
      };
      Note.create.mockResolvedValueOnce(mockNote);

      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patient: 'patient123',
          note: 'Patient needs tympanometry',
          priority: 'Urgent'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.note).toBe('Patient needs tympanometry');
    });

    it('should block patients from creating clinical notes', async () => {
      const mockPatient = { _id: 'patient123', role: 'patient' };
      const token = jwt.sign({ id: mockPatient._id, role: mockPatient.role }, JWT_SECRET);

      Patient.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockPatient)
      });

      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patient: 'anotherpatient456',
          note: 'Self prescribing note'
        });

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toMatch(/only physicians/i);
    });

    it('should allow patients to view their own notes', async () => {
      const mockPatient = { _id: 'patient123', role: 'patient' };
      const token = jwt.sign({ id: mockPatient._id, role: mockPatient.role }, JWT_SECRET);

      Patient.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockPatient)
      });

      const mockNotes = [{ note: 'Patient shows signs of sinus pressure' }];
      Note.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockNotes)
          })
        })
      });

      const response = await request(app)
        .get('/api/notes/patient/patient123')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body[0].note).toBe('Patient shows signs of sinus pressure');
    });

    it('should block patients from viewing other patients\' notes', async () => {
      const mockPatient = { _id: 'patient123', role: 'patient' };
      const token = jwt.sign({ id: mockPatient._id, role: mockPatient.role }, JWT_SECRET);

      Patient.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockPatient)
      });

      const response = await request(app)
        .get('/api/notes/patient/otherpatient456')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toMatch(/not authorized to view other patients/i);
    });

    it('should allow doctors to view any patient\'s notes', async () => {
      const mockDoctor = { _id: 'doctor456', role: 'doctor' };
      const token = jwt.sign({ id: mockDoctor._id, role: mockDoctor.role }, JWT_SECRET);

      Doctor.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDoctor)
      });

      const mockNotes = [{ note: 'Patient shows signs of sinus pressure' }];
      Note.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockNotes)
          })
        })
      });

      const response = await request(app)
        .get('/api/notes/patient/somepatient789')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body[0].note).toBe('Patient shows signs of sinus pressure');
    });
  });

  describe('GET /api/notes/doctor', () => {
    it('should successfully get list of notes authored by the logged-in doctor', async () => {
      const mockDoctor = { _id: 'doctor456', role: 'doctor' };
      const token = jwt.sign({ id: mockDoctor._id, role: mockDoctor.role }, JWT_SECRET);

      Doctor.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockDoctor)
      });

      const mockNotes = [{ note: 'Written by doctor 456' }];
      Note.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockNotes)
        })
      });

      const response = await request(app)
        .get('/api/notes/doctor')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body[0].note).toBe('Written by doctor 456');
      expect(Note.find).toHaveBeenCalledWith({ doctor: 'doctor456' });
    });

    it('should block non-doctors from accessing doctor notes endpoint', async () => {
      const mockPatient = { _id: 'patient123', role: 'patient' };
      const token = jwt.sign({ id: mockPatient._id, role: mockPatient.role }, JWT_SECRET);

      Patient.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockPatient)
      });

      const response = await request(app)
        .get('/api/notes/doctor')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(403);
      expect(response.body.message).toMatch(/only physicians/i);
    });
  });

  describe('Admin Appointment Filtering', () => {
    it('should allow admin to filter appointments by doctor query parameter', async () => {
      const mockAdmin = { _id: 'admin123', role: 'admin' };
      const token = jwt.sign({ id: mockAdmin._id, role: mockAdmin.role }, JWT_SECRET);

      Admin.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin)
      });

      const mockAppointments = [{ _id: 'appt123', title: 'Hearing Screening' }];
      Appointment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockAppointments)
          })
        })
      });

      const response = await request(app)
        .get('/api/appointments?doctor=doctor456')
        .set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(Appointment.find).toHaveBeenCalledWith({ doctor: 'doctor456' });
    });
  });
});
