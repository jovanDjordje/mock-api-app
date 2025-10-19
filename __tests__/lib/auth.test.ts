import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }
}))

// Mock bcrypt
jest.mock('bcryptjs')

describe('Authentication', () => {
  const mockSupabaseAdmin = require('@/lib/supabase').supabaseAdmin

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('API Key Authentication', () => {
    it('should authenticate with valid API key', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        api_key: 'valid-api-key'
      }

      // Mock Supabase response for API key auth
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

      const provider = authOptions.providers[0]
      if ('authorize' in provider && provider.authorize) {
        const result = await provider.authorize({
          apiKey: 'valid-api-key',
          username: '',
          password: ''
        }, {} as any)

        expect(result).toEqual({
          id: mockUser.id,
          name: mockUser.username,
          email: mockUser.username
        })
      }
    })

    it('should reject invalid API key', async () => {
      // Mock Supabase response for invalid API key
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' }
            })
          })
        })
      })

      const provider = authOptions.providers[0]
      if ('authorize' in provider && provider.authorize) {
        const result = await provider.authorize({
          apiKey: 'invalid-api-key',
          username: '',
          password: ''
        }, {} as any)

        expect(result).toBeNull()
      }
    })
  })

  describe('Username/Password Authentication', () => {
    it('should authenticate with valid username and password', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        password_hash: '$2a$10$hashedpassword'
      }

      // Mock Supabase response
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

      // Mock bcrypt compare
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const provider = authOptions.providers[0]
      if ('authorize' in provider && provider.authorize) {
        const result = await provider.authorize({
          username: 'testuser',
          password: 'password123',
          apiKey: ''
        }, {} as any)

        expect(result).toEqual({
          id: mockUser.id,
          name: mockUser.username,
          email: mockUser.username
        })
      }
    })

    it('should reject invalid password', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'testuser',
        password_hash: '$2a$10$hashedpassword'
      }

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

      // Mock bcrypt compare to return false
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const provider = authOptions.providers[0]
      if ('authorize' in provider && provider.authorize) {
        const result = await provider.authorize({
          username: 'testuser',
          password: 'wrongpassword',
          apiKey: ''
        }, {} as any)

        expect(result).toBeNull()
      }
    })

    it('should reject non-existent user', async () => {
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' }
            })
          })
        })
      })

      const provider = authOptions.providers[0]
      if ('authorize' in provider && provider.authorize) {
        const result = await provider.authorize({
          username: 'nonexistent',
          password: 'password123',
          apiKey: ''
        }, {} as any)

        expect(result).toBeNull()
      }
    })
  })

  describe('Missing credentials', () => {
    it('should reject when no credentials provided', async () => {
      const provider = authOptions.providers[0]
      if ('authorize' in provider && provider.authorize) {
        const result = await provider.authorize(undefined as any, {} as any)
        expect(result).toBeNull()
      }
    })

    it('should reject when username is provided but password is missing', async () => {
      const provider = authOptions.providers[0]
      if ('authorize' in provider && provider.authorize) {
        const result = await provider.authorize({
          username: 'testuser',
          password: '',
          apiKey: ''
        }, {} as any)
        expect(result).toBeNull()
      }
    })
  })
})
