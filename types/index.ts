import type { Post, Comment, PostMetadata } from '@/lib/db/schema'

// ─── Re-export DB types ───────────────────────────────────────────────────────
export type { Post, Comment, PostMetadata }

// ─── Post type literals ───────────────────────────────────────────────────────
export type PostType = 'poetry' | 'tech' | 'ideas'

// ─── Post with computed fields ────────────────────────────────────────────────
export type PostWithMeta = Post & {
  readTime?: number
  commentCount?: number
}

// ─── Comment status ───────────────────────────────────────────────────────────
export type CommentStatus = 'pending' | 'approved' | 'rejected'

// ─── Comment submission form data ────────────────────────────────────────────
export type CommentFormData = {
  authorName: string
  authorEmail: string
  body: string
  website?: string        // honeypot — must be empty
  turnstileToken: string  // Cloudflare Turnstile
}

// ─── API response shapes ──────────────────────────────────────────────────────
export type ApiSuccess<T> = {
  success: true
  data: T
}

export type ApiError = {
  success: false
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Navigation ───────────────────────────────────────────────────────────────
export type NavLink = {
  label: string
  href: string
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Poetry', href: '/poetry' },
  { label: 'Tech',   href: '/tech'   },
  { label: 'Ideas',  href: '/ideas'  },
  { label: 'About',  href: '/about'  },
]

// ─── Section config ───────────────────────────────────────────────────────────
export type SectionConfig = {
  type:       PostType
  label:      string
  href:       string
  accentColor: string
}

export const SECTIONS: SectionConfig[] = [
  { type: 'poetry', label: 'Poetry', href: '/poetry', accentColor: '#534AB7' },
  { type: 'tech',   label: 'Tech',   href: '/tech',   accentColor: '#1D9E75' },
  { type: 'ideas',  label: 'Ideas',  href: '/ideas',  accentColor: '#BA7517' },
]
