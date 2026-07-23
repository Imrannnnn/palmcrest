'use strict';

jest.mock('../../db/db', () => jest.fn().mockResolvedValue(undefined));
jest.mock('../../model/Review');
jest.mock('../../model/Appointment');

const express = require('express');
const request = require('supertest');
const Review = require('../../model/Review');
const Appointment = require('../../model/Appointment');
const reviewRoutes = require('../../routes/reviewRoutes');
const errorHandler = require('../../middleware/error');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/reviews', reviewRoutes);
  app.use(errorHandler);
  return app;
}

describe('Reviews Routes Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = buildApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/reviews', () => {
    it('should successfully get list of all reviews sorted by newest', async () => {
      const mockReviews = [
        { _id: 'r1', rating: 5, comments: 'Excellent!' },
        { _id: 'r2', rating: 4, comments: 'Very good' },
      ];
      Review.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockReviews),
      });

      const response = await request(app).get('/api/reviews');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]._id).toBe('r1');
    });
  });

  describe('GET /api/reviews/appointment/:appointmentId', () => {
    it('should return appointment review info when not already reviewed', async () => {
      const mockAppt = {
        _id: 'appt123',
        patient: { fullName: 'John Patient' },
        doctor: { fullName: 'Dr. Jane' },
        date: '2026-07-20T00:00:00.000Z',
        timeSlot: '11:00 AM',
        title: 'Checkup',
      };

      Appointment.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockAppt),
        }),
      });

      Review.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app).get('/api/reviews/appointment/appt123');
      expect(response.statusCode).toBe(200);
      expect(response.body.patientName).toBe('John Patient');
      expect(response.body.doctorName).toBe('Dr. Jane');
      expect(response.body.alreadyReviewed).toBe(false);
    });

    it('should return alreadyReviewed as true when review exists', async () => {
      const mockAppt = {
        _id: 'appt123',
        patient: { fullName: 'John Patient' },
        doctor: { fullName: 'Dr. Jane' },
        date: '2026-07-20T00:00:00.000Z',
        timeSlot: '11:00 AM',
        title: 'Checkup',
      };

      Appointment.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockAppt),
        }),
      });

      Review.findOne = jest.fn().mockResolvedValue({ _id: 'r1' });

      const response = await request(app).get('/api/reviews/appointment/appt123');
      expect(response.statusCode).toBe(200);
      expect(response.body.alreadyReviewed).toBe(true);
    });
  });

  describe('POST /api/reviews', () => {
    it('should successfully submit a review', async () => {
      const mockAppt = {
        _id: 'appt123',
        patient: { _id: 'p1', fullName: 'John Patient' },
        doctor: { _id: 'd1', fullName: 'Dr. Jane' },
      };

      Appointment.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockAppt),
        }),
      });

      Review.findOne = jest.fn().mockResolvedValue(null);
      Review.create = jest.fn().mockResolvedValue({
        _id: 'newr1',
        rating: 5,
        comments: 'Loved the service!',
      });

      const response = await request(app)
        .post('/api/reviews')
        .send({
          appointmentId: 'appt123',
          rating: 5,
          comments: 'Loved the service!',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body._id).toBe('newr1');
      expect(response.body.rating).toBe(5);
    });

    it('should reject submission if already reviewed', async () => {
      const mockAppt = {
        _id: 'appt123',
        patient: { _id: 'p1', fullName: 'John Patient' },
        doctor: { _id: 'd1', fullName: 'Dr. Jane' },
      };

      Appointment.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockAppt),
        }),
      });

      Review.findOne = jest.fn().mockResolvedValue({ _id: 'existingr1' });

      const response = await request(app)
        .post('/api/reviews')
        .send({
          appointmentId: 'appt123',
          rating: 5,
          comments: 'Loved the service!',
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/already/i);
    });
  });
});
