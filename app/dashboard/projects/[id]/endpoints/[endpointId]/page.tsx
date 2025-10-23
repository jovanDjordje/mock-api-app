'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Endpoint } from '@/lib/supabase'
import { Edit as EditIcon, ChevronLeft, Loader2, Save, X, Hash, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function EditEndpoint({
  params
}: {
  params: { id: string; endpointId: string }
}) {
  const router = useRouter()
  const [endpoint, setEndpoint] = useState<Endpoint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [method, setMethod] = useState('')

  useEffect(() => {
    fetchEndpoint()
  }, [params.endpointId])

  const fetchEndpoint = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/endpoints/${params.endpointId}`)
      if (response.ok) {
        const data = await response.json()
        setEndpoint(data.endpoint)
        setMethod(data.endpoint.method)
      }
    } catch (error) {
      console.error('Failed to fetch endpoint:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    const formData = new FormData(e.currentTarget)
    let path = formData.get('path') as string
    // Ensure path starts with a slash
    if (!path.startsWith('/')) {
      path = `/${path}`
    }
    const response_body = formData.get('response_body') as string
    const status_code = parseInt(formData.get('status_code') as string)
    const requires_sub_key = formData.get('requires_sub_key') === 'on'

    try {
      const response = await fetch(`/api/projects/${params.id}/endpoints/${params.endpointId}`, {
        method: 'PUT',
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
        throw new Error(data.error || 'Failed to update endpoint')
      }

      router.push(`/dashboard/projects/${params.id}`)
    } catch (err: any) {
      setError(err.message)
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!endpoint) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">Endpoint not found</p>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/projects/${params.id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href={`/dashboard/projects/${params.id}`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Project
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Endpoint</h1>
        <p className="text-muted-foreground mt-2">
          Update the configuration for your mock API endpoint
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EditIcon className="h-5 w-5" />
            Endpoint Configuration
          </CardTitle>
          <CardDescription>
            Modify the HTTP method, path, and response for your endpoint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="method">
                  HTTP Method <span className="text-destructive">*</span>
                </Label>
                <Select value={method} onValueChange={setMethod} required>
                  <SelectTrigger id="method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status_code" className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Status Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="status_code"
                  name="status_code"
                  type="number"
                  required
                  defaultValue={endpoint.status_code}
                  min={100}
                  max={599}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="path">
                Path <span className="text-destructive">*</span>
              </Label>
              <Input
                id="path"
                name="path"
                type="text"
                required
                defaultValue={endpoint.path}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The endpoint path (will automatically add / prefix if not present)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="response_body" className="flex items-center gap-1">
                <Code className="h-3 w-3" />
                Response Body
              </Label>
              <Textarea
                id="response_body"
                name="response_body"
                rows={12}
                defaultValue={endpoint.response_body || ''}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Paste your JSON, XML, or text response here
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-muted/50 p-4 rounded-lg">
              <input
                id="requires_sub_key"
                name="requires_sub_key"
                type="checkbox"
                defaultChecked={endpoint.requires_sub_key}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="requires_sub_key" className="font-normal cursor-pointer">
                Require API sub-key for this endpoint
              </Label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSaving} className="flex-1 sm:flex-none">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isSaving}
              >
                <Link href={`/dashboard/projects/${params.id}`}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
