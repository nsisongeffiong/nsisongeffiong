'use client';

import { useEffect, useState } from 'react';

interface PreviewData {
  title: string;
  type: 'poetry' | 'tech' | 'ideas';
  content: string;
  excerpt?: string;
  tags?: string[];
  published?: boolean;
}

export default function PreviewPage() {
  const [data, setData] = useState<PreviewData | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('post-preview');
    if (raw) {
      try { setData(JSON.parse(raw)); } catch {}
    }
  }, []);

  if (!data) {
    return (
      <div style={{
        padding: '4rem 2rem',
        fontFamily: 'var(--font-dm-mono), monospace',
        color: 'var(--txt3)',
      }}>
        No preview data found. Open this page from the editor.
      </div>
    );
  }

  const { title, type, content, excerpt, tags } = data;
  const accentColor = type === 'poetry' ? 'var(--purple)' : type === 'tech' ? 'var(--teal-mid)' : 'var(--amber)';

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--txt)', minHeight: '100vh' }}>
      {/* Preview banner */}
      <div style={{
        background: 'var(--amber-bg)',
        borderBottom: '1px solid var(--amber)',
        padding: '0.6rem 2rem',
        fontFamily: 'var(--font-dm-mono), monospace',
        fontSize: '12px',
        color: 'var(--amber)',
        textAlign: 'center',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        Preview mode — not published
      </div>

      {/* Header */}
      <header style={{
        padding: type === 'poetry' ? '3rem 2rem 0' : '4rem 2rem 2.5rem',
        borderBottom: '2px solid var(--txt)',
        maxWidth: type === 'poetry' ? 580 : undefined,
        margin: type === 'poetry' ? '0 auto' : undefined,
        textAlign: type === 'poetry' ? 'center' : undefined,
      }}>
        {tags && tags.length > 0 && (
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase',
            color: accentColor,
            display: 'block', marginBottom: '1rem',
          }}>{tags[0]}</span>
        )}

        <h1 style={{
          fontFamily: type === 'tech'
            ? 'var(--font-dm-mono), monospace'
            : type === 'poetry'
              ? 'var(--font-cormorant), serif'
              : 'var(--font-inter-tight), var(--font-syne), sans-serif',
          fontWeight: type === 'poetry' ? 300 : type === 'tech' ? 500 : 800,
          fontStyle: type === 'poetry' ? 'italic' : 'normal',
          fontSize: 'clamp(28px, 4vw, 52px)',
          lineHeight: 1.06,
          letterSpacing: '-0.03em',
          color: 'var(--txt)',
          marginBottom: '1.25rem',
          maxWidth: type !== 'poetry' ? '28ch' : undefined,
        }}>{title}</h1>

        {excerpt && (
          <p style={{
            fontFamily: 'var(--font-source-serif), serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: '18px',
            lineHeight: 1.6,
            color: 'var(--txt2)',
            marginBottom: '1.5rem',
            maxWidth: '56ch',
          }}>{excerpt}</p>
        )}
      </header>

      {/* Body */}
      {type === 'tech' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px' }}>
          <article
            className="tech-content"
            style={{ padding: '3rem 2rem', borderRight: '0.5px solid var(--bdr)' }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          <aside style={{
            padding: '3rem 1.75rem',
            background: 'var(--bg2)',
            alignSelf: 'start',
            position: 'sticky',
            top: 0,
          }}>
            <span style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase',
              color: 'var(--txt3)', display: 'block', marginBottom: '1rem',
            }}>// contents</span>
            {tags?.map((tag, i) => (
              <span key={tag} style={{
                fontFamily: 'var(--font-dm-mono), monospace',
                fontSize: '12px',
                color: i === 0 ? 'var(--teal-mid)' : 'var(--txt2)',
                display: 'block',
                padding: '0.5rem 0',
                borderBottom: '0.5px solid var(--bdr)',
              }}>{tag}</span>
            ))}
          </aside>
        </div>
      ) : type === 'poetry' ? (
        <article
          className="poem-content"
          style={{ maxWidth: 480, margin: '0 auto', padding: '3rem 2rem' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <article
          className="ideas-body"
          style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 2rem' }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
}
