/**
 * INTEGRATION TEST - Uses Real Supabase Database
 *
 * This test connects to a REAL test database to verify:
 * - Database connection works
 * - SQL queries are correct
 * - Schema matches our code
 * - Authentication flow works end-to-end
 *
 * Setup Required:
 * 1. Create a separate Supabase project for testing
 * 2. Set SUPABASE_TEST_URL and SUPABASE_TEST_KEY in .env.test
 * 3. Run database migrations on test database
 *
 * Run with: npm run test:integration
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Skip if test environment not configured
const skipIntegrationTests = !process.env.SUPABASE_TEST_URL || !process.env.SUPABASE_TEST_KEY

describe.skip('Authentication Integration Tests', () => {
  let testSupabase: any
  const testUsername = `test_user_${Date.now()}`
  const testPassword = 'TestPassword123!'

  beforeAll(async () => {
    if (skipIntegrationTests) {
      console.log('⚠️  Skipping integration tests - test database not configured')
      return
    }

    // Connect to REAL test database
    testSupabase = createClient(
      process.env.SUPABASE_TEST_URL!,
      process.env.SUPABASE_TEST_KEY!
    )
  })

  afterAll(async () => {
    if (!skipIntegrationTests && testSupabase) {
      // Cleanup: Delete test user
      await testSupabase
        .from('users')
        .delete()
        .eq('username', testUsername)
    }
  })

  it('should create user in real database and authenticate', async () => {
    if (skipIntegrationTests) return

    // 1. Create user in REAL database
    const hashedPassword = await bcrypt.hash(testPassword, 10)

    const { data: createdUser, error: createError } = await testSupabase
      .from('users')
      .insert({
        username: testUsername,
        password_hash: hashedPassword
      })
      .select()
      .single()

    expect(createError).toBeNull()
    expect(createdUser).toBeTruthy()
    expect(createdUser.username).toBe(testUsername)

    // 2. Fetch user from REAL database
    const { data: fetchedUser, error: fetchError } = await testSupabase
      .from('users')
      .select('*')
      .eq('username', testUsername)
      .single()

    expect(fetchError).toBeNull()
    expect(fetchedUser).toBeTruthy()

    // 3. Verify password comparison works
    const isValid = await bcrypt.compare(testPassword, fetchedUser.password_hash)
    expect(isValid).toBe(true)

    // 4. Verify wrong password fails
    const isInvalid = await bcrypt.compare('WrongPassword', fetchedUser.password_hash)
    expect(isInvalid).toBe(false)
  })

  it('should return error for non-existent user', async () => {
    if (skipIntegrationTests) return

    const { data, error } = await testSupabase
      .from('users')
      .select('*')
      .eq('username', 'non_existent_user_12345')
      .single()

    expect(error).toBeTruthy() // Should have error
    expect(data).toBeNull()
  })

  it('should enforce unique username constraint', async () => {
    if (skipIntegrationTests) return

    const hashedPassword = await bcrypt.hash('password', 10)

    // Try to create duplicate user
    const { error } = await testSupabase
      .from('users')
      .insert({
        username: testUsername, // Same username as before
        password_hash: hashedPassword
      })

    // Should fail with unique constraint violation
    expect(error).toBeTruthy()
    expect(error.code).toBe('23505') // PostgreSQL unique violation code
  })
})

/**
 * To enable these tests:
 *
 * 1. Create .env.test file:
 *    SUPABASE_TEST_URL=https://your-test-project.supabase.co
 *    SUPABASE_TEST_KEY=your-test-anon-key
 *
 * 2. Add to package.json:
 *    "test:integration": "jest --testPathPattern=integration"
 *
 * 3. Run: npm run test:integration
 */
