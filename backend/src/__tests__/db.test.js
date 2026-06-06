'use strict';

/**
 * db.test.js
 *
 * Unit-tests the connectDB helper in isolation.
 * Mongoose is mocked — no real MongoDB connection is made.
 */

// ── Mock mongoose with an explicit factory so connect is a jest.fn() ─────────
jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

const mongoose = require('mongoose');

// Pull in the module AFTER the mock is set up
const connectDB = require('../../db/db');

// ─────────────────────────────────────────────────────────────────────────────

describe('connectDB', () => {
  // Silence console output during tests
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Reset mock state between tests
    mongoose.connect.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls mongoose.connect with MONGO_URI env variable', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/palmcrest_test';
    mongoose.connect.mockResolvedValueOnce({});

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledTimes(1);
    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://localhost:27017/palmcrest_test'
    );
  });

  it('logs success message on successful connection', async () => {
    mongoose.connect.mockResolvedValueOnce({});

    await connectDB();

    expect(console.log).toHaveBeenCalledWith(
      expect.stringMatching(/mongodb connected/i)
    );
  });

  it('calls process.exit(1) when mongoose.connect rejects', async () => {
    const mockExit = jest
      .spyOn(process, 'exit')
      .mockImplementation(() => { throw new Error('process.exit called'); });

    mongoose.connect.mockRejectedValueOnce(new Error('connection refused'));

    await expect(connectDB()).rejects.toThrow('process.exit called');
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
  });
});

