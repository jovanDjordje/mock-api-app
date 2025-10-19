'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewEndpoint({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const method = formData.get('method') as string
    let path = formData.get('path') as string
    // Ensure path starts with a slash
    if (!path.startsWith('/')) {
      path = `/${path}`
    }
    const response_body = formData.get('response_body') as string
    const status_code = parseInt(formData.get('status_code') as string)
    const requires_sub_key = formData.get('requires_sub_key') === 'on'

    try {
      const response = await fetch(`/api/projects/${params.id}/endpoints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          path,
          response_body,
          status_code,
          requires_sub_key,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create endpoint')
      }

      router.push(`/dashboard/projects/${params.id}`)
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <Link
        href={`/dashboard/projects/${params.id}`}
        className="text-blue-600 hover:underline text-sm mb-4 block"
      >
        ← Back to Project
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Endpoint</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
                HTTP Method *
              </label>
              <select
                id="method"
                name="method"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div>
              <label htmlFor="status_code" className="block text-sm font-medium text-gray-700 mb-1">
                Status Code *
              </label>
              <input
                id="status_code"
                name="status_code"
                type="number"
                required
                defaultValue={200}
                min={100}
                max={599}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-1">
              Path *
            </label>
            <input
              id="path"
              name="path"
              type="text"
              required
              placeholder="/api/users"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              The path should start with /
            </p>
          </div>

          <div>
            <label htmlFor="response_body" className="block text-sm font-medium text-gray-700 mb-1">
              Response Body
            </label>
            <textarea
              id="response_body"
              name="response_body"
              rows={10}
              placeholder='{"message": "Hello World"}'
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste your JSON, XML, or text response here
            </p>
          </div>

          <div className="flex items-center">
            <input
              id="requires_sub_key"
              name="requires_sub_key"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="requires_sub_key" className="ml-2 block text-sm text-gray-700">
              Require sub-key for this endpoint
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Endpoint'}
            </button>
            <Link
              href={`/dashboard/projects/${params.id}`}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
