import { useState } from 'react'
import { Analysis } from '../types'
import { Fretboard } from './Fretboard'

interface Props {
  analysis: Analysis
}

export function AnalysisPanel({ analysis }: Props) {
  const [activeScale, setActiveScale] = useState(0)
  const scale = analysis.recommendedScales[activeScale]

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>

      {/* Key + vibe */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--c-text, #e8e8e8)' }}>
            {analysis.key}
          </span>
          <span style={{ fontSize: 13, color: 'var(--c-muted, #777)', fontFamily: 'DM Mono, monospace' }}>
            {analysis.mode}
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--c-muted2, #999)', fontStyle: 'italic', margin: 0 }}>
          {analysis.emotionalCharacter}
        </p>
      </div>

      {/* Explanation */}
      <div style={{ marginBottom: 20, padding: '12px 14px',
        background: 'var(--c-card, #111)', borderRadius: 8,
        border: '1px solid var(--c-border, #2a2a2a)' }}>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--c-text2, #ccc)', margin: 0 }}>
          {analysis.explanation}
        </p>
      </div>

      {/* Chord functions */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--c-muted, #666)', marginBottom: 10, fontFamily: 'DM Mono, monospace' }}>
          chord functions
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {analysis.chordFunctions.map(cf => (
            <div key={cf.chord} style={{ display: 'flex', gap: 12, alignItems: 'center',
              padding: '8px 12px', background: 'var(--c-card, #111)',
              borderRadius: 6, border: '1px solid var(--c-border, #2a2a2a)' }}>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 14,
                fontWeight: 500, color: 'var(--c-text, #e8e8e8)', minWidth: 40 }}>
                {cf.chord}
              </span>
              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12,
                color: 'var(--c-accent, #aaa)', minWidth: 24 }}>
                {cf.numeral}
              </span>
              <span style={{ fontSize: 13, color: 'var(--c-muted2, #999)' }}>
                {cf.function}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Soloing tips */}
      <div style={{ marginBottom: 20, padding: '12px 14px',
        background: 'var(--c-card, #111)', borderRadius: 8,
        borderLeft: '3px solid var(--c-accent-line, #555)',
        border: '1px solid var(--c-border, #2a2a2a)',
        borderLeftWidth: 3 }}>
        <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--c-muted, #666)', marginBottom: 8, fontFamily: 'DM Mono, monospace' }}>
          soloing tips
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--c-text2, #ccc)', margin: 0 }}>
          {analysis.soloingTips}
        </p>
      </div>

      {/* Scale selector + fretboard */}
      {analysis.recommendedScales.length > 0 && (
        <div>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: 'var(--c-muted, #666)', marginBottom: 10, fontFamily: 'DM Mono, monospace' }}>
            recommended scales
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {analysis.recommendedScales.map((s, i) => (
              <button key={s.name} onClick={() => setActiveScale(i)} style={{
                padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
                fontFamily: 'DM Mono, monospace',
                background: i === activeScale ? 'var(--c-accent, #e8e8e8)' : 'var(--c-btn-bg, #111)',
                color: i === activeScale ? 'var(--c-accent-text, #000)' : 'var(--c-btn-text, #aaa)',
                border: i === activeScale
                  ? '1px solid var(--c-accent, #e8e8e8)' : '1px solid var(--c-border, #333)',
              }}>
                {s.name}
              </button>
            ))}
          </div>
          {scale && (
            <div style={{ padding: '14px', background: 'var(--c-card, #111)',
              borderRadius: 8, border: '1px solid var(--c-border, #2a2a2a)' }}>
              <p style={{ fontSize: 13, color: 'var(--c-muted2, #999)', marginBottom: 14 }}>
                {scale.why}
              </p>
              {scale.positions.length > 0 && (
                <Fretboard
                  key={scale.name}
                  positions={scale.positions}
                  scaleNotes={scale.notes}
                />
              )}
              <p style={{ fontSize: 12, color: 'var(--c-muted, #666)', marginTop: 10,
                fontFamily: 'DM Mono, monospace' }}>
                notes: {scale.notes.join(' · ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
