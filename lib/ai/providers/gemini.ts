// Google Gemini AI Provider

import { AIProvider, GenerateRequest, GenerateResponse, ResponseFormat } from '../types'

export class GeminiProvider implements AIProvider {
  name = 'Google Gemini'
  private apiKey: string | undefined

  constructor() {
    this.apiKey = process.env.GOOGLE_GEMINI_API_KEY
  }

  isConfigured(): boolean {
    return !!this.apiKey
  }

  async generateResponse(request: GenerateRequest): Promise<GenerateResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Google Gemini API key is not configured',
      }
    }

    try {
      const prompt = this.buildPrompt(request)

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          }),
        }
      )

      if (!response.ok) {
        const error = await response.text()
        console.error('Gemini API error:', error)
        return {
          success: false,
          error: `Gemini API error: ${response.status} ${response.statusText}`,
        }
      }

      const data = await response.json()

      // Extract the generated text from Gemini's response format
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        return {
          success: false,
          error: 'No content generated from Gemini API',
        }
      }

      // Clean up the response (remove markdown code blocks if present)
      const cleanedContent = this.cleanResponse(generatedText, request.format)

      return {
        success: true,
        content: cleanedContent,
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  private buildPrompt(request: GenerateRequest): string {
    const { description, format, method, path } = request

    let prompt = `You are a mock API response generator. Generate a realistic ${format.toUpperCase()} response based on the following description.`

    if (method && path) {
      prompt += `\n\nEndpoint: ${method} ${path}`
    }

    prompt += `\n\nDescription: ${description}`

    prompt += `\n\nRequirements:`

    if (format === 'json') {
      prompt += `
- Generate valid JSON only (no markdown, no explanations)
- Use realistic, varied data (not placeholder text like "string" or "value")
- Include appropriate fields based on the description
- Use proper data types (strings, numbers, booleans, arrays, objects)
- Make it look like real production API data
- Do not include any text before or after the JSON`
    } else if (format === 'xml') {
      prompt += `
- Generate valid XML only (no markdown, no explanations)
- Include proper XML declaration
- Use appropriate tags based on the description
- Use realistic, varied data
- Make it well-formatted and production-ready
- Do not include any text before or after the XML`
    } else {
      prompt += `
- Generate plain text only (no markdown, no explanations)
- Make it realistic and useful
- Keep it concise but informative
- Do not include any formatting or explanations`
    }

    return prompt
  }

  private cleanResponse(text: string, format: ResponseFormat): string {
    // Remove markdown code blocks if present
    let cleaned = text.trim()

    // Remove ```json, ```xml, or ```text markers
    cleaned = cleaned.replace(/^```(?:json|xml|text)?\n?/i, '')
    cleaned = cleaned.replace(/\n?```\s*$/i, '')

    // Trim again after removing markers
    cleaned = cleaned.trim()

    // For JSON, validate and pretty-print
    if (format === 'json') {
      try {
        const parsed = JSON.parse(cleaned)
        return JSON.stringify(parsed, null, 2)
      } catch {
        // If parsing fails, return as-is (might still be valid but with different formatting)
        return cleaned
      }
    }

    return cleaned
  }
}
