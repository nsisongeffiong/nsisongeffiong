'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import { Node, Mark, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';
import { common, createLowlight } from 'lowlight';

// ── Types ──────────────────────────────────────────────────────────────────────
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

interface PostEditorProps {
  initialData?: PostData;
  onSave?: (post: unknown) => void;
  onContentChange?: (content: string) => void;
}

type BtnDef = {
  label: string;
  title: string;
  action: (e: Editor) => void;
  active?: (e: Editor) => boolean;
};
type Sep = { sep: true };
type ToolbarItem = BtnDef | Sep;

// ── Custom extensions ──────────────────────────────────────────────────────────
const IndentMark = Mark.create({
  name: 'indent',
  parseHTML() { return [{ tag: 'span.i1' }]; },
  renderHTML() { return ['span', { class: 'i1' }, 0]; },
});

const DeepIndentMark = Mark.create({
  name: 'deepIndent',
  parseHTML() { return [{ tag: 'span.i2' }]; },
  renderHTML() { return ['span', { class: 'i2' }, 0]; },
});

// Blockquote node that preserves class — used for pull quotes and typed callouts.
// Parses only blockquotes that carry a class attribute so StarterKit's plain
// blockquote still handles the unclassed variant.
const ClassedBlockquote = Node.create({
  name: 'classedBlockquote',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: el => el.getAttribute('class'),
        renderHTML: attrs => (attrs.class ? { class: attrs.class } : {}),
      },
    };
  },
  parseHTML() {
    return [
      { tag: 'blockquote[class]', priority: 1001 },
      {
        tag: 'div',
        priority: 1001,
        getAttrs: (el) => {
          const cls = (el as HTMLElement).getAttribute('class') ?? '';
          return cls.includes('ideas-pq') ? { class: cls } : false;
        },
      },
      {
        tag: 'aside',
        priority: 1001,
        getAttrs: (el) => {
          const cls = (el as HTMLElement).getAttribute('class') ?? '';
          return cls.includes('ideas-pq') ? { class: cls } : false;
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ['blockquote', mergeAttributes(HTMLAttributes), 0];
  },
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => {
        const { state } = this.editor;
        const { $from, empty } = state.selection;
        if (!empty) return false;

        let nodeDepth = -1;
        for (let d = $from.depth; d >= 0; d--) {
          if ($from.node(d).type === this.type) { nodeDepth = d; break; }
        }
        if (nodeDepth === -1) return false;

        // Only exit when cursor is at the very end of the blockquote's content
        if ($from.pos !== $from.end(nodeDepth)) return false;

        const insertPos = $from.after(nodeDepth);
        return this.editor
          .chain()
          .insertContentAt(insertPos, { type: 'paragraph' })
          .focus(insertPos + 1)
          .run();
      },
    };
  },
});

const SectionBreak = Node.create({
  name: 'sectionBreak',
  group: 'block',
  content: 'inline*',
  defining: true,
  parseHTML() { return [{ tag: 'div.ideas-section-break' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ class: 'ideas-section-break' }, HTMLAttributes), 0];
  },
});

// ── Toolbar item arrays ────────────────────────────────────────────────────────
const SEP: Sep = { sep: true };

const SHARED: ToolbarItem[] = [
  { label: '↩', title: 'Undo', action: e => e.chain().focus().undo().run() },
  { label: '↪', title: 'Redo', action: e => e.chain().focus().redo().run() },
  SEP,
  {
    label: 'B', title: 'Bold',
    action: e => e.chain().focus().toggleBold().run(),
    active: e => e.isActive('bold'),
  },
  {
    label: 'I', title: 'Italic',
    action: e => e.chain().focus().toggleItalic().run(),
    active: e => e.isActive('italic'),
  },
  SEP,
  {
    label: 'clr', title: 'Clear formatting',
    action: e => e.chain().focus().clearNodes().unsetAllMarks().run(),
  },
];

const POETRY: ToolbarItem[] = [
  SEP,
  {
    label: '¶', title: 'Stanza break',
    action: e => e.chain().focus().setHorizontalRule().run(),
  },
  {
    label: 'i1', title: 'Indent line',
    action: e => e.chain().focus().toggleMark('indent').run(),
    active: e => e.isActive('indent'),
  },
  {
    label: 'i2', title: 'Deep indent',
    action: e => e.chain().focus().toggleMark('deepIndent').run(),
    active: e => e.isActive('deepIndent'),
  },
  {
    label: 'Iv', title: 'Italic verse',
    action: e => e.chain().focus().toggleItalic().run(),
    active: e => e.isActive('italic'),
  },
  {
    label: '[pn]', title: "Poet's note",
    action: e => e.chain().focus().insertContent({
      type: 'classedBlockquote',
      attrs: { class: 'poets-note' },
      content: [{ type: 'paragraph', content: [{ type: 'text', text: "[Poet's note] " }] }],
    }).run(),
  },
];

