/**
 * Tests for Mock API Serving
 *
 * This test suite validates the core functionality of serving mock API endpoints
 * including method matching, path matching, API key validation, and response formatting.
 */

import { GET, POST, PUT, DELETE } from '@/app/api/mock/[projectId]/[...path]/route'
import { NextRequest } from 'next/server'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn()
          }))
        }))
      }))
    }))
  }
}))

describe('Mock API Serving', () => {
  const mockSupabaseAdmin = require('@/lib/supabase').supabaseAdmin
  const projectId = 'test-project-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Endpoint Matching', () => {
    it('should serve GET endpoint with matching path', async () => {
      const mockEndpoint = {
        id: 'endpoint-1',
        project_id: projectId,
        method: 'GET',
        path: '/api/users',
        response_body: '{"users": []}',
        status_code: 200,
        requires_sub_key: false
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

      const request = new NextRequest(`http://localhost:3000/api/mock/${projectId}/api/users`)
      const response = await GET(request, {
        params: { projectId, path: ['api', 'users'] }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ users: [] })
    })

    it('should return 404 when endpoint not found', async () => {
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        })
      })

      const request = new NextRequest(`http://localhost:3000/api/mock/${projectId}/api/notfound`)
      const response = await GET(request, {
        params: { projectId, path: ['api', 'notfound'] }
      })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Endpoint not found')
    })

    it('should match POST method correctly', async () => {
      const mockEndpoint = {
        id: 'endpoint-2',
        project_id: projectId,
        method: 'POST',
        path: '/api/users',
        response_body: '{"id": "123", "created": true}',
        status_code: 201,
        requires_sub_key: false
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

      const request = new NextRequest(`http://localhost:3000/api/mock/${projectId}/api/users`, {
        method: 'POST'
      })
      const response = await POST(request, {
        params: { projectId, path: ['api', 'users'] }
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toEqual({ id: '123', created: true })
    })
  })

  describe('API Key Authentication', () => {
    it('should require API key when requires_sub_key is true', async () => {
      const mockEndpoint = {
        id: 'endpoint-3',
        project_id: projectId,
        method: 'GET',
        path: '/api/protected',
        response_body: '{"data": "secret"}',
        status_code: 200,
        requires_sub_key: true
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

      const request = new NextRequest(`http://localhost:3000/api/mock/${projectId}/api/protected`)
      const response = await GET(request, {
        params: { projectId, path: ['api', 'protected'] }
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('API key required')
    })

    it('should validate API key when provided', async () => {
      const mockEndpoint = {
        id: 'endpoint-4',
        project_id: projectId,
        method: 'GET',
        path: '/api/protected',
        response_body: '{"data": "secret"}',
        status_code: 200,
        requires_sub_key: true
      }

      // First call returns the endpoint
      // Second call validates the API key
      let callCount = 0
      mockSupabaseAdmin.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call - get endpoint
          return {
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
          }
        } else {
          // Second call - validate API key
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: [{ id: 'key-1', key_value: 'valid-key' }],
                  error: null
                })
              })
            })
          }
        }
      })

      const request = new NextRequest(`http://localhost:3000/api/mock/${projectId}/api/protected`, {
        headers: {
          'x-api-key': 'valid-key'
        }
      })
      const response = await GET(request, {
        params: { projectId, path: ['api', 'protected'] }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ data: 'secret' })
    })

    it('should reject invalid API key', async () => {
      const mockEndpoint = {
        id: 'endpoint-5',
        project_id: projectId,
        method: 'GET',
        path: '/api/protected',
        response_body: '{"data": "secret"}',
        status_code: 200,
        requires_sub_key: true
      }

      let callCount = 0
      mockSupabaseAdmin.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return {
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
          }
        } else {
          // Invalid key
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({
                  data: [],
                  error: null
                })
              })
            })
          }
        }
      })

      const request = new NextRequest(`http://localhost:3000/api/mock/${projectId}/api/protected`, {
        headers: {
          'x-api-key': 'invalid-key'
        }
      })
      const response = await GET(request, {
        params: { projectId, path: ['api', 'protected'] }
      })

      expect(response.status).toBe(403)
      const data = await response.json()
      expect(data.error).toBe('Invalid API key')
    })
  })

  describe('Response Formatting', () => {
    it('should return JSON response with correct content-type', async () => {
      const mockEndpoint = {
        id: 'endpoint-6',
        project_id: projectId,
        method: 'GET',
        path: '/api/json',
        response_body: '{"message": "Hello"}',
        status_code: 200,
        requires_sub_key: false
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

      const request = new NextRequest(`http://localhost:3000/api/mock/${projectId}/api/json`)
      const response = await GET(request, {
        params: { projectId, path: ['api', 'json'] }
      })

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe('application/json')
    })

    it('should return plain text response when not JSON', async () => {
      const mockEndpoint = {
        id: 'endpoint-7',
        project_id: projectId,
        method: 'GET',
        path: '/api/text',
        response_body: 'Plain text response',
        status_code: 200,
        requires_sub_key: false
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

      const request = new NextRequest(`http://localhost:3000/api/mock/${projectId}/api/text`)
      const response = await GET(request, {
        params: { projectId, path: ['api', 'text'] }
      })

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe('text/plain')
      const text = await response.text()
      expect(text).toBe('Plain text response')
    })

    it('should respect custom status codes', async () => {
      const mockEndpoint = {
        id: 'endpoint-8',
        project_id: projectId,
        method: 'DELETE',
        path: '/api/resource',
        response_body: null,
        status_code: 204,
        requires_sub_key: false
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

      const request = new NextRequest(`http://localhost:3000/api/mock/${projectId}/api/resource`, {
        method: 'DELETE'
      })
      const response = await DELETE(request, {
        params: { projectId, path: ['api', 'resource'] }
      })

      expect(response.status).toBe(204)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockRejectedValue(new Error('Database error'))
            })
          })
        })
      })

      const request = new NextRequest(`http://localhost:3000/api/mock/${projectId}/api/error`)
      const response = await GET(request, {
        params: { projectId, path: ['api', 'error'] }
      })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })
  })
})
