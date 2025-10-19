'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-800">
              Mock API App
            </Link>
            {session && (
              <div className="ml-10 flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Projects
                </Link>
              </div>
            )}
          </div>
          {session && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
