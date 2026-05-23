export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B'

export interface Chord {
  id: string
  name: string
  notes: NoteName[]
  root: string
  quality: string
}

export interface Progression {
  chords: Chord[]
}

export interface Analysis {
  key: string
  mode: string
  chordFunctions: { chord: string; numeral: string; function: string }[]
  recommendedScales: ScaleRecommendation[]
  soloingTips: string
  emotionalCharacter: string
  explanation: string
}

export interface ScaleRecommendation {
  name: string
  notes: NoteName[]
  positions: FretPosition[]
  why: string
}

export interface FretPosition {
  string: number
  fret: number
  isRoot: boolean
}
