import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Helper to handle all HTTP methods
async function handleRequest(
  request: Request,
  params: { projectId: string; path: string[] }
) {
  try {
    const method = request.method
    const requestPath = '/' + (params.path?.join('/') || '')
    const projectId = params.projectId

    // Get API key from headers (for sub-key authentication)
    const apiKey = request.headers.get('x-api-key') ||
                   request.headers.get('authorization')?.replace('Bearer ', '')

    // Find matching endpoint for this specific project
    const { data: endpoints, error } = await supabaseAdmin
      .from('endpoints')
      .select('*')
      .eq('project_id', projectId)
      .eq('method', method)
      .eq('path', requestPath)

    if (error) throw error

    if (!endpoints || endpoints.length === 0) {
      return NextResponse.json(
        { error: 'Endpoint not found', detail: `No ${method} endpoint found at ${requestPath} for this project` },
        { status: 404 }
      )
    }

    const endpoint = endpoints[0]

    // Check if sub-key is required
    if (endpoint.requires_sub_key) {
      if (!apiKey) {
        return NextResponse.json(
          { error: 'API key required' },
          { status: 401 }
        )
      }

      // Verify the API key
      const { data: validKeys, error: keyError } = await supabaseAdmin
        .from('api_keys')
        .select('*')
        .eq('endpoint_id', endpoint.id)
        .eq('key_value', apiKey)

      if (keyError || !validKeys || validKeys.length === 0) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 403 }
        )
      }
    }

    // Parse response body
    let responseData = endpoint.response_body

    // Try to parse as JSON if possible
    let isJson = false
    try {
      if (responseData) {
        JSON.parse(responseData)
        isJson = true
      }
    } catch {
      // Not JSON, treat as plain text
      isJson = false
    }

    // Return the response
    if (isJson && responseData) {
      return new NextResponse(responseData, {
        status: endpoint.status_code,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } else {
      return new NextResponse(responseData || '', {
        status: endpoint.status_code,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }
  } catch (error) {
    console.error('Error serving mock endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export handlers for all HTTP methods
export async function GET(
  request: Request,
  context: { params: { projectId: string; path: string[] } }
) {
  return handleRequest(request, context.params)
}

export async function POST(
  request: Request,
  context: { params: { projectId: string; path: string[] } }
) {
  return handleRequest(request, context.params)
}

export async function PUT(
  request: Request,
  context: { params: { projectId: string; path: string[] } }
) {
  return handleRequest(request, context.params)
}

export async function PATCH(
  request: Request,
  context: { params: { projectId: string; path: string[] } }
) {
  return handleRequest(request, context.params)
}

export async function DELETE(
  request: Request,
  context: { params: { projectId: string; path: string[] } }
) {
  return handleRequest(request, context.params)
}
