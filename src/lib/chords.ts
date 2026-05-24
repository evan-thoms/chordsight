import { NoteName, Chord, FretPosition } from '../types'

// All 12 notes
export const ALL_NOTES: NoteName[] = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

// Standard tuning: strings 1-6 (high e to low E)
const OPEN_STRINGS: NoteName[] = ['E', 'B', 'G', 'D', 'A', 'E']

// Interval patterns for chord qualities
const CHORD_INTERVALS: Record<string, number[]> = {
  major:       [0, 4, 7],
  minor:       [0, 3, 7],
  dominant7:   [0, 4, 7, 10],
  major7:      [0, 4, 7, 11],
  minor7:      [0, 3, 7, 10],
  diminished:  [0, 3, 6],
  augmented:   [0, 4, 8],
  sus2:        [0, 2, 7],
  sus4:        [0, 5, 7],
  add9:        [0, 4, 7, 14],
}

// Common scale patterns (intervals from root)
export const SCALE_PATTERNS: Record<string, number[]> = {
  'Minor Pentatonic': [0, 3, 5, 7, 10],
  'Major Pentatonic': [0, 2, 4, 7, 9],
  'Natural Minor':    [0, 2, 3, 5, 7, 8, 10],
  'Major':            [0, 2, 4, 5, 7, 9, 11],
  'Dorian':           [0, 2, 3, 5, 7, 9, 10],
  'Mixolydian':       [0, 2, 4, 5, 7, 9, 10],
  'Blues':            [0, 3, 5, 6, 7, 10],
}

export function parseScaleName(name: string, fallbackRoot: NoteName): { root: NoteName; pattern: string } {
  const rootMatch = name.match(/^([A-G]#?)/)
  const root = rootMatch ? (rootMatch[1] as NoteName) : fallbackRoot
  let pattern = name.replace(/^[A-G]#?\s*/, '').replace(/\s*\([^)]*\)/g, '').trim()
  const aliases: Record<string, string> = {
    'Major Scale': 'Major',
    'Minor Scale': 'Natural Minor',
  }
  pattern = aliases[pattern] ?? pattern
  return { root, pattern }
}

export function noteIndex(note: NoteName): number {
  return ALL_NOTES.indexOf(note)
}

export function noteFromIndex(idx: number): NoteName {
  return ALL_NOTES[((idx % 12) + 12) % 12]
}

// Build notes for a chord quality from a root
export function buildChordNotes(root: NoteName, quality: string): NoteName[] {
  const intervals = CHORD_INTERVALS[quality] ?? CHORD_INTERVALS.major
  const rootIdx = noteIndex(root)
  return intervals.map(i => noteFromIndex(rootIdx + i))
}

// Build scale notes from a root
export function buildScaleNotes(root: NoteName, scaleName: string): NoteName[] {
  const pattern = SCALE_PATTERNS[scaleName]
  if (!pattern) return []
  const rootIdx = noteIndex(root)
  return pattern.map(i => noteFromIndex(rootIdx + i))
}

// Identify chord from a set of notes (simple version)
export function identifyChord(notes: NoteName[]): { name: string; root: string; quality: string } | null {
  if (notes.length < 2) return null
  for (const root of notes) {
    for (const [quality, intervals] of Object.entries(CHORD_INTERVALS)) {
      const expectedNotes = new Set(buildChordNotes(root, quality))
      const inputNotes = new Set(notes)
      const match = [...inputNotes].every(n => expectedNotes.has(n)) &&
                    [...expectedNotes].every(n => inputNotes.has(n))
      if (match) {
        const suffix: Record<string, string> = {
          major: '', minor: 'm', dominant7: '7', major7: 'maj7',
          minor7: 'm7', diminished: 'dim', augmented: 'aug',
          sus2: 'sus2', sus4: 'sus4', add9: 'add9'
        }
        return { name: root + (suffix[quality] ?? ''), root, quality }
      }
    }
  }
  return null
}

// Generate fretboard positions for a scale across the full neck (frets 0–12)
export function scaleToFretPositions(root: NoteName, scaleName: string, maxFret = 12): FretPosition[] {
  const scaleNotes = buildScaleNotes(root, scaleName)
  const scaleSet = new Set(scaleNotes)
  const positions: FretPosition[] = []
  for (let str = 1; str <= 6; str++) {
    const openNote = OPEN_STRINGS[str - 1]
    const openIdx = noteIndex(openNote)
    for (let fret = 0; fret <= maxFret; fret++) {
      const note = noteFromIndex(openIdx + fret)
      if (scaleSet.has(note)) {
        positions.push({ string: str, fret, isRoot: note === root })
      }
    }
  }
  return positions
}

// Parse a simple chord name like "Am", "G", "Cmaj7"
export function parseChordName(input: string): { root: NoteName; quality: string } | null {
  const cleaned = input.trim()
  const rootMatch = cleaned.match(/^([A-G]#?)/)
  if (!rootMatch) return null
  const root = rootMatch[1] as NoteName
  const rest = cleaned.slice(root.length).toLowerCase()
  const qualityMap: Record<string, string> = {
    '': 'major', 'm': 'minor', 'min': 'minor',
    'maj7': 'major7', 'm7': 'minor7', '7': 'dominant7',
    'dim': 'diminished', 'aug': 'augmented',
    'sus2': 'sus2', 'sus4': 'sus4', 'add9': 'add9',
  }
  const quality = qualityMap[rest] ?? 'major'
  return { root, quality }
}

export function makeChord(name: string): Chord | null {
  const parsed = parseChordName(name)
  if (!parsed) return null
  const notes = buildChordNotes(parsed.root, parsed.quality)
  return {
    id: crypto.randomUUID(),
    name,
    notes,
    root: parsed.root,
    quality: parsed.quality,
  }
}