const TECH: ToolbarItem[] = [
  SEP,
  {
    label: 'H2', title: 'Heading 2',
    action: e => e.chain().focus().toggleHeading({ level: 2 }).run(),
    active: e => e.isActive('heading', { level: 2 }),
  },
  {
    label: 'H3', title: 'Heading 3',
    action: e => e.chain().focus().toggleHeading({ level: 3 }).run(),
    active: e => e.isActive('heading', { level: 3 }),
  },
  SEP,
  {
    label: '<>', title: 'Code block',
    action: e => e.chain().focus().toggleCodeBlock().run(),
    active: e => e.isActive('codeBlock'),
  },
  {
    label: '`c`', title: 'Inline code',
    action: e => e.chain().focus().toggleCode().run(),
    active: e => e.isActive('code'),
  },
  {
    label: '▎', title: 'Callout',
    action: e => e.chain().focus().insertContent({
      type: 'classedBlockquote',
      attrs: { class: 'tech-callout' },
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Note: ' }] }],
    }).run(),
    active: e => e.isActive('classedBlockquote', { class: 'tech-callout' }),
  },
  SEP,
  {
    label: 'link', title: 'Link / unlink',
    action: e => {
      if (e.isActive('link')) {
        e.chain().focus().unsetLink().run();
      } else {
        const url = window.prompt('URL');
        if (url) e.chain().focus().setLink({ href: url }).run();
      }
    },
    active: e => e.isActive('link'),
  },
];

