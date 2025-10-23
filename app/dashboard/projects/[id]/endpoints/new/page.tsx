'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Route, ChevronLeft, Loader2, X, Hash, Code } from 'lucide-react'
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

export default function NewEndpoint({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [method, setMethod] = useState('GET')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

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
    <div className="max-w-3xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
          <Link href={`/dashboard/projects/${params.id}`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Project
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Endpoint</h1>
        <p className="text-muted-foreground mt-2">
          Define a new mock API endpoint with custom responses
        </p>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Endpoint Configuration
          </CardTitle>
          <CardDescription>
            Configure the HTTP method, path, and response for your endpoint
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
                  defaultValue={200}
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
                placeholder="/api/users"
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
                placeholder='{"message": "Hello World"}'
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
              <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Route className="mr-2 h-4 w-4" />
                    Create Endpoint
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isLoading}
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
