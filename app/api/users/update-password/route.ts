import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

// PUT /api/users/update-password - Update user password
export async function PUT(request: Request) {
  try {
    // Verify admin secret
    const adminSecret = request.headers.get('x-admin-secret')

    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing admin secret' },
        { status: 401 }
      )
    }

    const { userId, username, newPassword } = await request.json()

    // Must provide either userId or username
    if (!userId && !username) {
      return NextResponse.json(
        { error: 'Either userId or username is required' },
        { status: 400 }
      )
    }

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }

    // Hash the new password
    const password_hash = await bcrypt.hash(newPassword, 10)

    // Build the query
    let query = supabaseAdmin.from('users').update({ password_hash })

    if (userId) {
      query = query.eq('id', userId)
    } else {
      query = query.eq('username', username)
    }

    const { data, error } = await query.select().single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      user: {
        id: data.id,
        username: data.username
      }
    })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
