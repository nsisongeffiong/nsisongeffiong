'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import dynamic from 'next/dynamic';

const PostEditor = dynamic(() => import('./PostEditor'), { ssr: false });
const MarkdownEditor = dynamic(() => import('./MarkdownEditor'), { ssr: false });

interface PostData {
  id?: string;
  title: string;
  type: 'poetry' | 'tech' | 'ideas';
  content: string;
  excerpt?: string;
  tags?: string[];
  published?: boolean;
  publishedAt?: string | null;
  createdAt?: string | null;
}

interface Props {
  initialData?: PostData;
  onSave?: (post: unknown) => void;
}

type EditorType = 'rich' | 'markdown' | 'html';

const TABS: { key: EditorType; label: string }[] = [
  { key: 'rich', label: 'Rich text' },
  { key: 'markdown', label: 'Markdown' },
  { key: 'html', label: 'HTML' },
];

export default function EditorSwitcher({ initialData, onSave }: Props) {
  const [editorType, setEditorType] = useState<EditorType>('rich');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('preferred-editor') as EditorType | null;
    if (saved && ['rich', 'markdown', 'html'].includes(saved)) {
      setEditorType(saved);
    }
  }, []);

  function switchEditor(type: EditorType) {
    setEditorType(type);
    localStorage.setItem('preferred-editor', type);
  }

  const btnBase: CSSProperties = {
    fontFamily: 'var(--font-dm-mono), monospace',
    fontSize: '11px',
    padding: '4px 12px',
    border: '0.5px solid var(--bdr2)',
    borderRadius: '3px',
    cursor: 'pointer',
    lineHeight: 1.4,
  };

  return (
    <div>
      {/* Editor type switcher */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '1.75rem' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => switchEditor(tab.key)}
            style={{
              ...btnBase,
              background: editorType === tab.key ? 'var(--bg3)' : 'var(--bg2)',
              color: editorType === tab.key ? 'var(--txt)' : 'var(--txt3)',
              borderColor: editorType === tab.key ? 'var(--bdr2)' : 'var(--bdr)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active editor */}
      {mounted && editorType === 'rich' && (
        <PostEditor initialData={initialData} onSave={onSave} />
      )}
      {mounted && editorType === 'markdown' && (
        <MarkdownEditor initialData={initialData} onSave={onSave} />
      )}
      {mounted && editorType === 'html' && (
        <RawHtmlPane initialData={initialData} onSave={onSave} />
      )}
    </div>
  );
}

// ── Inline raw HTML editor ─────────────────────────────────────────────────────
function RawHtmlPane({ initialData, onSave }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [type, setType] = useState<'poetry' | 'tech' | 'ideas'>(initialData?.type ?? 'poetry');
  const [content, setContent] = useState(initialData?.content ?? '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') ?? '');
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocal(initialData?.publishedAt));
  const [createdAt, setCreatedAt] = useState(toDatetimeLocal(initialData?.createdAt));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    const method = initialData?.id ? 'PATCH' : 'POST';
    const url = initialData?.id ? `/api/posts/${initialData.id}` : '/api/posts';

    const body = {
      title,
      type,
      content,
      excerpt,
      tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      published,
      publishedAt: publishedAt || null,
      createdAt: createdAt || null,
    };

    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Failed to save post');
        return;
      }

      const data: unknown = await res.json();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onSave) onSave(data);
    } catch {
      setError('Network error — could not save');
    } finally {
      setSaving(false);
    }
  };

  const labelStyle: CSSProperties = {
    fontFamily: 'var(--font-dm-mono), monospace',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: 'var(--txt3)',
    display: 'block',
    marginBottom: '0.4rem',
  };

  const fieldStyle: CSSProperties = {
    fontFamily: 'var(--font-dm-mono), monospace',
    fontSize: '12px',
    border: '0.5px solid var(--bdr2)',
    background: 'var(--bg2)',
    color: 'var(--txt)',
    padding: '0.5rem 0.75rem',
    borderRadius: '3px',
    width: '100%',
    outline: 'none',
  };

  return (
    <div style={{ display: 'flex', gap: 0 }}>
      {/* Editor column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Post title"
          style={{
            width: '100%',
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            border: 'none',
            borderBottom: '0.5px solid var(--bdr)',
            background: 'transparent',
            color: 'var(--txt)',
            padding: '0.75rem 0',
            marginBottom: '1rem',
            outline: 'none',
          }}
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="<p>Enter raw HTML here...</p>"
          style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '13px',
            minHeight: '500px',
            width: '100%',
            background: 'var(--bg2)',
            border: '0.5px solid var(--bdr)',
            padding: '1rem',
            color: 'var(--txt)',
            borderRadius: '3px',
            resize: 'vertical',
            outline: 'none',
            lineHeight: 1.6,
          }}
        />
      </div>

      {/* Sidebar */}
      <div style={{ width: '260px', minWidth: '260px', paddingLeft: '2rem', borderLeft: '0.5px solid var(--bdr)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value as 'poetry' | 'tech' | 'ideas')}
            style={fieldStyle}
          >
            <option value="poetry">poetry</option>
            <option value="tech">Tech</option>
            <option value="ideas">Ideas</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Excerpt</label>
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} style={{ ...fieldStyle, resize: 'vertical' }} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Tags</label>
          <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="poetry, nature, memory" style={fieldStyle} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '12px', color: 'var(--txt)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
            Published
          </label>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Published date</label>
          <input type="datetime-local" value={publishedAt} onChange={e => setPublishedAt(e.target.value)} style={fieldStyle} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Created date</label>
          <input type="datetime-local" value={createdAt} onChange={e => setCreatedAt(e.target.value)} style={fieldStyle} />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px',
            textTransform: 'uppercase',
            background: 'var(--teal-hero)',
            color: 'var(--teal-light)',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '3px',
            cursor: saving ? 'default' : 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save post'}
        </button>

        {error && (
          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px', color: 'var(--danger)', marginTop: '0.5rem' }}>
            {error}
          </div>
        )}

        <button
          onClick={() => {
            localStorage.setItem('post-preview', JSON.stringify({
              title, type, content, excerpt,
              tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
              published,
            }));
            window.open('/admin/preview', '_blank');
          }}
          style={{
            width: '100%',
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px',
            textTransform: 'uppercase',
            background: 'transparent',
            color: 'var(--amber)',
            border: '0.5px solid var(--amber)',
            padding: '0.75rem',
            borderRadius: '3px',
            cursor: 'pointer',
            marginTop: '0.75rem',
          }}
        >
          Preview
        </button>
      </div>
    </div>
  );
}

function toDatetimeLocal(val?: string | null): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
