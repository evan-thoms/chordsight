import { Chord, Analysis, StreamingPreview } from '../types'
import { buildScaleNotes, scaleToFretPositions, parseScaleName } from './chords'
import { NoteName } from '../types'

function extractJson(text: string): string {
  const trimmed = text.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fenced) return fenced[1].trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start !== -1 && end > start) return trimmed.slice(start, end + 1)
  return trimmed
}

function extractStringField(text: string, field: string): string | undefined {
  const match = text.match(new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`,))
  if (!match) return undefined
  try {
    return JSON.parse(`"${match[1]}"`)
  } catch {
    return undefined
  }
}

export function parseStreamingPreview(text: string): StreamingPreview {
  const preview: StreamingPreview = {}
  const key = extractStringField(text, 'key')
  const mode = extractStringField(text, 'mode')
  const emotionalCharacter = extractStringField(text, 'emotionalCharacter')
  const explanation = extractStringField(text, 'explanation')
  const soloingTips = extractStringField(text, 'soloingTips')

  if (key) preview.key = key
  if (mode) preview.mode = mode
  if (emotionalCharacter) preview.emotionalCharacter = emotionalCharacter
  if (explanation) preview.explanation = explanation
  if (soloingTips) preview.soloingTips = soloingTips

  const chordFnMatch = text.match(/"chordFunctions"\s*:\s*\[([\s\S]*?)\](?=\s*,\s*"(?:recommendedScales|soloingTips|emotionalCharacter|explanation)")/)
  if (chordFnMatch) {
    try {
      const fns = JSON.parse(`[${chordFnMatch[1]}]`) as StreamingPreview['chordFunctions']
      if (Array.isArray(fns) && fns.length > 0) preview.chordFunctions = fns
    } catch { /* partial array — wait for more tokens */ }
  }

  return preview
}

function buildPrompt(chords: Chord[]): string {
  const progressionStr = chords.map(c => c.name).join(' – ')
  const chordDetails = chords.map(c => `${c.name} (notes: ${c.notes.join(', ')})`).join(', ')

  return `You are a guitar teacher for beginner-intermediate guitarists.

Analyze: ${progressionStr}
Chords: ${chordDetails}

Return ONLY valid JSON (no markdown) in this shape:
{
  "key": "e.g. A minor",
  "mode": "e.g. Aeolian",
  "emotionalCharacter": "one short phrase, max 8 words — mood only, no poetry",
  "explanation": "max 4 sentences, plain language, explain why the progression works. Direct, no filler.",
  "chordFunctions": [{ "chord": "Am", "numeral": "i", "function": "brief role, under 12 words" }],
  "recommendedScales": [{ "name": "A Minor Pentatonic", "why": "one concise sentence" }],
  "soloingTips": "2-3 sentences of concrete, actionable advice — fret numbers, target notes, which chord to land on. No filler or motivational fluff."
}

Rules:
- Exactly 2 recommendedScales
- Keep chordFunctions function labels short and practical
- emotionalCharacter must be a brief mood label, not a paragraph`
}

type RawAnalysis = Omit<Analysis, 'recommendedScales'> & {
  recommendedScales: { name: string; why: string }[]
}

function enrichAnalysis(
  parsed: RawAnalysis,
  chords: Chord[],
): Analysis {
  const fallbackRoot = (chords[0]?.root as NoteName) ?? 'A'
  return {
    ...parsed,
    recommendedScales: parsed.recommendedScales.map(s => {
      const { root, pattern } = parseScaleName(s.name, fallbackRoot)
      return {
        name: s.name,
        notes: buildScaleNotes(root, pattern),
        positions: scaleToFretPositions(root, pattern),
        why: s.why,
      }
    }),
  }
}

async function streamMessageText(response: Response, onText: (text: string) => void): Promise<string> {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let text = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let newlineIndex: number
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newlineIndex).trim()
      buffer = buffer.slice(newlineIndex + 1)
      if (!line.startsWith('data:')) continue

      const payload = line.slice(5).trim()
      if (!payload || payload === '[DONE]') continue

      let event: { type?: string; delta?: { type?: string; text?: string } }
      try {
        event = JSON.parse(payload)
      } catch {
        continue
      }

      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta' && event.delta.text) {
        text += event.delta.text
        onText(text)
      }
    }
  }

  return text
}

// NOTE: In production, this should go through a backend proxy.
// For local dev, set VITE_ANTHROPIC_API_KEY in your .env file.
// NEVER commit your API key or deploy this directly to a public host.
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string

export interface AnalyzeOptions {
  onStream?: (preview: StreamingPreview) => void
}

export async function analyzeProgression(chords: Chord[], options: AnalyzeOptions = {}): Promise<Analysis> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      stream: true,
      messages: [{ role: 'user', content: buildPrompt(chords) }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => null) as { error?: { message?: string } } | null
    const message = err?.error?.message ?? `HTTP ${response.status}`
    throw new Error(`API error: ${message}`)
  }

  const text = await streamMessageText(response, accumulated => {
    options.onStream?.(parseStreamingPreview(accumulated))
  })

  let parsed: RawAnalysis
  try {
    parsed = JSON.parse(extractJson(text))
  } catch {
    throw new Error('Failed to parse analysis from Claude')
  }

  return enrichAnalysis(parsed, chords)
}
