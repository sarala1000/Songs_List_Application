/**
 * Test setup for Vitest and React Testing Library
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server.js';

// Extend expect with custom matchers
import { expect } from 'vitest';

// Setup MSW (Mock Service Worker)
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// Global test utilities
declare global {
  namespace Vi {
    interface Assertion<T> {
      toBeInTheDocument(): T;
      toHaveClass(className: string): T;
      toHaveTextContent(text: string): T;
      toBeVisible(): T;
      toBeDisabled(): T;
      toBeEnabled(): T;
    }
  }
}

// Custom matchers for better test assertions
expect.extend({
  toBeInTheDocument(received: any) {
    const pass = received && received.ownerDocument && received.ownerDocument.body.contains(received);
    return {
      pass,
      message: () => `expected element ${pass ? 'not ' : ''}to be in the document`,
    };
  },
  toHaveClass(received: any, className: string) {
    const pass = received && received.classList && received.classList.contains(className);
    return {
      pass,
      message: () => `expected element ${pass ? 'not ' : ''}to have class "${className}"`,
    };
  },
  toHaveTextContent(received: any, text: string) {
    const pass = received && received.textContent && received.textContent.includes(text);
    return {
      pass,
      message: () => `expected element ${pass ? 'not ' : ''}to have text content "${text}"`,
    };
  },
  toBeVisible(received: any) {
    const pass = received && received.offsetParent !== null;
    return {
      pass,
      message: () => `expected element ${pass ? 'not ' : ''}to be visible`,
    };
  },
  toBeDisabled(received: any) {
    const pass = received && received.disabled === true;
    return {
      pass,
      message: () => `expected element ${pass ? 'not ' : ''}to be disabled`,
    };
  },
  toBeEnabled(received: any) {
    const pass = received && received.disabled === false;
    return {
      pass,
      message: () => `expected element ${pass ? 'not ' : ''}to be enabled`,
    };
  },
});
