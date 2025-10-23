'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { Layers, FolderKanban, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity">
              <Layers className="h-6 w-6 text-primary" />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Mock API App
              </span>
            </Link>
            {session && (
              <div className="hidden md:flex items-center gap-1">
                <Button variant="ghost" asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4" />
                    Projects
                  </Link>
                </Button>
              </div>
            )}
          </div>
          {session && (
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{session.user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-sm text-muted-foreground">
                    {session.user?.name}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
