import {
  pgTable,
  serial,
  uuid,
  text,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
  primaryKey,
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

// ─── Topics ───────────────────────────────────────────────────────────────────
// Admin-managed top-level filter categories, scoped per section.
// Tags are stored as free text on posts; topics group them into display buckets.

export const topics = pgTable('topics', {
  id:          uuid('id').defaultRandom().primaryKey(),
  label:       text('label').notNull(),              // "Technology", "Nigeria"
  slug:        text('slug').notNull().unique(),       // "technology", "nigeria"
  section:     postTypeEnum('section').notNull(),     // 'poetry' | 'tech' | 'ideas'
  description: text('description'),                  // admin-only note
  position:    text('position').notNull().default('0'), // display order (stored as text for simplicity, sort numerically)
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Many-to-many: topics ↔ raw tag strings
// A tag can belong to multiple topics; a topic covers multiple tags.
export const topicTags = pgTable('topic_tags', {
  id:      uuid('id').defaultRandom().primaryKey(),
  topicId: uuid('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
  tag:     text('tag').notNull(),                    // lowercased, matches posts.tags values
},
(t) => [{ name: 'topic_tags_topic_tag_unique', columns: [t.topicId, t.tag] }]
)

// Many-to-many: posts ↔ topics (explicit assignment in editor)
export const postTopics = pgTable('post_topics', {
  postId:  uuid('post_id').notNull().references(() => posts.id,   { onDelete: 'cascade' }),
  topicId: uuid('topic_id').notNull().references(() => topics.id, { onDelete: 'cascade' }),
},
(t) => [{ name: 'post_topics_pkey', columns: [t.postId, t.topicId] }]
)

// ─── Relations ────────────────────────────────────────────────────────────────

export const postsRelations = relations(posts, ({ many }) => ({
  comments:    many(comments),
  postTopics:  many(postTopics),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post:    one(posts, { fields: [comments.postId], references: [posts.id] }),
  parent:  one(comments, { fields: [comments.parentId], references: [comments.id] }),
  replies: many(comments),
}))

export const topicsRelations = relations(topics, ({ many }) => ({
  topicTags:  many(topicTags),
  postTopics: many(postTopics),
}))

export const topicTagsRelations = relations(topicTags, ({ one }) => ({
  topic: one(topics, { fields: [topicTags.topicId], references: [topics.id] }),
}))

export const postTopicsRelations = relations(postTopics, ({ one }) => ({
  post:  one(posts,   { fields: [postTopics.postId],  references: [posts.id] }),
  topic: one(topics,  { fields: [postTopics.topicId], references: [topics.id] }),
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

// ── about_content ─────────────────────────────────────────────────────────────
// Single-row config table (id always = 1).
// nowItems  — JSON array of "Now" strings shown on the about page
// bookList  — JSON object keyed 1–12 (month), value = { title, author }[]
//             The about page filters to the current calendar quarter at render time.
export const aboutContent = pgTable('about_content', {
  id:        serial('id').primaryKey(),
  nowItems:  jsonb('now_items').$type<string[]>().notNull().default([]),
  bookList:  jsonb('book_list').$type<Record<string, { title: string; author: string }[]>>().notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type AboutContent = typeof aboutContent.$inferSelect

// ─── Topic types ──────────────────────────────────────────────────────────────

export type Topic      = typeof topics.$inferSelect
export type NewTopic   = typeof topics.$inferInsert
export type TopicTag   = typeof topicTags.$inferSelect
export type PostTopic  = typeof postTopics.$inferSelect
