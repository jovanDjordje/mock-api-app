// AI Provider Types

export type ResponseFormat = 'json' | 'xml' | 'text'

export interface GenerateRequest {
  description: string
  format: ResponseFormat
  method?: string // HTTP method for context
  path?: string // Endpoint path for context
}

export interface GenerateResponse {
  success: boolean
  content?: string
  error?: string
}

export interface AIProvider {
  name: string
  generateResponse(request: GenerateRequest): Promise<GenerateResponse>
  isConfigured(): boolean
}
