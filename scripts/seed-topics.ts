/**
 * seed-topics.ts
 *
 * Seeds the topics, topic_tags, and post_topics tables from existing content.
 * Safe to run multiple times — uses upsert / ignore-on-conflict.
 *
 * Run: npx tsx --env-file=.env scripts/seed-topics.ts
 */

import { db } from '../lib/db'
import { topics, topicTags, postTopics, posts } from '../lib/db/schema'
import { eq, inArray, sql } from 'drizzle-orm'

// ─── Taxonomy definition ──────────────────────────────────────────────────────

const TAXONOMY: {
  section: 'poetry' | 'tech' | 'ideas'
  label: string
  slug: string
  description: string
  position: number
  tags: string[]        // lowercased — must match post tag values (case-insensitive)
}[] = [

  // ── Tech ──────────────────────────────────────────────────────────────────

  {
    section: 'tech', label: 'AI/ML', slug: 'tech-ai-ml', position: 1,
    description: 'Machine learning, large language models, AI systems and tooling.',
    tags: ['ai/ml', 'ai & society'],
  },
  {
    section: 'tech', label: 'Systems', slug: 'tech-systems', position: 2,
    description: 'Operating systems, devops, infrastructure and architecture.',
    tags: ['systems', 'architecture', 'devops', 'linux', 'ubuntu', 'docker',
           'kubernetes', 'terraform', 'ansible'],
  },
  {
    section: 'tech', label: 'DevTools', slug: 'tech-devtools', position: 3,
    description: 'Developer tooling, scripting, and workflow automation.',
    tags: ['devtools', 'python', 'bash', 'automation'],
  },
  {
    section: 'tech', label: 'Cloud', slug: 'tech-cloud', position: 4,
    description: 'Cloud platforms and managed infrastructure.',
    tags: ['aws', 'azure', 'gcp'],
  },

  // ── Ideas ─────────────────────────────────────────────────────────────────

  {
    section: 'ideas', label: 'Technology', slug: 'ideas-technology', position: 1,
    description: 'Essays on AI, digital rights, and the politics of tech.',
    tags: ['ai & society', 'technology', 'digital rights'],
  },
  {
    section: 'ideas', label: 'Policy', slug: 'ideas-policy', position: 2,
    description: 'Public policy, governance, and institutional design.',
    tags: ['public policy', 'governance'],
  },
  {
    section: 'ideas', label: 'Economics', slug: 'ideas-economics', position: 3,
    description: 'Political economy, industrial policy, and economic discourse.',
    tags: ['political economy', 'economics'],
  },
  {
    section: 'ideas', label: 'Nigeria', slug: 'ideas-nigeria', position: 4,
    description: 'Nigerian politics, democracy, and civil society.',
    tags: ['politics', 'democracy', 'elections', 'leadership', 'corruption',
           'security', 'society', 'nigeria'],
  },
  {
    section: 'ideas', label: 'History', slug: 'ideas-history', position: 5,
    description: 'Historical memory, state power, and long-run political change.',
    tags: ['history'],
  },
  {
    section: 'ideas', label: 'Media', slug: 'ideas-media', position: 6,
    description: 'Attention economy, journalism, and information ecosystems.',
    tags: ['media'],
  },

  // ── Poetry ────────────────────────────────────────────────────────────────

  {
    section: 'poetry', label: 'Nature & place', slug: 'poetry-nature-place', position: 1,
    description: 'Landscape, geography, and the natural world.',
    tags: ['nature & place', 'nature', 'place'],
  },
  {
    section: 'poetry', label: 'Memory', slug: 'poetry-memory', position: 2,
    description: 'Memory, language, and inherited forms.',
    tags: ['memory', 'language & form'],
  },
  {
    section: 'poetry', label: 'Lyric', slug: 'poetry-lyric', position: 3,
    description: 'Pure lyric — song, feeling, and interior life.',
    tags: ['lyric'],
  },
  {
    section: 'poetry', label: 'Grief', slug: 'poetry-grief', position: 4,
    description: 'Grief, loss, and elegy.',
    tags: ['grief', 'loss'],
  },
]

// ─── Helper ───────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('── Seeding topics ───────────────────────────────────────────')

  for (const t of TAXONOMY) {
    // Upsert topic
    const [topic] = await db
      .insert(topics)
      .values({
        label:       t.label,
        slug:        t.slug,
        section:     t.section,
        description: t.description,
        position:    String(t.position),
      })
      .onConflictDoUpdate({
        target: topics.slug,
        set: {
          label:       t.label,
          section:     t.section,
          description: t.description,
          position:    String(t.position),
        },
      })
      .returning()

    console.log(`  [${t.section}] "${t.label}" → id ${topic.id}`)

    // Upsert topic_tags
    for (const tag of t.tags) {
      await db
        .insert(topicTags)
        .values({ topicId: topic.id, tag: tag.toLowerCase() })
        .onConflictDoNothing()
    }

    // Assign to matching posts via post_topics
    // Match: any post whose tags array contains any of this topic's tags (case-insensitive)
    const allPosts = await db
      .select({ id: posts.id, tags: posts.tags, type: posts.type })
      .from(posts)
      .where(eq(posts.type, t.section))

    const matchingPostIds = allPosts
      .filter(p => (p.tags ?? []).some(pt =>
        t.tags.includes(pt.toLowerCase())
      ))
      .map(p => p.id)

    if (matchingPostIds.length > 0) {
      await db
        .insert(postTopics)
        .values(matchingPostIds.map(postId => ({ postId, topicId: topic.id })))
        .onConflictDoNothing()
      console.log(`    → assigned to ${matchingPostIds.length} post(s)`)
    } else {
      console.log(`    → no matching posts yet`)
    }
  }

  console.log('\n── Done ─────────────────────────────────────────────────────')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