const IDEAS: ToolbarItem[] = [
  SEP,
  {
    label: 'H2', title: 'Heading 2',
    action: e => e.chain().focus().toggleHeading({ level: 2 }).run(),
    active: e => e.isActive('heading', { level: 2 }),
  },
  {
    label: 'H3', title: 'Heading 3',
    action: e => e.chain().focus().toggleHeading({ level: 3 }).run(),
    active: e => e.isActive('heading', { level: 3 }),
  },
  SEP,
  {
    label: 'PQ→', title: 'Pull quote right',
    action: e => e.chain().focus().insertContent({
      type: 'classedBlockquote',
      attrs: { class: 'ideas-pq ideas-pq--right' },
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pull quote' }] }],
    }).run(),
    active: e => e.isActive('classedBlockquote'),
  },
  {
    label: '←PQ', title: 'Pull quote left',
    action: e => e.chain().focus().insertContent({
      type: 'classedBlockquote',
      attrs: { class: 'ideas-pq ideas-pq--left' },
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pull quote' }] }],
    }).run(),
    active: e => e.isActive('classedBlockquote'),
  },
  {
    label: '⊡PQ', title: 'Pull quote center',
    action: e => e.chain().focus().insertContent({
      type: 'classedBlockquote',
      attrs: { class: 'ideas-pq ideas-pq--centre' },
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pull quote' }] }],
    }).run(),
    active: e => e.isActive('classedBlockquote'),
  },
  SEP,
  {
    label: '§', title: 'Section break',
    action: e => e.chain().focus().insertContent({
      type: 'sectionBreak',
      content: [{ type: 'text', text: 'I.' }],
    }).run(),
    active: e => e.isActive('sectionBreak'),
  },
  SEP,
  {
    label: 'B', title: 'Bold',
    action: e => e.chain().focus().toggleBold().run(),
    active: e => e.isActive('bold'),
  },
  {
    label: 'I', title: 'Italic',
    action: e => e.chain().focus().toggleItalic().run(),
    active: e => e.isActive('italic'),
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function isSep(item: ToolbarItem): item is Sep {
  return 'sep' in item;
}

function getBlockLabel(editor: Editor | null): string {
  if (!editor) return '';
  if (editor.isActive('heading', { level: 1 })) return 'heading 1';
  if (editor.isActive('heading', { level: 2 })) return 'heading 2';
  if (editor.isActive('heading', { level: 3 })) return 'heading 3';
  if (editor.isActive('codeBlock')) return 'code block';
  if (editor.isActive('sectionBreak')) return 'section break';
  if (editor.isActive('classedBlockquote')) return 'blockquote';
  if (editor.isActive('blockquote')) return 'blockquote';
  if (editor.isActive('bulletList')) return 'list';
  if (editor.isActive('orderedList')) return 'ordered list';
  return 'paragraph';
}

const lowlight = createLowlight(common);

function toDatetimeLocal(val?: string | null): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── Component ──────────────────────────────────────────────────────────────────
const DRAFT_KEY = 'editor-content-draft';

export default function PostEditor({ initialData, onSave, onContentChange }: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [type, setType] = useState<'poetry' | 'tech' | 'ideas'>(initialData?.type ?? 'poetry');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') ?? '');
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocal(initialData?.publishedAt));
  const [createdAt, setCreatedAt] = useState(toDatetimeLocal(initialData?.createdAt));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({ openOnClick: false }),
      Typography,
      IndentMark,
      DeepIndentMark,
      ClassedBlockquote,
      SectionBreak,
    ],
    editorProps: {
      attributes: { class: 'tiptap' },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      localStorage.setItem(DRAFT_KEY, html);
      onContentChange?.(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (initialData?.content) {
      editor.commands.setContent(initialData.content);
    } else {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) editor.commands.setContent(draft);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

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
      localStorage.removeItem(DRAFT_KEY);
      setTimeout(() => setSaved(false), 2000);
      if (onSave) onSave(data);
    } catch {
      setError('Network error — could not save');
    } finally {
      setSaving(false);
    }
  };

  const toolbarItems: ToolbarItem[] = [
    ...SHARED,
    ...(type === 'poetry' ? POETRY : type === 'tech' ? TECH : IDEAS),
  ];

  const blockLabel = getBlockLabel(editor);
  const buttonLabel = saving ? 'Saving...' : saved ? 'Saved' : 'Save post';

  const btnBase: CSSProperties = {
    fontFamily: 'var(--font-dm-mono), monospace',
    fontSize: '11px',
    padding: '3px 7px',
    background: 'var(--bg2)',
    border: '0.5px solid var(--bdr)',
    borderRadius: '3px',
    cursor: 'pointer',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
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

        {/* Title */}
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

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {toolbarItems.map((item, i) =>
            isSep(item) ? (
              <div
                key={`sep-${i}`}
                style={{ width: '0.5px', height: '14px', background: 'var(--bdr2)', margin: '0 2px', flexShrink: 0 }}
              />
            ) : (
              <button
                key={`${item.label}-${i}`}
                title={item.title}
                onMouseDown={ev => { ev.preventDefault(); if (editor) item.action(editor); }}
                style={{
                  ...btnBase,
                  color: editor && item.active?.(editor) ? 'var(--teal-mid)' : 'var(--txt2)',
                }}
              >
                {item.label}
              </button>
            )
          )}
        </div>

        {/* Block type label + escape hint */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem', minHeight: '14px' }}>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px', color: 'var(--txt3)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            {blockLabel}
          </span>
          <span style={{
            fontFamily: 'var(--font-dm-mono), monospace',
            fontSize: '10px', color: 'var(--txt4)',
            letterSpacing: '0.04em',
          }}>
            Tip: Ctrl+Enter / Cmd+Enter to exit a block component back to paragraph
          </span>
        </div>

        {/* Editor area */}
        <div style={{ border: '0.5px solid var(--bdr)', borderRadius: '3px', padding: '1rem 1.25rem' }}>
          <EditorContent editor={editor} style={{ minHeight: '500px' }} />
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ width: '260px', minWidth: '260px', paddingLeft: '2rem', borderLeft: '0.5px solid var(--bdr)' }}>

        {/* Type */}
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

        {/* Excerpt */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Excerpt</label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={3}
            style={{ ...fieldStyle, resize: 'vertical' }}
          />
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Tags</label>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="poetry, nature, memory"
            style={fieldStyle}
          />
        </div>

        {/* Published */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '12px', color: 'var(--txt)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} />
            Published
          </label>
        </div>

        {/* Published date */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Published date</label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={e => setPublishedAt(e.target.value)}
            style={fieldStyle}
          />
        </div>

        {/* Created date */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Created date</label>
          <input
            type="datetime-local"
            value={createdAt}
            onChange={e => setCreatedAt(e.target.value)}
            style={fieldStyle}
          />
        </div>

        {/* Save */}
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

        {error && (
          <div style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px', color: 'var(--danger)', marginTop: '0.5rem' }}>
            {error}
          </div>
        )}

        {/* Preview */}
        <button
          onClick={() => {
            if (!editor) return;
            localStorage.setItem('post-preview', JSON.stringify({
              title,
              type,
              content: editor.getHTML(),
              excerpt,
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
