'use strict';

/** @type {import('jest').Config} */
module.exports = {
  // Use Node environment (no DOM)
  testEnvironment: 'node',

  // Only pick up files inside __tests__ folders or *.test.js
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/*.test.js',
  ],

  // Don't transform anything — we're plain CommonJS
  transform: {},

  // Clear mocks between every test
  clearMocks: true,
  restoreMocks: true,

  // Coverage
  collectCoverageFrom: [
    '**/*.js',
    '!server.js',          // entry point — hard to unit-test in isolation
    '!jest.config.js',
    '!node_modules/**',
    '!coverage/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Keeps CI output readable
  verbose: true,

  // Force Jest to exit even if open handles remain (e.g. DB connection)
  forceExit: true,
};
