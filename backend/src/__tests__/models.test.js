'use strict';

const bcrypt = require('bcryptjs');

const Patient = require('../../model/Patient');
const Doctor = require('../../model/Doctor');
const Admin = require('../../model/Admin');
const Appointment = require('../../model/Appointment');
const Note = require('../../model/Note');

describe('Mongoose Models Schema Verification', () => {
  describe('Patient Model', () => {
    it('should have correct paths and constraints', () => {
      const paths = Patient.schema.paths;
      
      expect(paths.fullName.instance).toBe('String');
      expect(paths.fullName.isRequired).toBe(true);

      expect(paths.email.instance).toBe('String');
      expect(paths.email.isRequired).toBe(true);
      expect(paths.email.options.unique).toBe(true);

      expect(paths.password.instance).toBe('String');
      expect(paths.password.isRequired).toBe(true);

      expect(paths.role.instance).toBe('String');
      expect(paths.role.options.default).toBe('patient');
      expect(paths.role.options.enum).toContain('patient');

      expect(paths.patientId.instance).toBe('String');
      expect(paths.patientId.options.unique).toBe(true);

      expect(paths.gender.options.enum).toContain('Male');
      expect(paths.gender.options.enum).toContain('Female');
    });

    it('should compare password using bcrypt', async () => {
      const patient = new Patient({ password: 'hashedpassword' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const isMatch = await patient.comparePassword('mypassword');
      expect(isMatch).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('mypassword', 'hashedpassword');
    });

    it('should validate correctly with valid fields', () => {
      const patient = new Patient({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'securepassword123',
        gender: 'Female',
      });
      const error = patient.validateSync();
      expect(error).toBeUndefined();
    });

    it('should fail validation with invalid fields', () => {
      const patient = new Patient({
        fullName: '',
        email: 'invalid-email',
        password: 'short',
      });
      const error = patient.validateSync();
      expect(error).toBeDefined();
      expect(error.errors.fullName).toBeDefined();
      expect(error.errors.email).toBeDefined();
      expect(error.errors.password).toBeDefined();
    });
  });

  describe('Doctor Model', () => {
    it('should have correct paths and constraints', () => {
      const paths = Doctor.schema.paths;

      expect(paths.fullName.instance).toBe('String');
      expect(paths.fullName.isRequired).toBe(true);

      expect(paths.email.instance).toBe('String');
      expect(paths.email.isRequired).toBe(true);
      expect(paths.email.options.unique).toBe(true);

      expect(paths.role.instance).toBe('String');
      expect(paths.role.options.default).toBe('doctor');

      expect(paths.specialization.instance).toBe('String');
      expect(paths.specialization.isRequired).toBe(true);
    });

    it('should compare password using bcrypt', async () => {
      const doctor = new Doctor({ password: 'hashedpassword' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

      const isMatch = await doctor.comparePassword('mypassword');
      expect(isMatch).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('mypassword', 'hashedpassword');
    });
  });

  describe('Admin Model', () => {
    it('should have correct paths and constraints', () => {
      const paths = Admin.schema.paths;

      expect(paths.fullName.instance).toBe('String');
      expect(paths.fullName.isRequired).toBe(true);

      expect(paths.email.instance).toBe('String');
      expect(paths.email.isRequired).toBe(true);
      expect(paths.email.options.unique).toBe(true);

      expect(paths.role.instance).toBe('String');
      expect(paths.role.options.default).toBe('admin');
    });
  });

  describe('Appointment Model', () => {
    it('should have correct paths and references', () => {
      const paths = Appointment.schema.paths;

      expect(paths.patient.instance).toBe('ObjectId');
      expect(paths.patient.options.ref).toBe('Patient');
      expect(paths.patient.isRequired).toBe(true);

      expect(paths.doctor.instance).toBe('ObjectId');
      expect(paths.doctor.options.ref).toBe('Doctor');
      expect(paths.doctor.isRequired).toBe(true);

      expect(paths.title.instance).toBe('String');
      expect(paths.title.isRequired).toBe(true);

      expect(paths.date.instance).toBe('Date');
      expect(paths.date.isRequired).toBe(true);

      expect(paths.timeSlot.instance).toBe('String');
      expect(paths.timeSlot.isRequired).toBe(true);

      expect(paths.duration.instance).toBe('Number');
      expect(paths.duration.options.default).toBe(30);

      expect(paths.status.instance).toBe('String');
      expect(paths.status.options.default).toBe('Pending');
      expect(paths.status.options.enum).toContain('Pending');
      expect(paths.status.options.enum).toContain('Approved');

      expect(paths.type.instance).toBe('String');
      expect(paths.type.options.default).toBe('Appointment');
      expect(paths.type.options.enum).toContain('Appointment');
      expect(paths.type.options.enum).toContain('Surgery');
    });
  });

  describe('Note Model', () => {
    it('should have correct paths and references', () => {
      const paths = Note.schema.paths;

      expect(paths.patient.instance).toBe('ObjectId');
      expect(paths.patient.options.ref).toBe('Patient');
      expect(paths.patient.isRequired).toBe(true);

      expect(paths.doctor.instance).toBe('ObjectId');
      expect(paths.doctor.options.ref).toBe('Doctor');
      expect(paths.doctor.isRequired).toBe(true);

      expect(paths.note.instance).toBe('String');
      expect(paths.note.isRequired).toBe(true);

      expect(paths.priority.instance).toBe('String');
      expect(paths.priority.options.default).toBe('Routine');
      expect(paths.priority.options.enum).toContain('Routine');
      expect(paths.priority.options.enum).toContain('Urgent');
    });
  });
});
