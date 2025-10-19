import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/projects/[id]/endpoints - List all endpoints for a project
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data: endpoints, error } = await supabaseAdmin
      .from('endpoints')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ endpoints })
  } catch (error) {
    console.error('Error fetching endpoints:', error)
    return NextResponse.json(
      { error: 'Failed to fetch endpoints' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/endpoints - Create a new endpoint
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { method, path, response_body, status_code, requires_sub_key } = await request.json()

    if (!method || !path) {
      return NextResponse.json(
        { error: 'Method and path are required' },
        { status: 400 }
      )
    }

    const { data: endpoint, error } = await supabaseAdmin
      .from('endpoints')
      .insert({
        project_id: params.id,
        method: method.toUpperCase(),
        path,
        response_body: response_body || null,
        status_code: status_code || 200,
        requires_sub_key: requires_sub_key || false,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'An endpoint with this method and path already exists' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json({ endpoint }, { status: 201 })
  } catch (error) {
    console.error('Error creating endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to create endpoint' },
      { status: 500 }
    )
  }
}
