'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type PostEditorType from './PostEditor';

const PostEditor = dynamic(() => import('./PostEditor'), { ssr: false });

type Props = ComponentProps<typeof PostEditorType>;

export default function PostEditorClient(props: Props) {
  return <PostEditor {...props} />;
}
