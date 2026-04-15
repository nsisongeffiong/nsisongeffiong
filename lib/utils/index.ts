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
