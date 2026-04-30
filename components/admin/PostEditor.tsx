'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';
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
  topicIds?: string[];
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
// Poetry stanza — block node holding inline content, rendered as <div class="stanza">.
const StanzaNode = Node.create({
  name: 'stanza',
  group: 'block',
  content: '(lineNode | indentLineNode | deepIndentLineNode)+',
  defining: true,
  parseHTML() { return [{ tag: 'div.stanza' }]; },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ class: 'stanza' }, HTMLAttributes), 0];
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { state } = this.editor;
        const { $from, empty } = state.selection;
        if (!empty) return false;
        let nodeDepth = -1;
        for (let d = $from.depth; d >= 0; d--) {
          if ($from.node(d).type === this.type) { nodeDepth = d; break; }
        }
        if (nodeDepth === -1) return false;
        const insertPos = $from.after(nodeDepth);
        return this.editor
          .chain()
          .insertContentAt(insertPos, { type: 'stanza', content: [{ type: 'lineNode', content: [] }] })
          .focus(insertPos + 1)
          .run();
      },
    };
  },
});

// Poetry line nodes — block nodes inside a stanza, each renders as a <span class="line">.
const LineNode = Node.create({
  name: 'lineNode',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{
      tag: 'span.line',
      getAttrs: (el) =>
        !(el as HTMLElement).classList.contains('i1') && !(el as HTMLElement).classList.contains('i2') ? {} : false,
    }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ class: 'line' }, HTMLAttributes), 0];
  },
});

const IndentLineNode = Node.create({
  name: 'indentLineNode',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'span.line.i1' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ class: 'line i1' }, HTMLAttributes), 0];
  },
});

