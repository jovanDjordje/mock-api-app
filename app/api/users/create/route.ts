import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'
import { randomBytes } from 'crypto'

// This endpoint is protected with an admin secret token
// Only requests with the correct ADMIN_SECRET can create users
export async function POST(request: Request) {
  try {
    // Verify admin secret
    const adminSecret = request.headers.get('x-admin-secret')

    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing admin secret' },
        { status: 401 }
      )
    }

    const { username, password, generateApiKey } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10)

    // Generate API key if requested
    const api_key = generateApiKey
      ? randomBytes(32).toString('hex')
      : null

    // Create the user
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        username,
        password_hash,
        api_key,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        username: data.username,
        api_key: data.api_key,
      },
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
