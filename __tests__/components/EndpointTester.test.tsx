/**
 * Tests for EndpointTester Component
 *
 * This test suite validates the interactive endpoint testing UI component
 * including request body input, API key input, and response display.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EndpointTester } from '@/components/EndpointTester'

// Mock fetch
global.fetch = jest.fn()

describe('EndpointTester Component', () => {
  const defaultProps = {
    projectId: 'test-project-123',
    method: 'GET',
    path: '/api/users',
    requiresKey: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ users: [] })
    })
  })

  describe('Rendering', () => {
    it('should render endpoint URL', () => {
      render(<EndpointTester {...defaultProps} />)
      expect(screen.getByText(/api\/users/)).toBeInTheDocument()
    })

    it('should render test button', () => {
      render(<EndpointTester {...defaultProps} />)
      expect(screen.getByRole('button', { name: /test/i })).toBeInTheDocument()
    })

    it('should show API key input when requiresKey is true', () => {
      render(<EndpointTester {...defaultProps} requiresKey={true} />)
      expect(screen.getByPlaceholderText(/enter your api key/i)).toBeInTheDocument()
    })

    it('should not show API key input when requiresKey is false', () => {
      render(<EndpointTester {...defaultProps} requiresKey={false} />)
      expect(screen.queryByPlaceholderText(/enter your api key/i)).not.toBeInTheDocument()
    })

    it('should show request body input for POST method', () => {
      render(<EndpointTester {...defaultProps} method="POST" />)
      expect(screen.getByPlaceholderText(/{"key": "value"}/)).toBeInTheDocument()
    })

    it('should show request body input for PUT method', () => {
      render(<EndpointTester {...defaultProps} method="PUT" />)
      expect(screen.getByPlaceholderText(/{"key": "value"}/)).toBeInTheDocument()
    })

    it('should show request body input for PATCH method', () => {
      render(<EndpointTester {...defaultProps} method="PATCH" />)
      expect(screen.getByPlaceholderText(/{"key": "value"}/)).toBeInTheDocument()
    })

    it('should show request body input for DELETE method', () => {
      render(<EndpointTester {...defaultProps} method="DELETE" />)
      expect(screen.getByPlaceholderText(/{"key": "value"}/)).toBeInTheDocument()
    })

    it('should not show request body input for GET method', () => {
      render(<EndpointTester {...defaultProps} method="GET" />)
      expect(screen.queryByPlaceholderText(/{"key": "value"}/)).not.toBeInTheDocument()
    })
  })

  describe('URL Generation', () => {
    it('should normalize path without leading slash', () => {
      render(<EndpointTester {...defaultProps} path="api/users" />)
      const urlElement = screen.getByText(/\/api\/users/)
      expect(urlElement).toBeInTheDocument()
    })

    it('should handle path with leading slash', () => {
      render(<EndpointTester {...defaultProps} path="/api/users" />)
      const urlElement = screen.getByText(/\/api\/users/)
      expect(urlElement).toBeInTheDocument()
    })
  })

  describe('Testing Functionality', () => {
    it('should make GET request when test button is clicked', async () => {
      render(<EndpointTester {...defaultProps} />)

      const testButton = screen.getByRole('button', { name: /test/i })
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/mock/test-project-123/api/users'),
          expect.objectContaining({ method: 'GET' })
        )
      })
    })

    it('should include request body for POST requests', async () => {
      render(<EndpointTester {...defaultProps} method="POST" />)

      const bodyInput = screen.getByPlaceholderText(/{"key": "value"}/)
      fireEvent.change(bodyInput, { target: { value: '{"name": "test"}' } })

      const testButton = screen.getByRole('button', { name: /test/i })
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/mock/test-project-123/api/users'),
          expect.objectContaining({
            method: 'POST',
            body: '{"name": "test"}'
          })
        )
      })
    })

    it('should include API key header when provided', async () => {
      render(<EndpointTester {...defaultProps} requiresKey={true} />)

      const apiKeyInput = screen.getByPlaceholderText(/enter your api key/i)
      fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } })

      const testButton = screen.getByRole('button', { name: /test/i })
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'x-api-key': 'test-api-key'
            })
          })
        )
      })
    })

    it('should display response data', async () => {
      const mockResponse = { message: 'Success', data: [1, 2, 3] }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      })

      render(<EndpointTester {...defaultProps} />)

      const testButton = screen.getByRole('button', { name: /test/i })
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(screen.getByText(/200 OK/i)).toBeInTheDocument()
        expect(screen.getByText(/"message"/i)).toBeInTheDocument()
        expect(screen.getByText(/"Success"/i)).toBeInTheDocument()
      })
    })

    it('should display error when request fails', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<EndpointTester {...defaultProps} />)

      const testButton = screen.getByRole('button', { name: /test/i })
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument()
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })

    it('should show loading state during request', async () => {
      let resolvePromise: any
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      ;(global.fetch as jest.Mock).mockReturnValue(promise)

      render(<EndpointTester {...defaultProps} />)

      const testButton = screen.getByRole('button', { name: /test/i })
      fireEvent.click(testButton)

      expect(screen.getByRole('button', { name: /testing/i })).toBeDisabled()

      resolvePromise({
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({})
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /test/i })).not.toBeDisabled()
      })
    })
  })

  describe('Content Type Handling', () => {
    it('should handle JSON responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ result: 'json' })
      })

      render(<EndpointTester {...defaultProps} />)

      const testButton = screen.getByRole('button', { name: /test/i })
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(screen.getByText(/"result"/i)).toBeInTheDocument()
      })
    })

    it('should handle plain text responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => 'Plain text response'
      })

      render(<EndpointTester {...defaultProps} />)

      const testButton = screen.getByRole('button', { name: /test/i })
      fireEvent.click(testButton)

      await waitFor(() => {
        expect(screen.getByText(/plain text response/i)).toBeInTheDocument()
      })
    })
  })
})
