'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, Key, User, Lock, Loader2, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'password' | 'apikey'>('password')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const apiKey = formData.get('apiKey') as string

    const useApiKey = activeTab === 'apikey'

    try {
      const result = await signIn('credentials', {
        username: useApiKey ? '' : username,
        password: useApiKey ? '' : password,
        apiKey: useApiKey ? apiKey : '',
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <Layers className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Mock API App
            </h1>
          </div>
          <p className="text-muted-foreground">Sign in to manage your mock endpoints</p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Sign In
            </CardTitle>
            <CardDescription>
              Choose your preferred authentication method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'password' | 'apikey')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="password" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Password
                </TabsTrigger>
                <TabsTrigger value="apikey" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  API Key
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                <TabsContent value="password" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Username
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      required={activeTab === 'password'}
                      placeholder="Enter your username"
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required={activeTab === 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="apikey" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      API Key
                    </Label>
                    <Input
                      id="apiKey"
                      name="apiKey"
                      type="text"
                      required={activeTab === 'apikey'}
                      placeholder="Enter your API key"
                      className="font-mono"
                    />
                  </div>
                </TabsContent>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
