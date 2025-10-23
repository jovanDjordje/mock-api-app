'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Project, Endpoint } from '@/lib/supabase'
import { EndpointTester } from '@/components/EndpointTester'
import { Plus, Trash2, Edit, ChevronLeft, Loader2, Network, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">Project not found</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    )
  }

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case 'GET': return 'default'
      case 'POST': return 'default'
      case 'PUT': return 'secondary'
      case 'PATCH': return 'secondary'
      case 'DELETE': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
            <Link href="/dashboard">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
          <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground text-lg">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button asChild className="flex-1 sm:flex-none">
            <Link href={`/dashboard/projects/${params.id}/endpoints/new`}>
              <Plus className="mr-2 h-4 w-4" />
              New Endpoint
            </Link>
          </Button>
          <Button variant="destructive" onClick={deleteProject}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            API Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent>
          {endpoints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="rounded-full bg-muted p-6">
                <Network className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No endpoints yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Create your first endpoint to start mocking API responses
                </p>
              </div>
              <Button asChild size="lg">
                <Link href={`/dashboard/projects/${params.id}/endpoints/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Endpoint
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div key={endpoint.id}>
                  {index > 0 && <Separator />}
                  <div className="pt-4 first:pt-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getMethodBadgeVariant(endpoint.method)}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                          {endpoint.requires_sub_key && (
                            <Badge variant="outline" className="gap-1">
                              <Key className="h-3 w-3" />
                              Requires Key
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Status: <span className="font-medium text-foreground">{endpoint.status_code}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/projects/${params.id}/endpoints/${endpoint.id}`}>
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEndpoint(endpoint.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <EndpointTester
                      projectId={params.id}
                      method={endpoint.method}
                      path={endpoint.path}
                      requiresKey={endpoint.requires_sub_key}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
