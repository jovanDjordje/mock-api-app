'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Project, Endpoint } from '@/lib/supabase'
import { EndpointTester } from '@/components/EndpointTester'

export default function ProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProject()
    fetchEndpoints()
  }, [params.id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
      }
    } catch (error) {
      console.error('Failed to fetch project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEndpoints = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/endpoints`)
      if (response.ok) {
        const data = await response.json()
        setEndpoints(data.endpoints)
      }
    } catch (error) {
      console.error('Failed to fetch endpoints:', error)
    }
  }

  const deleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? All endpoints will be deleted as well.')) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const deleteEndpoint = async (endpointId: string) => {
    if (!confirm('Are you sure you want to delete this endpoint?')) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${params.id}/endpoints/${endpointId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setEndpoints(endpoints.filter(e => e.id !== endpointId))
      }
    } catch (error) {
      console.error('Failed to delete endpoint:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mt-2">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/projects/${params.id}/endpoints/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            New Endpoint
          </Link>
          <button
            onClick={deleteProject}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Delete Project
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">API Endpoints</h2>
        </div>

        {endpoints.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No endpoints yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first endpoint to start mocking API responses
            </p>
            <Link
              href={`/dashboard/projects/${params.id}/endpoints/new`}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
            >
              Create Endpoint
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {endpoints.map((endpoint) => (
              <div key={endpoint.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                        endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
                      {endpoint.requires_sub_key && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                          Requires Key
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Status: <span className="font-medium">{endpoint.status_code}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/projects/${params.id}/endpoints/${endpoint.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteEndpoint(endpoint.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <EndpointTester
                  projectId={params.id}
                  method={endpoint.method}
                  path={endpoint.path}
                  requiresKey={endpoint.requires_sub_key}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
