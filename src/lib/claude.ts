import { Chord, Analysis } from '../types'
import { buildScaleNotes, scaleToFretPositions } from './chords'
import { NoteName } from '../types'

// NOTE: In production, this should go through a backend proxy.
// For local dev, set VITE_ANTHROPIC_API_KEY in your .env file.
// NEVER commit your API key or deploy this directly to a public host.
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string

export async function analyzeProgression(chords: Chord[]): Promise<Analysis> {
  const progressionStr = chords.map(c => c.name).join(' – ')
  const chordDetails = chords.map(c => `${c.name} (notes: ${c.notes.join(', ')})`).join(', ')

  const prompt = `You are a guitar teacher helping a beginner-intermediate guitarist understand music theory.

Analyze this chord progression: ${progressionStr}
Chord details: ${chordDetails}

Return ONLY valid JSON (no markdown, no explanation outside the JSON) in exactly this shape:
{
  "key": "string (e.g. A minor, G major)",
  "mode": "string (e.g. Aeolian, Ionian)",
  "chordFunctions": [
    { "chord": "Am", "numeral": "i", "function": "tonic — home base, sounds resolved" }
  ],
  "recommendedScales": [
    {
      "name": "A Minor Pentatonic",
      "why": "Safe over all chords — the b3 and b7 match the minor feel throughout"
    },
    {
      "name": "A Natural Minor",
      "why": "Adds more color notes, especially nice over the iv and v chords"
    }
  ],
  "soloingTips": "2-3 sentences of concrete advice for soloing over this specific progression. Mention which chord to land on, where to bend, etc.",
  "emotionalCharacter": "one sentence describing the mood/vibe of this progression",
  "explanation": "3-4 sentences explaining WHY this progression works the way it does, in plain language for someone who doesn't know much theory yet"
}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.content[0].text as string

  try {
    const parsed = JSON.parse(text) as Omit<Analysis, 'recommendedScales'> & {
      recommendedScales: { name: string; why: string }[]
    }

    // Enrich scale recommendations with actual note data + fretboard positions
    const enriched: Analysis = {
      ...parsed,
      recommendedScales: parsed.recommendedScales.map(s => {
        const root = chords[0]?.root as NoteName ?? 'A'
        // Extract root from scale name if possible
        const rootMatch = s.name.match(/^([A-G]#?)/)
        const scaleRoot = rootMatch ? (rootMatch[1] as NoteName) : root
        const scalePart = s.name.replace(/^[A-G]#?\s*/, '')
        return {
          name: s.name,
          notes: buildScaleNotes(scaleRoot, scalePart),
          positions: scaleToFretPositions(scaleRoot, scalePart),
          why: s.why,
        }
      }),
    }
    return enriched
  } catch {
    throw new Error('Failed to parse analysis from Claude')
  }
}
