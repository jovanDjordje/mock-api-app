import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from './supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        apiKey: { label: 'API Key (optional)', type: 'text' }
      },
      async authorize(credentials) {
        console.log('[AUTH] Authorize function called')

        if (!credentials) {
          console.log('[AUTH] No credentials provided')
          return null
        }

        // If API key is provided, authenticate with it
        if (credentials.apiKey) {
          console.log('[AUTH] Authenticating with API key')
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('api_key', credentials.apiKey)
            .single()

          if (error) {
            console.error('[AUTH] API key auth error:', error)
            return null
          }

          if (!user) {
            console.log('[AUTH] No user found with API key')
            return null
          }

          console.log('[AUTH] API key auth successful for user:', user.username)
          return {
            id: user.id,
            name: user.username,
            email: user.username,
          }
        }

        // Otherwise, authenticate with username and password
        if (!credentials.username || !credentials.password) {
          console.log('[AUTH] Missing username or password')
          return null
        }

        console.log('[AUTH] Authenticating username:', credentials.username)

        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('username', credentials.username)
          .single()

        if (error) {
          console.error('[AUTH] Database error:', error)
          return null
        }

        if (!user) {
          console.log('[AUTH] User not found:', credentials.username)
          return null
        }

        console.log('[AUTH] User found, checking password...')

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password_hash
        )

        if (!isValidPassword) {
          console.log('[AUTH] Invalid password for user:', credentials.username)
          return null
        }

        console.log('[AUTH] Authentication successful for user:', user.username)
        return {
          id: user.id,
          name: user.username,
          email: user.username,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}
