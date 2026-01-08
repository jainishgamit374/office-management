# Authentication API Testing Suite

## Quick Start

### Running Tests

```bash
# Run all tests
npm test

# Run only authentication tests
npm run test:auth

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Environment Setup

1. **Configure test credentials** in `.env.test`:
   ```env
   API_BASE_URL=https://karmyog.pythonanywhere.com
   TEST_USER_EMAIL=your-test-email@example.com
   TEST_USER_PASSWORD=your-test-password
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Run the tests**:
   ```bash
   npm run test:auth
   ```

## Test Structure

```
__tests__/
├── setup.ts                    # Global test setup
├── utils/
│   ├── testData.ts            # Test data constants
│   └── testHelpers.ts         # Helper functions
└── api/
    └── auth/
        ├── login.test.ts      # Login API tests (AUTH-001 to AUTH-015)
        ├── register.test.ts   # Registration API tests
        ├── logout.test.ts     # Logout API tests
        └── tokenManagement.test.ts  # Token verification & refresh tests
```

## Test Coverage

### Authentication Tests

#### Login API (`login.test.ts`)
- ✅ **AUTH-001**: Valid login with correct credentials
- ✅ **AUTH-002**: Invalid email format validation
- ✅ **AUTH-003**: Wrong password rejection
- ✅ **AUTH-004**: Non-existent user handling
- ✅ **AUTH-005**: Empty email validation
- ✅ **AUTH-006**: Empty password validation
- ✅ **AUTH-007**: SQL injection prevention
- ✅ **AUTH-008**: XSS attack sanitization
- ✅ **AUTH-009**: Very long email handling
- ✅ **AUTH-010**: Special characters in password
- ✅ **AUTH-011**: Unicode character handling
- ✅ **AUTH-012**: Case sensitivity consistency
- ✅ **AUTH-013**: Concurrent login requests
- ✅ **AUTH-014**: Brute force protection
- ✅ **AUTH-015**: Token expiry and refresh flow

#### Registration API (`register.test.ts`)
- ✅ Valid registration with all required fields
- ✅ Email format validation
- ✅ Duplicate email prevention
- ✅ Password matching validation
- ✅ Password strength requirements
- ✅ Date validation (DOB, joining date)
- ✅ SQL injection prevention
- ✅ XSS sanitization
- ✅ Required field validation

#### Logout API (`logout.test.ts`)
- ✅ Successful logout with valid token
- ✅ Token invalidation after logout
- ✅ Logout without authentication
- ✅ Invalid token handling
- ✅ Expired token handling

#### Token Management (`tokenManagement.test.ts`)
- ✅ Token verification
- ✅ Token refresh flow
- ✅ JWT structure validation
- ✅ Token expiration claims
- ✅ Authenticated request handling
- ✅ Token security checks

## Test Data

The test suite uses comprehensive test data including:

- **Valid inputs**: Standard test credentials and data
- **Invalid emails**: 10+ invalid email formats
- **SQL injection payloads**: 9 common SQL injection patterns
- **XSS payloads**: 10 cross-site scripting attack vectors
- **Special characters**: Password complexity testing
- **Unicode data**: International character support
- **Edge cases**: Whitespace, empty values, extreme lengths

## Writing New Tests

### Example Test Structure

```typescript
import { loginAndGetTokens, unauthenticatedRequest } from '../../utils/testHelpers';
import { VALID_TEST_DATA, HTTP_STATUS } from '../../utils/testData';

describe('My API Tests', () => {
  it('should do something', async () => {
    const response = await unauthenticatedRequest('/endpoint', 'POST', {
      data: 'value'
    });
    
    expect(response.status).toBe(HTTP_STATUS.OK);
  });
});
```

### Helper Functions

- `loginAndGetTokens(email, password)` - Login and get JWT tokens
- `authenticatedRequest(endpoint, method, token, body)` - Make authenticated API call
- `unauthenticatedRequest(endpoint, method, body)` - Make unauthenticated API call
- `generateRandomEmail()` - Generate unique test email
- `decodeJWT(token)` - Decode JWT payload
- `wait(ms)` - Async delay utility

## Troubleshooting

### Tests Failing?

1. **Check credentials**: Ensure `.env.test` has valid test user credentials
2. **Network issues**: Verify API base URL is accessible
3. **Token expiry**: Some tests may fail if tokens expire during test run
4. **Rate limiting**: Backend may rate limit during brute force tests

### Common Issues

**Issue**: `Cannot find module` errors
**Solution**: Run `npm install` to install all dependencies

**Issue**: Tests timeout
**Solution**: Increase timeout in `jest.config.js` or individual tests

**Issue**: Authentication failures
**Solution**: Verify test user exists and credentials are correct in `.env.test`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
        env:
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

## Best Practices

1. **Use test-specific accounts** - Don't use production user accounts
2. **Clean up after tests** - Remove test data when possible
3. **Mock external dependencies** - For unit tests, mock API calls
4. **Keep tests independent** - Each test should run in isolation
5. **Use descriptive names** - Test names should clearly describe what they test
6. **Test edge cases** - Don't just test happy paths

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [API Testing Best Practices](https://www.testim.io/blog/api-testing-best-practices/)
