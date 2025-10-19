'use client'

import { useState } from 'react'

interface EndpointTesterProps {
  projectId: string
  method: string
  path: string
  requiresKey: boolean
}

export function EndpointTester({ projectId, method, path, requiresKey }: EndpointTesterProps) {
  const [apiKey, setApiKey] = useState('')
  const [requestBody, setRequestBody] = useState('')
  const [response, setResponse] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/mock/${projectId}`
    : `/api/mock/${projectId}`

  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const fullUrl = `${baseUrl}${normalizedPath}`

  const testEndpoint = async () => {
    setIsLoading(true)
    setResponse(null)

    try {
      const headers: any = {}
      if (requiresKey && apiKey) {
        headers['x-api-key'] = apiKey
      }

      // Prepare fetch options
      const fetchOptions: RequestInit = {
        method,
        headers,
      }

      // Add body for POST/PUT/PATCH/DELETE if provided
      if (requestBody && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        headers['Content-Type'] = 'application/json'
        fetchOptions.body = requestBody
      }

      const res = await fetch(fullUrl, fetchOptions)

      const contentType = res.headers.get('content-type')
      let data

      if (contentType?.includes('application/json')) {
        data = await res.json()
      } else {
        data = await res.text()
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      })
    } catch (error: any) {
      setResponse({
        error: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <h4 className="font-semibold text-sm text-gray-700 mb-2">Test Endpoint</h4>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Endpoint URL</label>
          <code className="block bg-white px-3 py-2 rounded border border-gray-200 text-xs break-all">
            {fullUrl}
          </code>
        </div>

        {requiresKey && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">API Key</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
        )}

        {['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && (
          <div>
            <label className="block text-xs text-gray-600 mb-1">Request Body (JSON)</label>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              placeholder='{"key": "value"}'
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Enter JSON data to send with the request
            </p>
          </div>
        )}

        <button
          onClick={testEndpoint}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test'}
        </button>

        {response && (
          <div className="bg-white rounded border border-gray-200 p-3">
            {response.error ? (
              <div className="text-red-600 text-sm">Error: {response.error}</div>
            ) : (
              <>
                <div className="text-xs text-gray-600 mb-2">
                  Status: <span className="font-semibold">{response.status} {response.statusText}</span>
                </div>
                <div className="text-xs text-gray-600 mb-1">Response:</div>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">
                  {typeof response.data === 'object'
                    ? JSON.stringify(response.data, null, 2)
                    : response.data}
                </pre>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
