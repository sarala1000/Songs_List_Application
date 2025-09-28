# 🧪 Testing Guide

This document provides a comprehensive guide to testing the Song List App.

## 📋 Test Structure

### Backend Tests
- **Unit Tests**: Test individual services, controllers, and modules
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete application workflows

### Frontend Tests
- **Component Tests**: Test React components with React Testing Library
- **Hook Tests**: Test custom React hooks
- **E2E Tests**: Test complete user workflows with Playwright

## 🚀 Running Tests

### Backend Tests

```bash
# Run all backend tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Debug tests
npm run test:debug
```

### Frontend Tests

```bash
# Run all frontend tests
cd frontend
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📊 Test Coverage

### Backend Coverage
- **Target**: 80% coverage for branches, functions, lines, and statements
- **Coverage Reports**: Generated in `backend/coverage/` directory
- **Thresholds**: Configured in `jest.config.js`

### Frontend Coverage
- **Target**: 80% coverage for branches, functions, lines, and statements
- **Coverage Reports**: Generated in `frontend/coverage/` directory
- **Thresholds**: Configured in `vitest.config.ts`

## 🧩 Test Categories

### 1. Unit Tests

#### Backend Unit Tests
- **SongsService**: Tests CSV parsing, data transformation, and database operations
- **SongsController**: Tests HTTP endpoints, request validation, and response formatting
- **AppService**: Tests health check functionality
- **AppController**: Tests health check endpoint

#### Frontend Unit Tests
- **FileUpload Component**: Tests file upload, drag & drop, and user interactions
- **SongsTable Component**: Tests table rendering, data display, and view modes
- **Custom Hooks**: Tests React Query hooks for data fetching and mutations

### 2. Integration Tests

#### Backend Integration
- **API Endpoints**: Tests complete request/response cycles
- **Database Operations**: Tests Supabase integration
- **File Upload**: Tests multipart form data handling
- **Error Handling**: Tests error responses and status codes

#### Frontend Integration
- **Component Integration**: Tests component interactions
- **API Integration**: Tests API service calls
- **State Management**: Tests React Query state management

### 3. End-to-End Tests

#### Backend E2E
- **Complete API Workflows**: Tests full API request/response cycles
- **Error Scenarios**: Tests error handling and edge cases
- **Performance**: Tests response times and concurrent requests

#### Frontend E2E
- **User Workflows**: Tests complete user journeys
- **File Upload Flow**: Tests CSV upload and data display
- **Navigation**: Tests app navigation and UI interactions
- **Responsive Design**: Tests different viewport sizes

## 🔧 Test Configuration

### Backend Configuration
- **Jest**: Main testing framework
- **Supertest**: HTTP assertion library
- **TypeScript**: Full TypeScript support
- **Coverage**: Istanbul coverage reports

### Frontend Configuration
- **Vitest**: Fast testing framework
- **React Testing Library**: Component testing utilities
- **Playwright**: E2E testing framework
- **MSW**: API mocking for tests

## 📝 Test Best Practices

### 1. Test Structure
```typescript
describe('Component/Service Name', () => {
  describe('Method/Feature Name', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### 2. Test Naming
- Use descriptive test names
- Follow the pattern: "should [expected behavior] when [condition]"
- Group related tests with `describe` blocks

### 3. Test Data
- Use consistent mock data
- Create reusable test fixtures
- Keep test data minimal and focused

### 4. Assertions
- Use specific assertions
- Test both positive and negative cases
- Verify error handling

### 5. Cleanup
- Clean up after each test
- Reset mocks between tests
- Avoid test interdependencies

## 🐛 Debugging Tests

### Backend Debugging
```bash
# Debug specific test
npm run test:debug -- --testNamePattern="SongsService"

# Debug with breakpoints
npm run test:debug -- --runInBand
```

### Frontend Debugging
```bash
# Debug with UI
npm run test:ui

# Debug specific test
npm test -- --testNamePattern="FileUpload"
```

### E2E Debugging
```bash
# Run E2E tests in headed mode
npm run test:e2e -- --headed

# Debug specific E2E test
npm run test:e2e -- --grep "upload flow"
```

## 📈 Continuous Integration

### GitHub Actions (Recommended)
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

### Test Reports
- **Coverage Reports**: HTML and LCOV formats
- **Test Results**: JUnit XML format
- **E2E Reports**: Playwright HTML reports

## 🔍 Test Monitoring

### Coverage Monitoring
- Track coverage trends over time
- Set coverage thresholds
- Fail builds on coverage drops

### Performance Monitoring
- Monitor test execution time
- Track E2E test performance
- Optimize slow tests

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Vitest Documentation](https://vitest.dev/guide/)
- [MSW Documentation](https://mswjs.io/docs/getting-started)

## 🎯 Test Goals

1. **Reliability**: Tests should be stable and reliable
2. **Coverage**: Maintain high test coverage
3. **Performance**: Tests should run quickly
4. **Maintainability**: Tests should be easy to maintain
5. **Documentation**: Tests should serve as documentation

---

**Happy Testing! 🧪✨**


