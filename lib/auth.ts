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
        if (!credentials) return null

        // If API key is provided, authenticate with it
        if (credentials.apiKey) {
          const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('api_key', credentials.apiKey)
            .single()

          if (error || !user) return null

          return {
            id: user.id,
            name: user.username,
            email: user.username,
          }
        }

        // Otherwise, authenticate with username and password
        if (!credentials.username || !credentials.password) return null

        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', credentials.username)
          .single()

        if (error || !user) return null

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password_hash
        )

        if (!isValidPassword) return null

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
