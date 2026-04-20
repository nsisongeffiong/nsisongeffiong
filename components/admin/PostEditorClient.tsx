'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type EditorSwitcherType from './EditorSwitcher';

const EditorSwitcher = dynamic(() => import('./EditorSwitcher'), { ssr: false });

type Props = ComponentProps<typeof EditorSwitcherType>;

export default function PostEditorClient(props: Props) {
  return <EditorSwitcher {...props} />;
}
