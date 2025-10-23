'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Shield, FolderTree, Zap, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }

  const features = [
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Username/password or API key authentication with optional endpoint-level security',
    },
    {
      icon: FolderTree,
      title: 'Project Organization',
      description: 'Group your endpoints into projects for better management and organization',
    },
    {
      icon: Zap,
      title: 'Custom Responses',
      description: 'Define custom JSON, XML, or text responses with configurable status codes',
    },
  ]

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="text-center max-w-5xl mx-auto space-y-12">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Mock API App
            </span>
          </h1>
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
            Create and manage custom mock API endpoints for development and testing with ease
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader>
                <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <Button size="lg" asChild className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
            <Link href="/auth/signin" className="flex items-center gap-2">
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
