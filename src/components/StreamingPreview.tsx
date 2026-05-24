import { StreamingPreview as Preview } from '../types'

interface Props {
  preview: Preview
}

export function StreamingPreviewPanel({ preview }: Props) {
  const hasContent = preview.key || preview.emotionalCharacter || preview.explanation ||
    preview.soloingTips || preview.chordFunctions?.length

  if (!hasContent) {
    return (
      <p style={{ fontSize: 13, color: 'var(--c-muted, #666)', fontFamily: 'DM Mono, monospace', margin: 0 }}>
        waiting for response...
      </p>
    )
  }

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {(preview.key || preview.mode) && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap', marginBottom: 6 }}>
            {preview.key && (
              <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--c-text, #e8e8e8)' }}>
                {preview.key}
              </span>
            )}
            {preview.mode && (
              <span style={{ fontSize: 13, color: 'var(--c-muted, #777)', fontFamily: 'DM Mono, monospace' }}>
                {preview.mode}
              </span>
            )}
          </div>
          {preview.emotionalCharacter && (
            <p style={{ fontSize: 13, color: 'var(--c-muted2, #999)', margin: 0 }}>
              {preview.emotionalCharacter}
            </p>
          )}
        </div>
      )}

      {preview.explanation && (
        <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--c-card, #111)',
          borderRadius: 8, border: '1px solid var(--c-border, #2a2a2a)' }}>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--c-text2, #ccc)', margin: 0 }}>
            {preview.explanation}
          </p>
        </div>
      )}

      {preview.chordFunctions && preview.chordFunctions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionLabel>chord functions</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {preview.chordFunctions.map(cf => (
              <div key={cf.chord} style={{ display: 'flex', gap: 12, alignItems: 'center',
                padding: '8px 12px', background: 'var(--c-card, #111)',
                borderRadius: 6, border: '1px solid var(--c-border, #2a2a2a)' }}>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 14, fontWeight: 500, minWidth: 40 }}>
                  {cf.chord}
                </span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--c-accent, #aaa)', minWidth: 24 }}>
                  {cf.numeral}
                </span>
                <span style={{ fontSize: 13, color: 'var(--c-muted2, #999)' }}>{cf.function}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {preview.soloingTips && (
        <div style={{ padding: '12px 14px', background: 'var(--c-card, #111)', borderRadius: 8,
          border: '1px solid var(--c-border, #2a2a2a)', borderLeft: '3px solid var(--c-accent-line, #555)' }}>
          <SectionLabel>soloing tips</SectionLabel>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--c-text2, #ccc)', margin: 0 }}>
            {preview.soloingTips}
          </p>
        </div>
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
      color: 'var(--c-muted, #666)', marginBottom: 8, fontFamily: 'DM Mono, monospace' }}>
      {children}
    </p>
  )
}
