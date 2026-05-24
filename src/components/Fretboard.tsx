import { useState } from 'react'
import { FretPosition, NoteName } from '../types'
import { ALL_NOTES } from '../lib/chords'

interface Props {
  positions: FretPosition[]
  scaleNotes: NoteName[]
}

const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']
const OPEN_STRINGS: NoteName[] = ['E', 'B', 'G', 'D', 'A', 'E']
const FRET_SPAN = 5
const SLIDES = [
  { start: 0, label: 'open' },
  { start: 4, label: 'middle' },
  { start: 8, label: 'upper' },
]

function getNoteAtPosition(str: number, fret: number): NoteName {
  const openIdx = ALL_NOTES.indexOf(OPEN_STRINGS[str - 1])
  return ALL_NOTES[((openIdx + fret) % 12 + 12) % 12] as NoteName
}

function fretX(fret: number, startFret: number): number {
  const col = fret - startFret
  if (fret === 0 && startFret === 0) return 43
  return 70 + col * 54 + 27
}

export function Fretboard({ positions }: Props) {
  const [slide, setSlide] = useState(1)
  const { start: startFret, label: slideLabel } = SLIDES[slide]
  const endFret = startFret + FRET_SPAN - 1
  const frets = Array.from({ length: FRET_SPAN }, (_, i) => startFret + i)
  const posMap = new Map(positions.map(p => [`${p.string}-${p.fret}`, p]))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <NavButton
          label="Previous fret range"
          disabled={slide === 0}
          onClick={() => setSlide(s => s - 1)}
        >
          ←
        </NavButton>

        <svg
          viewBox="0 0 340 160"
          style={{ flex: 1, width: '100%', maxWidth: 500, display: 'block' }}
          aria-label={`Guitar fretboard diagram, frets ${startFret} to ${endFret}`}
        >
          {frets.map(f => (
            <text key={f} x={fretX(f, startFret)} y={14} textAnchor="middle"
              fontSize="10" fill="var(--fb-muted, #888)" fontFamily="DM Mono, monospace">
              {f === 0 ? 'O' : f}
            </text>
          ))}

          {[0, 1, 2, 3, 4, 5].map(i => (
            <line key={i}
              x1={70 + i * 54} y1={20} x2={70 + i * 54} y2={150}
              stroke={i === 0 ? 'var(--fb-nut, #555)' : 'var(--fb-fret, #ccc)'}
              strokeWidth={i === 0 ? 3 : 1}
            />
          ))}

          {[1, 2, 3, 4, 5, 6].map(str => {
            const y = 20 + (str - 1) * 26
            return (
              <g key={str}>
                <text x={58} y={y + 5} textAnchor="end" fontSize="10"
                  fill="var(--fb-muted, #888)" fontFamily="DM Mono, monospace">
                  {STRING_NAMES[str - 1]}
                </text>
                <line x1={64} y1={y} x2={338} y2={y}
                  stroke="var(--fb-string, #aaa)"
                  strokeWidth={str > 3 ? str - 2 : 1}
                />
              </g>
            )
          })}

          {[1, 2, 3, 4, 5, 6].map(str =>
            frets.map(fret => {
              const key = `${str}-${fret}`
              const pos = posMap.get(key)
              if (!pos) return null
              const note = getNoteAtPosition(str, fret)
              const x = fretX(fret, startFret)
              const y = 20 + (str - 1) * 26
              return (
                <g key={key}>
                  <circle cx={x} cy={y} r={11}
                    fill={pos.isRoot ? 'var(--fb-root, #2a2a2a)' : 'var(--fb-note, #555)'}
                  />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize="9" fontWeight="500"
                    fill="white" fontFamily="DM Mono, monospace">
                    {note}
                  </text>
                </g>
              )
            })
          )}
        </svg>

        <NavButton
          label="Next fret range"
          disabled={slide === SLIDES.length - 1}
          onClick={() => setSlide(s => s + 1)}
        >
          →
        </NavButton>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--fb-muted, #888)',
        fontFamily: 'DM Mono, monospace', margin: '8px 0 0' }}>
        ● root &nbsp; ● scale tone &nbsp; {slideLabel} · frets {startFret === 0 ? 'open' : startFret}–{endFret}
        &nbsp;·&nbsp; {slide + 1}/{SLIDES.length}
      </p>
    </div>
  )
}

function NavButton({ label, disabled, onClick, children }: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        flexShrink: 0,
        width: 32,
        height: 32,
        borderRadius: 6,
        border: '1px solid var(--c-border, #333)',
        background: disabled ? 'transparent' : 'var(--c-btn-bg, #111)',
        color: disabled ? 'var(--c-muted, #444)' : 'var(--c-btn-text, #aaa)',
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'DM Mono, monospace',
        fontSize: 14,
      }}
    >
      {children}
    </button>
  )
}
