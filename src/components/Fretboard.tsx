import { FretPosition, NoteName } from '../types'
import { ALL_NOTES } from '../lib/chords'

interface Props {
  positions: FretPosition[]
  scaleNotes: NoteName[]
  startFret?: number
}

const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E']
const OPEN_STRINGS: NoteName[] = ['E', 'B', 'G', 'D', 'A', 'E']

function getNoteAtPosition(str: number, fret: number): NoteName {
  const openIdx = ALL_NOTES.indexOf(OPEN_STRINGS[str - 1])
  return ALL_NOTES[((openIdx + fret) % 12 + 12) % 12] as NoteName
}

export function Fretboard({ positions, scaleNotes, startFret = 4 }: Props) {
  const frets = [startFret, startFret + 1, startFret + 2, startFret + 3, startFret + 4]
  const posMap = new Map(positions.map(p => [`${p.string}-${p.fret}`, p]))

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        viewBox="0 0 340 160"
        style={{ width: '100%', maxWidth: 500, display: 'block', margin: '0 auto' }}
        aria-label="Guitar fretboard diagram"
      >
        {/* Fret numbers */}
        {frets.map((f, i) => (
          <text key={f} x={70 + i * 54 + 27} y={14} textAnchor="middle"
            fontSize="10" fill="var(--fb-muted, #888)" fontFamily="DM Mono, monospace">
            {f}
          </text>
        ))}

        {/* Nut / fret lines */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line key={i}
            x1={70 + i * 54} y1={20} x2={70 + i * 54} y2={150}
            stroke={i === 0 ? 'var(--fb-nut, #555)' : 'var(--fb-fret, #ccc)'}
            strokeWidth={i === 0 ? 3 : 1}
          />
        ))}

        {/* String lines + labels */}
        {[1,2,3,4,5,6].map(str => {
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

        {/* Notes */}
        {[1,2,3,4,5,6].map(str =>
          frets.map(fret => {
            const key = `${str}-${fret}`
            const pos = posMap.get(key)
            if (!pos) return null
            const note = getNoteAtPosition(str, fret)
            const x = 70 + (frets.indexOf(fret)) * 54 + 27
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
      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--fb-muted, #888)',
        fontFamily: 'DM Mono, monospace', margin: '4px 0 0' }}>
        ● root &nbsp; ● scale tone &nbsp; frets {startFret}–{startFret + 4}
      </p>
    </div>
  )
}
