/**
 * Tests for User Creation API
 *
 * This test suite validates the user creation endpoint which is protected
 * by ADMIN_SECRET and handles user registration with optional API key generation.
 */

import { POST } from '@/app/api/users/create/route'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }
}))

// Mock bcrypt
jest.mock('bcryptjs')

// Mock crypto for API key generation
const mockRandomBytes = jest.fn()
jest.mock('crypto', () => ({
  randomBytes: (...args: any[]) => mockRandomBytes(...args)
}))

describe('User Creation API', () => {
  const mockSupabaseAdmin = require('@/lib/supabase').supabaseAdmin
  const ADMIN_SECRET = 'test-admin-secret'

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.ADMIN_SECRET = ADMIN_SECRET
  })

  describe('Authorization', () => {
    it('should reject request without admin secret', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Unauthorized')
    })

    it('should reject request with invalid admin secret', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': 'wrong-secret'
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toContain('Unauthorized')
    })
  })

  describe('User Creation', () => {
    it('should create user with valid credentials and admin secret', async () => {
      const mockHashedPassword = '$2a$10$hashedpassword'
      const mockUserId = 'user-123'

      ;(bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword)

      mockSupabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockUserId,
                username: 'testuser',
                api_key: null
              },
              error: null
            })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user.id).toBe(mockUserId)
      expect(data.user.username).toBe('testuser')
    })

    it('should create user with API key when generateApiKey is true', async () => {
      const mockHashedPassword = '$2a$10$hashedpassword'
      const mockUserId = 'user-123'
      const mockApiKey = 'generated-api-key'

      ;(bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword)

      // Mock crypto.randomBytes
      mockRandomBytes.mockReturnValue({
        toString: jest.fn().mockReturnValue(mockApiKey)
      })

      mockSupabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: mockUserId,
                username: 'testuser',
                api_key: mockApiKey
              },
              error: null
            })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123',
          generateApiKey: true
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user.api_key).toBe(mockApiKey)
    })

    it('should reject when username is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET
        },
        body: JSON.stringify({
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('required')
    })

    it('should reject when password is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET
        },
        body: JSON.stringify({
          username: 'testuser'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('required')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$hashedpassword')

      mockSupabaseAdmin.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET
        },
        body: JSON.stringify({
          username: 'testuser',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBeDefined()
    })
  })
})
