import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { aiProviderManager } from '@/lib/ai'
import { ResponseFormat } from '@/lib/ai/types'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if AI provider is configured
    if (!aiProviderManager.hasConfiguredProvider()) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service is not configured. Please contact the administrator.',
        },
        { status: 503 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { description, format, method, path } = body

    // Validate required fields
    if (!description || !description.trim()) {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      )
    }

    if (!format || !['json', 'xml', 'text'].includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Invalid format. Must be json, xml, or text' },
        { status: 400 }
      )
    }

    // Get the AI provider
    const provider = aiProviderManager.getProvider()
    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          error: 'No AI provider available',
        },
        { status: 503 }
      )
    }

    // Generate response using AI
    const result = await provider.generateResponse({
      description: description.trim(),
      format: format as ResponseFormat,
      method,
      path,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to generate response',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      content: result.content,
      provider: provider.name,
    })
  } catch (error) {
    console.error('Error in AI generate-response API:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
