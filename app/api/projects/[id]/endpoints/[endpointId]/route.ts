import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/projects/[id]/endpoints/[endpointId] - Get a specific endpoint
export async function GET(
  request: Request,
  { params }: { params: { id: string; endpointId: string } }
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

    const { data: endpoint, error } = await supabaseAdmin
      .from('endpoints')
      .select('*')
      .eq('id', params.endpointId)
      .eq('project_id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Endpoint not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ endpoint })
  } catch (error) {
    console.error('Error fetching endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch endpoint' },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id]/endpoints/[endpointId] - Update an endpoint
export async function PUT(
  request: Request,
  { params }: { params: { id: string; endpointId: string } }
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

    const { data: endpoint, error } = await supabaseAdmin
      .from('endpoints')
      .update({
        method: method?.toUpperCase(),
        path,
        response_body: response_body || null,
        status_code: status_code || 200,
        requires_sub_key: requires_sub_key || false,
      })
      .eq('id', params.endpointId)
      .eq('project_id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ endpoint })
  } catch (error) {
    console.error('Error updating endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to update endpoint' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id]/endpoints/[endpointId] - Delete an endpoint
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; endpointId: string } }
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

    const { error } = await supabaseAdmin
      .from('endpoints')
      .delete()
      .eq('id', params.endpointId)
      .eq('project_id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to delete endpoint' },
      { status: 500 }
    )
  }
}
