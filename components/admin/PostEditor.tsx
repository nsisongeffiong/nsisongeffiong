'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

interface PostData {
  id?: string;
  title: string;
  type: 'poetry' | 'tech' | 'ideas';
  content: string;
  excerpt?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  published?: boolean;
}

interface PostEditorProps {
  initialData?: PostData;
  onSave?: (post: unknown) => void;
}

const lowlight = createLowlight(common);

export default function PostEditor({ initialData, onSave }: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [type, setType] = useState<'poetry' | 'tech' | 'ideas'>(initialData?.type ?? 'poetry');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') ?? '');
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing...' }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialData?.content ?? '',
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
    },
  });

  useEffect(() => {
    if (editor && initialData?.content) {
      editor.commands.setContent(initialData.content);
    }
  }, [editor, initialData?.content]);

  const handleSave = async () => {
    if (!editor) return;

    setSaving(true);
    setError('');
    setSaved(false);

    const method = initialData?.id ? 'PATCH' : 'POST';
    const url = initialData?.id ? `/api/posts/${initialData.id}` : '/api/posts';

    const body = {
      title,
      type,
      content: editor.getHTML(),
      excerpt,
      tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      published,
    };

    try {
      const res = await fetch(url, {
        method,
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

      if (onSave) {
        onSave(data);
      }
    } catch {
      setError('Network error — could not save');
    } finally {
      setSaving(false);
    }
  };

  const buttonLabel = saving ? 'Saving...' : saved ? 'Saved' : 'Save post';

  return (
    <div style={{ display: 'flex', gap: 0 }}>
      {/* Editor column */}
      <div style={{ flex: 1 }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
            marginBottom: '1.5rem',
            outline: 'none',
          }}
        />
        <EditorContent editor={editor} style={{ minHeight: '400px' }} />
      </div>

      {/* Sidebar */}
      <div
        style={{
          width: '260px',
          minWidth: '260px',
          paddingLeft: '2rem',
          borderLeft: '0.5px solid var(--bdr)',
        }}
      >
        {/* Type */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--txt3)',
              display: 'block',
              marginBottom: '0.4rem',
            }}
          >
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'poetry' | 'tech' | 'ideas')}
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '12px',
              border: '0.5px solid var(--bdr2)',
              background: 'var(--bg2)',
              color: 'var(--txt)',
              padding: '0.5rem 0.75rem',
              borderRadius: '3px',
              width: '100%',
              outline: 'none',
            }}
          >
            <option value="poetry">poetry</option>
            <option value="tech">Tech</option>
            <option value="ideas">Ideas</option>
          </select>
        </div>

        {/* Excerpt */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--txt3)',
              display: 'block',
              marginBottom: '0.4rem',
            }}
          >
            Excerpt
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '12px',
              border: '0.5px solid var(--bdr2)',
              background: 'var(--bg2)',
              color: 'var(--txt)',
              padding: '0.5rem 0.75rem',
              borderRadius: '3px',
              width: '100%',
              outline: 'none',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--txt3)',
              display: 'block',
              marginBottom: '0.4rem',
            }}
          >
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="poetry, nature, memory"
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '12px',
              border: '0.5px solid var(--bdr2)',
              background: 'var(--bg2)',
              color: 'var(--txt)',
              padding: '0.5rem 0.75rem',
              borderRadius: '3px',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>

        {/* Published */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '12px',
              color: 'var(--txt)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published
          </label>
        </div>

        {/* Save button */}
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
          {buttonLabel}
        </button>

        {/* Error */}
        {error && (
          <div
            style={{
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '11px',
              color: 'var(--color-text-danger)',
              marginTop: '0.5rem',
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
