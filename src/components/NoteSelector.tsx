import { useState } from 'react'
import { NoteName } from '../types'
import { ALL_NOTES, identifyChord, makeChord } from '../lib/chords'
import { Chord } from '../types'

interface Props {
  onAddChord: (chord: Chord) => void
}

export function NoteSelector({ onAddChord }: Props) {
  const [selectedNotes, setSelectedNotes] = useState<NoteName[]>([])
  const [identified, setIdentified] = useState<{ name: string; root: string; quality: string } | null>(null)

  function toggleNote(note: NoteName) {
    const next = selectedNotes.includes(note)
      ? selectedNotes.filter(n => n !== note)
      : [...selectedNotes, note]
    setSelectedNotes(next)
    setIdentified(next.length >= 2 ? identifyChord(next) : null)
  }

  function addIdentified() {
    if (!identified) return
    const chord = makeChord(identified.name)
    if (chord) {
      onAddChord(chord)
      setSelectedNotes([])
      setIdentified(null)
    }
  }

  return (
    <div style={{ padding: '12px 0' }}>
      <p style={{ fontSize: 12, color: 'var(--c-muted, #666)', marginBottom: 10,
        fontFamily: 'DM Mono, monospace' }}>
        select notes → identify chord
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {ALL_NOTES.map(note => (
          <button
            key={note}
            onClick={() => toggleNote(note)}
            style={{
              padding: '6px 10px', borderRadius: 4, fontSize: 13, cursor: 'pointer',
              fontFamily: 'DM Mono, monospace', fontWeight: 500,
              background: selectedNotes.includes(note)
                ? 'var(--c-accent, #e8e8e8)' : 'var(--c-btn-bg, #111)',
              color: selectedNotes.includes(note)
                ? 'var(--c-accent-text, #000)' : 'var(--c-btn-text, #aaa)',
              border: selectedNotes.includes(note)
                ? '1px solid var(--c-accent, #e8e8e8)' : '1px solid var(--c-border, #333)',
            }}
          >
            {note}
          </button>
        ))}
      </div>
      {identified ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 14,
            color: 'var(--c-text, #e8e8e8)' }}>
            → <strong>{identified.name}</strong> ({identified.quality})
          </span>
          <button onClick={addIdentified} style={{
            padding: '5px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
            background: 'var(--c-accent, #e8e8e8)', color: 'var(--c-accent-text, #000)',
            border: 'none', fontFamily: 'DM Mono, monospace', fontWeight: 500,
          }}>
            add to progression
          </button>
        </div>
      ) : selectedNotes.length >= 2 ? (
        <span style={{ fontSize: 12, color: 'var(--c-muted, #666)',
          fontFamily: 'DM Mono, monospace' }}>
          chord not recognized — try different notes
        </span>
      ) : null}
    </div>
  )
}
