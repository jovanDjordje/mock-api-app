// AI Provider Manager - Manages available AI providers

import { AIProvider } from './types'
import { GeminiProvider } from './providers/gemini'

// Future providers can be added here:
// import { OpenAIProvider } from './providers/openai'
// import { ClaudeProvider } from './providers/claude'
// import { OllamaProvider } from './providers/ollama'

export class AIProviderManager {
  private providers: AIProvider[]

  constructor() {
    // Initialize all providers
    this.providers = [
      new GeminiProvider(),
      // Future providers:
      // new OpenAIProvider(),
      // new ClaudeProvider(),
      // new OllamaProvider(),
    ]
  }

  /**
   * Get the first configured and available provider
   */
  getProvider(): AIProvider | null {
    const provider = this.providers.find((p) => p.isConfigured())
    return provider || null
  }

  /**
   * Get all available (configured) providers
   */
  getAvailableProviders(): AIProvider[] {
    return this.providers.filter((p) => p.isConfigured())
  }

  /**
   * Check if any provider is configured
   */
  hasConfiguredProvider(): boolean {
    return this.providers.some((p) => p.isConfigured())
  }

  /**
   * Get provider by name (for future use when multiple providers are available)
   */
  getProviderByName(name: string): AIProvider | null {
    const provider = this.providers.find(
      (p) => p.name.toLowerCase() === name.toLowerCase() && p.isConfigured()
    )
    return provider || null
  }
}

// Export singleton instance
export const aiProviderManager = new AIProviderManager()
