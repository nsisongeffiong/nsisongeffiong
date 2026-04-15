import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const postTypeEnum = pgEnum('post_type', [
  'poetry',
  'tech',
  'ideas',
])

export const commentStatusEnum = pgEnum('comment_status', [
  'pending',
  'approved',
  'rejected',
])

// ─── Posts ────────────────────────────────────────────────────────────────────

export const posts = pgTable('posts', {
  id:          uuid('id').defaultRandom().primaryKey(),
  type:        postTypeEnum('type').notNull(),
  title:       text('title').notNull(),
  slug:        text('slug').notNull().unique(),
  content:     text('content').notNull().default(''),
  excerpt:     text('excerpt'),
  tags:        text('tags').array().default([]),
  published:   boolean('published').notNull().default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),

  /**
   * metadata jsonb — type-specific fields
   *
   * Poetry:
   *   { category: "Nature & place", poetNote: "...", legacyDisqus: true }
   *
   * Tech:
   *   { readTime: 12, featured: true, codeLanguages: ["python"], legacyDisqus: false }
   *
   * Ideas:
   *   { kicker: "Technology & governance", volume: "Vol. I", featured: true, legacyDisqus: false }
   *
   * legacyDisqus: true  → render Disqus embed (existing pre-migration posts)
   * legacyDisqus: false → render native comments (all new posts)
   */
  metadata: jsonb('metadata').$type<PostMetadata>().default({}),
})

// ─── Comments (native — for new posts) ───────────────────────────────────────

export const comments = pgTable('comments', {
  id:          uuid('id').defaultRandom().primaryKey(),
  postId:      uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  parentId:    uuid('parent_id'),              // null = top-level, uuid = reply
  authorName:  text('author_name').notNull(),
  authorEmail: text('author_email').notNull(), // stored but never displayed publicly
  body:        text('body').notNull(),
  status:      commentStatusEnum('status').notNull().default('pending'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const postsRelations = relations(posts, ({ many }) => ({
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post:    one(posts, { fields: [comments.postId], references: [posts.id] }),
  parent:  one(comments, { fields: [comments.parentId], references: [comments.id] }),
  replies: many(comments),
}))

// ─── Types ────────────────────────────────────────────────────────────────────

export type Post    = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert

export type Comment    = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert

export type PostMetadata = PoetryMetadata | TechMetadata | IdeasMetadata

export type PoetryMetadata = {
  category?:    string
  poetNote?:    string
  legacyDisqus?: boolean
}

export type TechMetadata = {
  readTime?:      number
  featured?:      boolean
  codeLanguages?: string[]
  legacyDisqus?:  boolean
}

export type IdeasMetadata = {
  kicker?:       string
  volume?:       string
  featured?:     boolean
  legacyDisqus?: boolean
}
