import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import slugify from 'slugify'

// ─── Tailwind class merging ────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Slug generation ──────────────────────────────────────────────────────────
export function generateSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  })
}

// ─── Date formatting ──────────────────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMMM d, yyyy')
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

// ─── Read time estimate ───────────────────────────────────────────────────────
export function estimateReadTime(content: string): number {
  const trimmed = content.trim()
  if (!trimmed) return 0

  const wordsPerMinute = 200
  const wordCount = trimmed.split(/\s+/).length
  return Math.max(1, Math.round(wordCount / wordsPerMinute))
}

// ─── Truncate text ────────────────────────────────────────────────────────────
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

// ─── Absolute URL ─────────────────────────────────────────────────────────────
export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nsisongeffiong.com'
  return `${base}${path}`
}

// ─── Tweet embed markers ──────────────────────────────────────────────────────
// Authors drop `<!--tweet:https://x.com/user/status/ID-->` on its own line in
// post HTML to mark where an X/Twitter embed should render. We split the body
// on that marker so plain HTML and tweet embeds can be rendered as siblings.
export type ContentSegment = { html?: string; tweetUrl?: string }

export function splitTweetSegments(content: string): ContentSegment[] {
  const marker = /<!--tweet:(https?:\/\/[^\s>]+?)-->/g
  const segments: ContentSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = marker.exec(content)) !== null) {
    const html = content.slice(lastIndex, match.index)
    if (html.trim()) segments.push({ html })
    segments.push({ tweetUrl: match[1] })
    lastIndex = marker.lastIndex
  }

  const tail = content.slice(lastIndex)
  if (tail.trim()) segments.push({ html: tail })

  return segments
}
