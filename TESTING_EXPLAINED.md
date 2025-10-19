# Testing Explained - Mock API App

## Table of Contents
1. [What is Jest?](#what-is-jest)
2. [Understanding Mock API vs Testing](#understanding-mock-api-vs-testing)
3. [How the Tests Work](#how-the-tests-work)
4. [How POST/PUT/DELETE Work in Mock APIs](#how-postputdelete-work-in-mock-apis)
5. [Test Examples Explained](#test-examples-explained)

---

## What is Jest?

**Jest** is a JavaScript testing framework created by Facebook. Think of it as a robot that automatically checks if your code works correctly.

### Why Use Jest?

- **Automated Testing**: Run hundreds of tests in seconds instead of manually clicking through your app
- **Catch Bugs Early**: Find problems before users do
- **Refactor Safely**: Change code confidently knowing tests will catch any breaks
- **Documentation**: Tests show how your code is supposed to work
- **Continuous Integration**: Tests run automatically when you push code to GitHub

### Jest Commands

```bash
npm test              # Run all tests once
npm run test:watch    # Re-run tests when files change (development mode)
npm run test:coverage # Show which code is tested vs untested
```

---

## Understanding Mock API vs Testing

There are **TWO DIFFERENT THINGS** happening here that can be confusing:

### 1. Your Mock API App (What Your App Does for Users)

Your application allows users to create **fake/mock API endpoints** for testing their frontends.

**Example Scenario:**
```
Frontend Developer's Problem:
- Building a user interface
- Backend team hasn't finished the API yet
- Needs fake API responses to test the UI

Your Mock API App's Solution:
- User creates a fake endpoint in your app
- Configure: POST /api/users returns {"id": "123", "created": true}
- Frontend developer can now test their UI with this fake response
```

**Important:** When someone calls a mock endpoint you created, **NOTHING happens in a database**. The mock endpoint just returns the response you configured. It's intentionally fake!

### 2. The Tests (Testing Your App Itself)

The tests verify that **your Mock API App software** works correctly.

**What Tests Check:**
- ✅ Can users create projects?
- ✅ Can users create endpoints?
- ✅ Do mock endpoints return the right response?
- ✅ Does authentication work?
- ✅ Does API key validation work?

---

## How the Tests Work

### Test Structure

Every test follows this pattern:

```javascript
describe('Feature Name', () => {
  // Setup: Run before each test
  beforeEach(() => {
    // Reset mocks, clear data, etc.
  })

  it('should do something specific', () => {
    // 1. ARRANGE: Set up test data
    // 2. ACT: Do the thing you're testing
    // 3. ASSERT: Check if it worked correctly
  })
})
```

### Mocking (Faking Dependencies)

In tests, we **mock** (fake) external dependencies like databases:

```javascript
// Instead of connecting to real Supabase database...
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: '123', username: 'test' },
            error: null
          })
        }))
      }))
    }))
  }
}))

// Now when code calls supabaseAdmin.from('users').select()...
// It gets our fake data instead of hitting a real database!
```

**Why Mock?**
- ✅ Tests run fast (no network calls)
- ✅ Tests are reliable (no real database to break)
- ✅ Tests are isolated (don't affect real data)
- ✅ Can simulate errors easily

---

## How POST/PUT/DELETE Work in Mock APIs

### The Confusion

You're right to be confused! Let me clarify:

### Your Mock API App Has TWO Sets of Endpoints:

#### A) Management Endpoints (Your App's Real API)
These actually DO interact with the database:

```
POST /api/projects              → Creates a project IN YOUR DATABASE
POST /api/projects/[id]/endpoints → Creates an endpoint config IN YOUR DATABASE
PUT /api/projects/[id]/endpoints/[endpointId] → Updates endpoint config IN YOUR DATABASE
DELETE /api/projects/[id]/endpoints/[endpointId] → Deletes endpoint config FROM YOUR DATABASE
```

These are REAL endpoints that manage your app's data.

#### B) Mock Endpoints (What Users Create)
These DON'T interact with any database - they just return configured responses:

```
GET /api/mock/[projectId]/api/users
  → Looks up endpoint config in YOUR database
  → Returns the response_body you configured
  → Doesn't touch any "users" database

POST /api/mock/[projectId]/api/users
  → Looks up endpoint config in YOUR database
  → Returns the response_body you configured
  → Doesn't create any users anywhere!
```

### Example Flow:

**Step 1: User Creates a Mock Endpoint (Uses Management API)**
```bash
# This DOES use your database (creates endpoint configuration)
POST /api/projects/abc123/endpoints
{
  "method": "POST",
  "path": "/api/users",
  "response_body": "{\"id\": \"999\", \"created\": true}",
  "status_code": 201
}

# Stored in YOUR database:
endpoints table:
  id: endpoint-456
  project_id: abc123
  method: POST
  path: /api/users
  response_body: {"id": "999", "created": true}
  status_code: 201
```

**Step 2: Someone Calls the Mock Endpoint**
```bash
# This DOESN'T use any database - just returns configured response
POST http://localhost:3000/api/mock/abc123/api/users
{
  "name": "John",
  "email": "john@example.com"
}

# What happens:
# 1. Your app looks up endpoint config from YOUR database
# 2. Finds: method=POST, path=/api/users, response_body={"id":"999","created":true}
# 3. Returns the configured response (ignores the input!)
# 4. No "user" is created anywhere - it's a fake response!

Response:
{
  "id": "999",
  "created": true
}
```

**The mock endpoint ignores the request body!** It always returns what you configured, regardless of what data is sent. That's the whole point - it's a fake API for testing.

---

## Test Examples Explained

### Example 1: Testing Mock Endpoint Serving

```javascript
it('should match POST method correctly', async () => {
  // ARRANGE: Set up fake database response
  const mockEndpoint = {
    id: 'endpoint-2',
    project_id: projectId,
    method: 'POST',
    path: '/api/users',
    response_body: '{"id": "123", "created": true}',
    status_code: 201,
    requires_sub_key: false
  }

  // Mock database to return this endpoint config
  mockSupabaseAdmin.from.mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [mockEndpoint],
            error: null
          })
        })
      })
    })
  })

  // ACT: Make a POST request to the mock endpoint
  const request = new NextRequest(`http://localhost:3000/api/mock/${projectId}/api/users`, {
    method: 'POST'
  })
  const response = await POST(request, {
    params: { projectId, path: ['api', 'users'] }
  })

  // ASSERT: Check if it worked correctly
  expect(response.status).toBe(201)
  const data = await response.json()
  expect(data).toEqual({ id: '123', created: true })
})
```

**What This Test Verifies:**
✅ The mock API correctly matches POST requests
✅ Returns the configured response body
✅ Returns the configured status code
✅ The matching logic works (method + path + project)

**What This Test Does NOT Do:**
❌ Doesn't actually create a user anywhere
❌ Doesn't use a real database
❌ Doesn't test the frontend

### Example 2: Testing Authentication

```javascript
it('should authenticate with valid username and password', async () => {
  // ARRANGE: Create fake user data
  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    password_hash: '$2a$10$hashedpassword'
  }

  // Mock database to return this user
  mockSupabaseAdmin.from.mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: mockUser,
          error: null
        })
      })
    })
  })

  // Mock bcrypt to say password is correct
  ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

  // ACT: Try to authenticate
  const provider = authOptions.providers[0]
  if ('authorize' in provider && provider.authorize) {
    const result = await provider.authorize({
      username: 'testuser',
      password: 'password123',
      apiKey: ''
    }, {} as any)

    // ASSERT: Check if authentication succeeded
    expect(result).toEqual({
      id: mockUser.id,
      name: mockUser.username,
      email: mockUser.username
    })
  }
})
```

**What This Test Verifies:**
✅ Authentication logic works correctly
✅ Password comparison happens
✅ User object is returned on success
✅ Handles the authentication flow properly

### Example 3: Testing API Key Validation

```javascript
it('should require API key when requires_sub_key is true', async () => {
  // ARRANGE: Endpoint that requires a key
  const mockEndpoint = {
    id: 'endpoint-3',
    project_id: projectId,
    method: 'GET',
    path: '/api/protected',
    response_body: '{"data": "secret"}',
    status_code: 200,
    requires_sub_key: true  // ← Requires API key!
  }

  mockSupabaseAdmin.from.mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [mockEndpoint],
            error: null
          })
        })
      })
    })
  })

  // ACT: Make request WITHOUT API key
  const request = new NextRequest(`http://localhost:3000/api/mock/${projectId}/api/protected`)
  const response = await GET(request, {
    params: { projectId, path: ['api', 'protected'] }
  })

  // ASSERT: Should be rejected!
  expect(response.status).toBe(401)
  const data = await response.json()
  expect(data.error).toBe('API key required')
})
```

**What This Test Verifies:**
✅ Protected endpoints require API keys
✅ Returns 401 when key is missing
✅ Security logic works correctly

---

## Summary: The Key Points

### 1. Your Mock API App
- Lets users create **fake API endpoints**
- Mock endpoints just return configured responses
- **No real database operations** happen on mock endpoints
- It's intentionally fake - that's the feature!

### 2. The Tests
- Test **your app's code**, not the mock endpoints
- Use **mocked/faked** databases for speed and reliability
- Verify features like auth, endpoint creation, response serving
- Run automatically to catch bugs early

### 3. POST/PUT/DELETE in Mock APIs
- **Management API** (your app): Actually uses database to store endpoint configs
- **Mock Endpoints** (user-created): Just return configured responses, don't do real operations
- This is the whole point - users can test their UI without a real backend!

### 4. Why This is Useful
- Frontend developers can build UIs before backend is ready
- QA teams can test with predictable fake data
- Demos can use fake APIs that always work
- Learning projects don't need real backends

---

## Running the Tests

```bash
# Run all tests
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# See coverage report
npm run test:coverage
```

Look for:
- Green ✓ = Test passed
- Red ✗ = Test failed
- Coverage % = How much code is tested

---

## Questions?

If you're still confused, try this:

1. Read one test file: `__tests__/api/mock.test.ts`
2. Look at what it's testing: `app/api/mock/[projectId]/[...path]/route.ts`
3. Run just that test: `npm test -- mock.test.ts`
4. See it pass or fail
5. Change the code being tested and see the test fail
6. Fix it and see the test pass again

That's the testing workflow! 🚀
