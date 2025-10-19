'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

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
        <div className="text-gray-600">Loading...</div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-6 text-gray-900">Mock API App</h1>
        <p className="text-xl text-gray-600 mb-8">
          Create and manage custom mock API endpoints for development and testing
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="font-semibold text-lg mb-2">Secure Authentication</h3>
            <p className="text-sm text-gray-600">
              Username/password or API key authentication
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">📁</div>
            <h3 className="font-semibold text-lg mb-2">Project Organization</h3>
            <p className="text-sm text-gray-600">
              Group your endpoints into projects
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-lg mb-2">Custom Responses</h3>
            <p className="text-sm text-gray-600">
              Define custom JSON, XML, or text responses
            </p>
          </div>
        </div>

        <Link
          href="/auth/signin"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </main>
  )
}
