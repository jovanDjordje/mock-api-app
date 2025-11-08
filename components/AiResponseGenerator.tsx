'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Check, X, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AiResponseGeneratorProps {
  onAccept: (response: string) => void
  currentMethod?: string
  currentPath?: string
  currentFormat?: 'json' | 'xml' | 'text'
}

export default function AiResponseGenerator({
  onAccept,
  currentMethod,
  currentPath,
  currentFormat = 'json',
}: AiResponseGeneratorProps) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [format, setFormat] = useState<'json' | 'xml' | 'text'>(currentFormat)
  const [generatedResponse, setGeneratedResponse] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a description')
      return
    }

    setIsGenerating(true)
    setError('')
    setGeneratedResponse('')

    try {
      const response = await fetch('/api/ai/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          format,
          method: currentMethod,
          path: currentPath,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Failed to generate response')
        return
      }

      setGeneratedResponse(data.content || '')
      setHasGenerated(true)
    } catch (err) {
      console.error('Error generating response:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate response')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAccept = () => {
    onAccept(generatedResponse)
    handleClose()
  }

  const handleClose = () => {
    setOpen(false)
    // Reset state after dialog animation completes
    setTimeout(() => {
      setDescription('')
      setGeneratedResponse('')
      setError('')
      setHasGenerated(false)
      setFormat(currentFormat)
    }, 200)
  }

  const handleRegenerate = () => {
    setGeneratedResponse('')
    setHasGenerated(false)
    handleGenerate()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Response Generator
          </DialogTitle>
          <DialogDescription>
            Describe what kind of mock response you need, and AI will generate it for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="ai-description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ai-description"
              placeholder="e.g., user profile with name, email, age, and address"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !hasGenerated) {
                  e.preventDefault()
                  handleGenerate()
                }
              }}
            />
          </div>

          {/* Format Selector */}
          <div className="space-y-2">
            <Label htmlFor="ai-format">Response Format</Label>
            <Select value={format} onValueChange={(value: any) => setFormat(value)} disabled={isGenerating}>
              <SelectTrigger id="ai-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="text">Plain Text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Context Info */}
          {(currentMethod || currentPath) && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <div className="font-medium mb-1">Context:</div>
              {currentMethod && <div>Method: {currentMethod}</div>}
              {currentPath && <div>Path: {currentPath}</div>}
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Generated Response Preview */}
          {generatedResponse && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated Response</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
              </div>
              <Textarea
                value={generatedResponse}
                readOnly
                className="font-mono text-sm min-h-[200px] max-h-[400px]"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {!hasGenerated ? (
            <>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isGenerating}>
                Cancel
              </Button>
              <Button type="button" onClick={handleGenerate} disabled={isGenerating || !description.trim()}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={handleClose}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="button" onClick={handleAccept}>
                <Check className="h-4 w-4 mr-2" />
                Use This Response
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
