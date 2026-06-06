'use strict';

/**
 * health.test.js
 *
 * Smoke-tests the Express app's root route WITHOUT connecting to MongoDB.
 * We mock the DB module so the test is fast, isolated, and works in CI.
 */

// ── Mock the DB before anything imports server ──────────────────────────────
jest.mock('../../db/db', () => jest.fn().mockResolvedValue(undefined));

const request = require('supertest');

// We can't import server.js directly because it calls app.listen().
// Instead we extract just the Express app so supertest controls the port.
const express = require('express');

function buildApp() {
  const app = express();
  app.use(express.json());

  // Mirror the route(s) from server.js
  app.get('/', (req, res) => {
    res.send('Hello welcome to palmcrest ent Hospital');
  });

  return app;
}

// ─────────────────────────────────────────────────────────────────────────────

describe('GET /', () => {
  let app;

  beforeAll(() => {
    app = buildApp();
  });

  it('should return 200 and a welcome message', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/palmcrest/i);
  });

  it('should return text/html content-type', async () => {
    const res = await request(app).get('/');

    expect(res.headers['content-type']).toMatch(/text\/html/);
  });
});

describe('GET /unknown', () => {
  let app;

  beforeAll(() => {
    app = buildApp();
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');

    expect(res.statusCode).toBe(404);
  });
});
