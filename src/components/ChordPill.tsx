import { Chord } from '../types'

interface Props {
  chord: Chord
  onRemove: (id: string) => void
  index: number
}

export function ChordPill({ chord, onRemove, index }: Props) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: 'var(--c-pill-bg, #1a1a1a)', border: '1px solid var(--c-pill-border, #333)',
      borderRadius: 6, padding: '6px 10px', fontFamily: 'DM Mono, monospace',
      fontSize: 14, color: 'var(--c-pill-text, #e8e8e8)',
    }}>
      <span style={{ color: 'var(--c-muted, #666)', fontSize: 11, marginRight: 2 }}>
        {index + 1}
      </span>
      {chord.name}
      <button
        onClick={() => onRemove(chord.id)}
        aria-label={`Remove ${chord.name}`}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--c-muted, #555)', fontSize: 14, padding: '0 2px',
          lineHeight: 1, marginLeft: 2,
        }}
      >×</button>
    </div>
  )
}
