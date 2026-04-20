'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';
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
  postId?: string;
}

type EditorType = 'rich' | 'markdown';

const TABS: { key: EditorType; label: string }[] = [
  { key: 'rich', label: 'Rich text' },
  { key: 'markdown', label: 'Markdown' },
];

const DRAFT_KEY = 'editor-content-draft';
const DRAFT_ID_KEY = 'editor-draft-id';

export default function EditorSwitcher({ initialData, onSave, postId }: Props) {
  const [editorType, setEditorType] = useState<EditorType>('rich');
  const [mounted, setMounted] = useState(false);
  // Tracks latest content from the active editor so we can draft-save before switching
  const latestContent = useRef(initialData?.content ?? '');

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('preferred-editor');
    if (saved === 'rich' || saved === 'markdown') {
      setEditorType(saved);
    }
    // Clear stale draft if it belongs to a different post
    const draftId = localStorage.getItem(DRAFT_ID_KEY);
    if (draftId !== (postId ?? null)) {
      localStorage.removeItem(DRAFT_KEY);
      if (postId !== undefined) {
        localStorage.setItem(DRAFT_ID_KEY, postId);
      } else {
        localStorage.removeItem(DRAFT_ID_KEY);
      }
    }
  }, []);

  function switchEditor(type: EditorType) {
    // Persist current content draft before unmounting the active editor
    localStorage.setItem(DRAFT_KEY, latestContent.current);
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

  const contentChangeHandler = (content: string) => {
    latestContent.current = content;
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
        <PostEditor
          initialData={initialData}
          onSave={onSave}
          onContentChange={contentChangeHandler}
        />
      )}
      {mounted && editorType === 'markdown' && (
        <MarkdownEditor
          initialData={initialData}
          onSave={onSave}
          onContentChange={contentChangeHandler}
        />
      )}
    </div>
  );
}
