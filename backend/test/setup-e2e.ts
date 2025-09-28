/**
 * E2E test setup
 * This file runs before all e2e tests
 */

import { execSync } from 'child_process';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

// Global e2e test timeout
jest.setTimeout(30000);

// Setup and teardown for e2e tests
beforeAll(async () => {
  // Start the application for e2e tests
  console.log('🚀 Starting e2e test environment...');
});

afterAll(async () => {
  // Cleanup after e2e tests
  console.log('🧹 Cleaning up e2e test environment...');
});

// Global error handler for e2e tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});


