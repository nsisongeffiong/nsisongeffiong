'use client';

import { useState, useRef, useEffect, type CSSProperties } from 'react';
import { marked } from 'marked';

interface PostData {
  id?: string;
  title: string;
  type: 'poetry' | 'tech' | 'ideas';
  content: string;
  excerpt?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  published?: boolean;
  publishedAt?: string | null;
  createdAt?: string | null;
}

interface Props {
  initialData?: PostData;
  onSave?: (post: unknown) => void;
  onContentChange?: (content: string) => void;
}

const DRAFT_KEY = 'editor-content-draft';
const CLOSE_PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
const CLOSEABLE_TAGS = ['p', 'h2', 'h3', 'h4', 'blockquote', 'div', 'span', 'em', 'strong', 'a', 'li', 'ul', 'ol', 'code', 'pre'];
const COMMON_TAGS = ['a', 'blockquote', 'code', 'div', 'em', 'h2', 'h3', 'h4', 'li', 'ol', 'p', 'pre', 'span', 'strong', 'ul'];
const LINE_HEIGHT = 22;
const CHAR_WIDTH = 7.8;
const PANE_HEADER_H = 33;
const PANE_PADDING = 16;

interface TagDropdown {
  prefix: string;
  anchorPos: number;
  top: number;
  left: number;
}

