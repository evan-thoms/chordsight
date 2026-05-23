import { useState } from 'react'
import { Chord, Analysis } from './types'
import { makeChord } from './lib/chords'
import { analyzeProgression } from './lib/claude'
import { ChordPill } from './components/ChordPill'
import { NoteSelector } from './components/NoteSelector'
import { AnalysisPanel } from './components/AnalysisPanel'

type InputMode = 'name' | 'notes'

export function App() {
  const [chords, setChords] = useState<Chord[]>([])
  const [input, setInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [inputMode, setInputMode] = useState<InputMode>('name')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addChordByName() {
    const chord = makeChord(input.trim())
    if (!chord) {
      setInputError(`"${input}" not recognized — try Am, G, Cmaj7, Dsus4`)
      return
    }
    setChords(prev => [...prev, chord])
    setInput('')
    setInputError('')
    setAnalysis(null)
  }

  function addChordFromNotes(chord: Chord) {
    setChords(prev => [...prev, chord])
    setAnalysis(null)
  }

  function removeChord(id: string) {
    setChords(prev => prev.filter(c => c.id !== id))
    setAnalysis(null)
  }

  async function handleAnalyze() {
    if (chords.length < 2) {
      setError('Add at least 2 chords to analyze a progression')
      return
    }
    setLoading(true)
    setError('')
    setAnalysis(null)
    try {
      const result = await analyzeProgression(chords)
      setAnalysis(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg, #0a0a0a)',
      color: 'var(--c-text, #e8e8e8)',
      fontFamily: 'DM Sans, sans-serif',
      '--c-muted': '#666',
      '--c-muted2': '#999',
      '--c-text': '#e8e8e8',
      '--c-text2': '#ccc',
      '--c-card': '#111',
      '--c-border': '#2a2a2a',
      '--c-pill-bg': '#141414',
      '--c-pill-border': '#333',
      '--c-pill-text': '#e8e8e8',
      '--c-btn-bg': '#111',
      '--c-btn-text': '#aaa',
      '--c-accent': '#e8e8e8',
      '--c-accent-text': '#000',
      '--c-accent-line': '#444',
      '--fb-muted': '#555',
      '--fb-fret': '#333',
      '--fb-nut': '#666',
      '--fb-string': '#444',
      '--fb-root': '#e8e8e8',
      '--fb-note': '#555',
    } as React.CSSProperties}>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: '0 0 6px',
            fontFamily: 'DM Mono, monospace', letterSpacing: '-0.02em' }}>
            solo companion
          </h1>
          <p style={{ fontSize: 14, color: 'var(--c-muted2, #999)', margin: 0 }}>
            build a progression → understand what to play and why
          </p>
        </div>

        {/* Input mode toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16,
          border: '1px solid var(--c-border, #2a2a2a)', borderRadius: 6,
          overflow: 'hidden', width: 'fit-content' }}>
          {(['name', 'notes'] as InputMode[]).map(mode => (
            <button key={mode} onClick={() => setInputMode(mode)} style={{
              padding: '7px 16px', fontSize: 12, cursor: 'pointer',
              fontFamily: 'DM Mono, monospace',
              background: inputMode === mode ? 'var(--c-accent, #e8e8e8)' : 'transparent',
              color: inputMode === mode ? 'var(--c-accent-text, #000)' : 'var(--c-muted, #666)',
              border: 'none',
            }}>
              {mode === 'name' ? 'chord name' : 'pick notes'}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div style={{ marginBottom: 20 }}>
          {inputMode === 'name' ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={input}
                onChange={e => { setInput(e.target.value); setInputError('') }}
                onKeyDown={e => e.key === 'Enter' && addChordByName()}
                placeholder="Am, G, Cmaj7, Dsus4..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 6, fontSize: 14,
                  background: 'var(--c-card, #111)', border: '1px solid var(--c-border, #2a2a2a)',
                  color: 'var(--c-text, #e8e8e8)', fontFamily: 'DM Mono, monospace',
                  outline: 'none',
                }}
              />
              <button onClick={addChordByName} style={{
                padding: '10px 18px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                background: 'var(--c-accent, #e8e8e8)', color: 'var(--c-accent-text, #000)',
                border: 'none', fontFamily: 'DM Mono, monospace', fontWeight: 500,
              }}>
                add
              </button>
            </div>
          ) : (
            <NoteSelector onAddChord={addChordFromNotes} />
          )}
          {inputError && (
            <p style={{ fontSize: 12, color: '#e05555', marginTop: 6,
              fontFamily: 'DM Mono, monospace' }}>{inputError}</p>
          )}
        </div>

        {/* Progression builder */}
        {chords.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {chords.map((chord, i) => (
                <ChordPill key={chord.id} chord={chord} index={i} onRemove={removeChord} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                onClick={handleAnalyze}
                disabled={loading || chords.length < 2}
                style={{
                  padding: '10px 20px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                  background: loading ? 'transparent' : 'var(--c-accent, #e8e8e8)',
                  color: loading ? 'var(--c-muted, #666)' : 'var(--c-accent-text, #000)',
                  border: loading ? '1px solid var(--c-border, #2a2a2a)' : 'none',
                  fontFamily: 'DM Mono, monospace', fontWeight: 500,
                  opacity: chords.length < 2 ? 0.4 : 1,
                }}
              >
                {loading ? 'analyzing...' : 'analyze progression →'}
              </button>
              <button onClick={() => { setChords([]); setAnalysis(null) }} style={{
                background: 'none', border: 'none', fontSize: 12, cursor: 'pointer',
                color: 'var(--c-muted, #666)', fontFamily: 'DM Mono, monospace',
              }}>
                clear all
              </button>
            </div>
          </div>
        )}

        {error && (
          <p style={{ fontSize: 13, color: '#e05555', fontFamily: 'DM Mono, monospace',
            marginBottom: 16 }}>{error}</p>
        )}

        {/* Analysis output */}
        {analysis && (
          <div style={{ marginTop: 32, paddingTop: 32,
            borderTop: '1px solid var(--c-border, #2a2a2a)' }}>
            <AnalysisPanel analysis={analysis} />
          </div>
        )}

        {/* Empty state */}
        {chords.length === 0 && !analysis && (
          <div style={{ marginTop: 60, textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--c-muted, #555)',
              fontFamily: 'DM Mono, monospace', lineHeight: 2 }}>
              try: Am → F → C → G<br />
              or pick notes to identify a chord you don't know
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