const DeepIndentLineNode = Node.create({
  name: 'deepIndentLineNode',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{
      tag: 'span.line.i2',
      getAttrs: (el) =>
        (el as HTMLElement).classList.contains('line') && (el as HTMLElement).classList.contains('i2') ? {} : false,
    }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ class: 'line i2' }, HTMLAttributes), 0];
  },
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
        parseHTML: el => (el as HTMLElement).getAttribute('class'),
        renderHTML: attrs => (attrs.class ? { class: attrs.class } : {}),
      },
    };
  },
  parseHTML() {
    return [
      { tag: 'blockquote[class]', priority: 1001 },
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

const POETRY_TOOLBAR: ToolbarItem[] = [
  {
    label: '+stanza', title: 'Insert stanza',
    action: e => e.chain().focus().insertContent({ type: 'stanza', content: [{ type: 'lineNode', content: [] }] }).run(),
    active: e => e.isActive('stanza'),
  },
  {
    label: 'line', title: 'Insert line',
    action: e => e.chain().focus().insertContent({ type: 'lineNode', content: [] }).run(),
    active: e => e.isActive('lineNode'),
  },
  {
    label: 'i1', title: 'Insert indent line',
    action: e => e.chain().focus().insertContent({ type: 'indentLineNode', content: [] }).run(),
    active: e => e.isActive('indentLineNode'),
  },
  {
    label: 'i2', title: 'Insert deep indent line',
    action: e => e.chain().focus().insertContent({ type: 'deepIndentLineNode', content: [] }).run(),
    active: e => e.isActive('deepIndentLineNode'),
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
  {
    label: 'clr', title: 'Clear formatting',
    action: e => e.chain().focus().clearNodes().unsetAllMarks().run(),
  },
  SEP,
  { label: '↩', title: 'Undo', action: e => e.chain().focus().undo().run() },
  { label: '↪', title: 'Redo', action: e => e.chain().focus().redo().run() },
];

const TECH_TOOLBAR: ToolbarItem[] = [
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
    label: '`', title: 'Inline code',
    action: e => e.chain().focus().toggleCode().run(),
    active: e => e.isActive('code'),
  },
  {
    label: '"', title: 'Blockquote',
    action: e => e.chain().focus().toggleBlockquote().run(),
    active: e => e.isActive('blockquote'),
  },
  {
    label: 'HR', title: 'Horizontal rule',
    action: e => e.chain().focus().setHorizontalRule().run(),
  },
];

const IDEAS_TOOLBAR: ToolbarItem[] = [
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
      attrs: { class: 'ideas-pq ideas-pq--center' },
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
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [type, setType] = useState<'poetry' | 'tech' | 'ideas'>(initialData?.type ?? 'poetry');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? '');
  const [tags, setTags] = useState(initialData?.tags?.join(', ') ?? '');
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocal(initialData?.publishedAt));
  const [createdAt, setCreatedAt] = useState(toDatetimeLocal(initialData?.createdAt));
  const [poetNote, setPoetNote] = useState((initialData?.metadata as any)?.poetNote ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Topics
  const [availableTopics, setAvailableTopics] = useState<{ id: string; label: string }[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(initialData?.topicIds ?? []);

  const isFirstRender = useRef(true);

  // Fetch available topics whenever post type changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      setSelectedTopicIds([]);
    }
    fetch(`/api/topics?section=${type}`)
      .then(r => r.json())
      .then(data => setAvailableTopics(Array.isArray(data) ? data : []))
      .catch(() => setAvailableTopics([]))
  }, [type]);
  const typeRef = useRef(type);
  useEffect(() => { typeRef.current = type; }, [type]);
  useEffect(() => {
    setPoetNote((initialData?.metadata as any)?.poetNote ?? '');
  }, [initialData]);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({ openOnClick: false }),
      Typography,
      StanzaNode,
      LineNode,
      IndentLineNode,
      DeepIndentLineNode,
      ClassedBlockquote,
      SectionBreak,
    ],
    editorProps: {
      attributes: { class: 'tiptap' },
      handlePaste: (view, event) => {
        if (typeRef.current !== 'poetry') return false;
        const text = event.clipboardData?.getData('text/plain');
        if (!text) return false;

        const { schema } = view.state;
        const stanzaType = schema.nodes.stanza;
        const lineNodeType = schema.nodes.lineNode;
        const indentLineNodeType = schema.nodes.indentLineNode;
        const deepIndentLineNodeType = schema.nodes.deepIndentLineNode;
        if (!stanzaType || !lineNodeType || !indentLineNodeType || !deepIndentLineNodeType) return false;

        const stanzaBlocks = text.split(/\n\n+/);
        const nodes = stanzaBlocks.map(stanzaText => {
          const lineNodes = stanzaText.split('\n').map(line => {
            let nodeType = lineNodeType;
            let content = line;
            if (/^ {4}/.test(line) || /^\t\t/.test(line)) {
              nodeType = deepIndentLineNodeType;
              content = line.replace(/^ {4,}|^\t{2,}/, '');
            } else if (/^ {2}/.test(line) || /^\t/.test(line)) {
              nodeType = indentLineNodeType;
              content = line.replace(/^ {2,}|^\t/, '');
            }
            const textNode = content ? [schema.text(content)] : [];
            return nodeType.create(null, textNode);
          });
          return stanzaType.create(null, lineNodes);
        });

        const { tr, selection } = view.state;
        view.dispatch(tr.replaceWith(selection.from, selection.to, nodes));
        return true;
      },
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
      topicIds: selectedTopicIds,
      published,
      publishedAt: publishedAt || null,
      createdAt: createdAt || null,
      metadata: { ...(initialData?.metadata ?? {}), poetNote: poetNote || null },
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
      localStorage.removeItem('editor-draft-id');
      setTimeout(() => setSaved(false), 2000);
      if (onSave) onSave(data);
    } catch {
      setError('Network error — could not save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/posts/${initialData.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Failed to delete post');
        return;
      }
      router.push('/admin/posts');
    } catch {
      setError('Network error — could not delete');
    }
  };

  const toolbarItems: ToolbarItem[] =
    type === 'poetry' ? POETRY_TOOLBAR : type === 'tech' ? TECH_TOOLBAR : IDEAS_TOOLBAR;

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

        {/* Topics */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Topics</label>
          {availableTopics.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px', color: 'var(--txt3)' }}>
              No topics for this section yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {availableTopics.map(topic => {
                const selected = selectedTopicIds.includes(topic.id)
                return (
                  <label key={topic.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    fontFamily: 'var(--font-dm-mono), monospace', fontSize: '11px',
                    color: selected ? 'var(--txt)' : 'var(--txt2)', cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => setSelectedTopicIds(prev =>
                        selected ? prev.filter(id => id !== topic.id) : [...prev, topic.id]
                      )}
                    />
                    {topic.label}
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {/* Poet's note */}
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

        {initialData?.id && (
          <button
            onClick={handleDelete}
            style={{
              width: '100%',
              fontFamily: 'var(--font-dm-mono), monospace',
              fontSize: '11px',
              textTransform: 'uppercase',
              background: 'none',
              color: 'var(--danger)',
              border: '0.5px solid var(--danger)',
              padding: '0.75rem',
              borderRadius: '3px',
              cursor: 'pointer',
              marginTop: '0.75rem',
            }}
          >
            Delete post
          </button>
        )}
      </div>
    </div>
  );
}