function toDatetimeLocal(val?: string | null): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MarkdownEditor({ initialData, onSave, onContentChange }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [type, setType] = useState<'poetry' | 'tech' | 'ideas'>(initialData?.type ?? 'poetry');
  const [markdown, setMarkdown] = useState(() => {
    if (initialData?.content) return initialData.content;
    if (typeof window !== 'undefined') return localStorage.getItem(DRAFT_KEY) ?? '';
    return '';
  });
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') ?? '');
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocal(initialData?.publishedAt));
  const [createdAt, setCreatedAt] = useState(toDatetimeLocal(initialData?.createdAt));
  const [poetNote, setPoetNote] = useState((initialData?.metadata as any)?.poetNote ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [tagDropdown, setTagDropdown] = useState<TagDropdown | null>(null);

  useEffect(() => {
    if (initialData?.metadata) {
      setPoetNote((initialData.metadata as any)?.poetNote ?? '');
    }
  }, [initialData?.metadata]);

  const mdRef = useRef<HTMLTextAreaElement>(null);

  const previewHtml = marked.parse(markdown) as string;
  const contentClass =
    type === 'poetry' ? 'poem-content' : type === 'tech' ? 'tech-content' : 'ideas-body';

  const filteredTags = tagDropdown
    ? COMMON_TAGS.filter(t => t.startsWith(tagDropdown.prefix.toLowerCase()))
    : [];

  // ── Content update helper ────────────────────────────────────────────────────
  const updateMarkdown = (val: string) => {
    setMarkdown(val);
    localStorage.setItem(DRAFT_KEY, val);
    onContentChange?.(val);
  };

  // ── Tag dropdown logic ───────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    const beforeCursor = val.slice(0, pos);
    const tagMatch = beforeCursor.match(/<([a-zA-Z]*)$/);

    if (tagMatch && mdRef.current) {
      const el = mdRef.current;
      const anchorPos = pos - tagMatch[0].length;
      const lines = val.slice(0, anchorPos).split('\n');
      const lineNum = lines.length - 1;
      const top = PANE_HEADER_H + lineNum * LINE_HEIGHT - el.scrollTop + LINE_HEIGHT;
      const currentLine = lines[lines.length - 1];
      const left = PANE_PADDING + currentLine.length * CHAR_WIDTH;
      setTagDropdown({ prefix: tagMatch[1], anchorPos, top, left });
    } else {
      setTagDropdown(null);
    }

    updateMarkdown(val);
  };

  const insertTag = (tag: string) => {
    const el = mdRef.current;
    if (!el) return;
    const pos = el.selectionStart;
    const beforeCursor = markdown.slice(0, pos);
    const match = beforeCursor.match(/<([a-zA-Z]*)$/);
    if (!match) { setTagDropdown(null); return; }

    const replaceStart = pos - match[0].length;
    const newVal = markdown.slice(0, replaceStart) + `<${tag}></${tag}>` + markdown.slice(pos);
    updateMarkdown(newVal);
    setTagDropdown(null);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = replaceStart + tag.length + 2; // inside <tag>|</tag>
      el.focus();
    });
  };

  // ── Keyboard handling ────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Dropdown navigation
    if (tagDropdown && filteredTags.length > 0) {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        insertTag(filteredTags[0]);
        return;
      }
      if (e.key === 'Escape') {
        setTagDropdown(null);
        return;
      }
    }

    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    // Auto-close bracket pairs
    if (CLOSE_PAIRS[e.key]) {
      e.preventDefault();
      const newVal = markdown.slice(0, start) + e.key + CLOSE_PAIRS[e.key] + markdown.slice(end);
      updateMarkdown(newVal);
      setTagDropdown(null);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 1; });
      return;
    }

    // Auto-close HTML tags on >
    if (e.key === '>') {
      const before = markdown.slice(0, start);
      const tagMatch = before.match(/<([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?\s*$/);
      if (tagMatch) {
        const tag = tagMatch[1].toLowerCase();
        if (CLOSEABLE_TAGS.includes(tag)) {
          e.preventDefault();
          const selected = markdown.slice(start, end);
          const insert = '>' + selected + '</' + tag + '>';
          const newVal = markdown.slice(0, start) + insert + markdown.slice(end);
          updateMarkdown(newVal);
          setTagDropdown(null);
          requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 1; });
          return;
        }
      }
    }
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    const method = initialData?.id ? 'PATCH' : 'POST';
    const url = initialData?.id ? `/api/posts/${initialData.id}` : '/api/posts';

    const body = {
      title, type,
      content: marked.parse(markdown) as string,
      excerpt,
      tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      published,
      publishedAt: publishedAt || null,
      createdAt: createdAt || null,
      metadata: { ...(initialData?.metadata ?? {}), poetNote: poetNote || null },
    };

    try {
      const res = await fetch(url, {
        method, credentials: 'include',
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
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem('editor-draft-id');
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
    fontSize: '10px', textTransform: 'uppercase',
    letterSpacing: '0.12em', color: 'var(--txt3)',
    display: 'block', marginBottom: '0.4rem',
  };

  const fieldStyle: CSSProperties = {
    fontFamily: 'var(--font-dm-mono), monospace',
    fontSize: '12px', border: '0.5px solid var(--bdr2)',
    background: 'var(--bg2)', color: 'var(--txt)',
    padding: '0.5rem 0.75rem', borderRadius: '3px',
    width: '100%', outline: 'none',
  };

  return (
    <div style={{ display: 'flex', gap: 0 }}>
      {/* Split pane */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <input
          type="text" value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Post title"
          style={{
            width: '100%', fontFamily: 'var(--font-syne), sans-serif',
            fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em',
            border: 'none', borderBottom: '0.5px solid var(--bdr)',
            background: 'transparent', color: 'var(--txt)',
            padding: '0.75rem 0', marginBottom: '1rem', outline: 'none',
          }}
        />

        {/* Panes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1 }}>
          {/* Markdown input */}
          <div style={{ borderRight: '0.5px solid var(--bdr)', position: 'relative' }}>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px',
              textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--txt3)',
              padding: '0.4rem 0.75rem', borderBottom: '0.5px solid var(--bdr)',
            }}>markdown</div>
            <textarea
              ref={mdRef}
              value={markdown}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Write markdown here..."
              style={{
                fontFamily: 'var(--font-dm-mono), monospace', fontSize: '13px',
                width: '100%', minHeight: '540px', background: 'var(--bg2)',
                border: 'none', padding: '1rem', color: 'var(--txt)',
                resize: 'vertical', outline: 'none', lineHeight: `${LINE_HEIGHT}px`,
              }}
            />

            {/* Tag autocomplete dropdown */}
            {tagDropdown && filteredTags.length > 0 && (
              <ul
                onMouseDown={e => e.preventDefault()}
                style={{
                  position: 'absolute',
                  top: tagDropdown.top,
                  left: tagDropdown.left,
                  zIndex: 100,
                  background: 'var(--bg)',
                  border: '0.5px solid var(--bdr2)',
                  borderRadius: '4px',
                  margin: 0,
                  padding: '2px 0',
                  listStyle: 'none',
                  minWidth: '100px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                }}
              >
                {filteredTags.slice(0, 8).map((tag, i) => (
                  <li
                    key={tag}
                    onClick={() => insertTag(tag)}
                    style={{
                      fontFamily: 'var(--font-dm-mono), monospace',
                      fontSize: '12px',
                      padding: '4px 10px',
                      cursor: 'pointer',
                      color: i === 0 ? 'var(--teal-mid)' : 'var(--txt2)',
                      background: i === 0 ? 'var(--bg2)' : 'transparent',
                    }}
                  >
                    &lt;{tag}&gt;
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Live preview */}
          <div>
            <div style={{
              fontFamily: 'var(--font-dm-mono), monospace', fontSize: '10px',
              textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--txt3)',
              padding: '0.4rem 0.75rem', borderBottom: '0.5px solid var(--bdr)',
            }}>preview</div>
            <div
              className={contentClass}
              style={{ padding: '1rem 1.25rem', minHeight: '540px' }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ width: '260px', minWidth: '260px', paddingLeft: '2rem', borderLeft: '0.5px solid var(--bdr)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Type</label>
          <select value={type} onChange={e => setType(e.target.value as 'poetry' | 'tech' | 'ideas')} style={fieldStyle}>
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
        {type === 'poetry' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Poet&apos;s note</label>
            <textarea
              value={poetNote}
              onChange={e => setPoetNote(e.target.value)}
              rows={4}
              style={{ ...fieldStyle, resize: 'vertical' }}
            />
          </div>
        )}
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
          onClick={handleSave} disabled={saving}
          style={{
            width: '100%', fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', textTransform: 'uppercase',
            background: 'var(--teal-hero)', color: 'var(--teal-light)',
            border: 'none', padding: '0.75rem', borderRadius: '3px',
            cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1,
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
              title, type,
              content: marked.parse(markdown) as string,
              excerpt,
              tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
              published,
            }));
            window.open('/admin/preview', '_blank');
          }}
          style={{
            width: '100%', fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '11px', textTransform: 'uppercase',
            background: 'transparent', color: 'var(--amber)',
            border: '0.5px solid var(--amber)', padding: '0.75rem',
            borderRadius: '3px', cursor: 'pointer', marginTop: '0.75rem',
          }}
        >
          Preview
        </button>
      </div>
    </div>
  );
}
