import 'dotenv/config'
/**
 * Seed script — inserts placeholder posts from the component demos into Supabase
 *
 * Usage:
 *   npx tsx scripts/seed-placeholder-posts.ts
 */

import { db } from '../lib/db'
import { posts } from '../lib/db/schema'

const placeholderPosts = [
  // ── Poetry ──────────────────────────────────────────────────────────────────
  {
    type: 'poetry' as const,
    title: 'What the delta teaches about forgetting',
    slug: 'what-the-delta-teaches-about-forgetting',
    content: `<p>The river does not mourn<br>the banks it has abandoned—<br>it is already elsewhere,<br>already becoming<br>&nbsp;&nbsp;something the sea will name.</p>

<p>I have stood at three deltas.<br>Each one taught me<br>the same thing<br>&nbsp;&nbsp;in a different mouth.</p>

<p>Forgetting is not failure.<br>It is the water finding<br>a lower place to go,<br>&nbsp;&nbsp;a softer way through.</p>

<p>What I have lost<br>is not behind me—<br>it is distributed,<br>&nbsp;&nbsp;given to the silt,<br>&nbsp;&nbsp;&nbsp;&nbsp;the estuarine grass,<br>&nbsp;&nbsp;the slow birds<br>who do not keep<br>&nbsp;&nbsp;what they find.</p>

<p>The delta does not ask<br>where it is going.<br>It only spreads,<br>&nbsp;&nbsp;and spreads,<br>&nbsp;&nbsp;&nbsp;&nbsp;and thins<br>into the open.</p>`,
    excerpt: 'On water, impermanence, and the places that hold us even as we leave them.',
    tags: ['nature & place'],
    published: true,
    publishedAt: new Date('2026-04-10'),
    metadata: {
      category: 'Nature & place',
      poetNote: 'Written after returning to the Niger Delta for the first time in seven years. The geography kept insisting on becoming metaphor — I eventually stopped resisting it.',
      legacyDisqus: false,
    },
  },
  {
    type: 'poetry' as const,
    title: 'Harmattan syntax',
    slug: 'harmattan-syntax',
    content: `<p>Dust as grammar.<br>The dry season arrives<br>with its own punctuation—<br>a comma between<br>what was green<br>and what is not.</p>

<p>The body learns to read it:<br>cracked lips as parentheses,<br>the itch behind the eyes<br>an ellipsis,<br>waiting.</p>`,
    excerpt: 'Dust as grammar. The dry season as a kind of punctuation the body cannot refuse.',
    tags: ['nature & place', 'language & form'],
    published: true,
    publishedAt: new Date('2026-04-10'),
    metadata: {
      category: 'Nature & place',
      poetNote: null,
      legacyDisqus: false,
    },
  },
  {
    type: 'poetry' as const,
    title: "My grandmother's English",
    slug: 'my-grandmothers-english',
    content: `<p>She borrowed it the way<br>you borrow a coat in a country<br>that does not know your cold—<br>grateful, but always aware<br>of the wrong weight on your shoulders.</p>

<p>What survives translation<br>is not the word<br>but the pressure behind it,<br>the place in the throat<br>where meaning lives<br>before it becomes language.</p>`,
    excerpt: 'A language borrowed and returned transformed. What survives translation and what is made new.',
    tags: ['language & form', 'memory'],
    published: true,
    publishedAt: new Date('2026-03-28'),
    metadata: {
      category: 'Language & form',
      poetNote: null,
      legacyDisqus: false,
    },
  },

  // ── Tech ────────────────────────────────────────────────────────────────────
  {
    type: 'tech' as const,
    title: 'orchestrate.py — a deep dive into the pipeline runner',
    slug: 'orchestrate-py-deep-dive',
    content: `<h2>The stage routing model</h2>
<p>When I built ai-workspace-scripts, the hardest part wasn't getting three AI models to produce good output — it was making the whole thing reliable. A pipeline that fails silently or produces inconsistent output is worse than no pipeline at all.</p>

<h2>Why commit per stage</h2>
<p>Each stage commits its output to the feature branch before the next stage runs. This means you can resume from any stage if one fails — you're not re-running work that already succeeded.</p>

<h2>Resuming failures</h2>
<p>The <code>--from-stage N</code> flag lets you resume from any stage. Stage 1's output is already committed, so Stage 3 and 4 can run against it without re-running the expensive Stage 1 call.</p>

<h2>What I'd change</h2>
<p>Git tags per stage rather than just commits would make resuming cleaner. Instead of counting back from HEAD, you'd checkout the tag directly.</p>`,
    excerpt: 'Stage management, git branching strategy, and making multi-model pipelines resumable.',
    tags: ['AI/ML', 'devtools', 'Python'],
    published: true,
    publishedAt: new Date('2026-04-07'),
    metadata: {
      readTime: 12,
      featured: true,
      codeLanguages: ['python', 'bash'],
      legacyDisqus: false,
    },
  },
  {
    type: 'tech' as const,
    title: 'Why your AI context window is a state management problem',
    slug: 'ai-context-window-state-management',
    content: `<h2>The problem</h2>
<p>Agentic AI systems have no memory between completions. Every API call starts fresh. If you're building a multi-step pipeline, you have to encode all relevant state into the context on every call — or you lose it.</p>

<h2>What this means in practice</h2>
<p>It means your context window is not just a conversation history. It's your entire working memory. Everything the agent needs to know — what it has already done, what files exist, what decisions were made — has to live in that window.</p>

<h2>Solutions</h2>
<p>Git commits as state checkpoints. File system as external memory. Structured JSON state objects passed between stages. The key insight is to treat the context window like a function parameter, not a global store.</p>`,
    excerpt: 'Agentic systems have no memory between completions. How to encode full state without bloating context.',
    tags: ['AI/ML', 'systems'],
    published: true,
    publishedAt: new Date('2026-03-22'),
    metadata: {
      readTime: 8,
      featured: false,
      codeLanguages: ['typescript'],
      legacyDisqus: false,
    },
  },

  // ── Ideas ────────────────────────────────────────────────────────────────────
  {
    type: 'ideas' as const,
    title: 'Why public sector AI adoption keeps failing — and who benefits from the story we tell about it',
    slug: 'why-public-sector-ai-adoption-keeps-failing',
    content: `<p>In 2023, a mid-sized European municipality deployed an AI triage system for its social services department. By early 2025 it had been quietly retired — not because of technical failure, but because the vendor had defined success metrics that diverged steadily from what social workers actually needed.</p>

<p>This story is not unusual. Across healthcare, education, and benefits administration, AI deployments that arrived with fanfare have been wound down while stakeholders wait for contracts to expire.</p>

<h2>The procurement structure creates the failure mode</h2>
<p>The public body lacks technical capacity to evaluate what it is buying — and the procurement process is not designed to build that capacity. This creates a structural asymmetry that precedes any question of institutional culture or risk appetite.</p>

<h2>Who benefits from the "too slow" narrative</h2>
<p>The framing of public institutions as congenitally unable to adopt technology performs specific work. It positions the solution as more private sector involvement, faster procurement, reduced oversight — precisely the conditions that created the failure mode in the first place.</p>`,
    excerpt: 'Governments are adopting AI tools at pace, yet most deployments quietly collapse within 18 months. The dominant explanation — institutional slowness — obscures something more structural.',
    tags: ['AI & society', 'public policy'],
    published: true,
    publishedAt: new Date('2026-04-02'),
    metadata: {
      kicker: 'Technology & governance',
      volume: 'Vol. I',
      featured: true,
      legacyDisqus: false,
    },
  },
  {
    type: 'ideas' as const,
    title: 'Digital public infrastructure and the question of who owns it',
    slug: 'digital-public-infrastructure-who-owns-it',
    content: `<p>When states build digital identity systems, payment rails, and data registries, a question that rarely appears in the procurement documents quietly determines everything: who owns the infrastructure?</p>

<p>Ownership is not always obvious. A government may commission and fund a system, operate it through a public agency, and still find that the vendor retains effective control — through proprietary formats, single-source maintenance contracts, or data terms that prevent migration.</p>

<h2>The lock-in problem</h2>
<p>Digital infrastructure lock-in is qualitatively different from other forms of vendor dependence. When a state's identity layer or payment system becomes non-portable, entire populations become hostage to vendor relationships that were never subject to democratic deliberation.</p>`,
    excerpt: 'When states build digital identity systems and payment rails — who controls the infrastructure?',
    tags: ['digital rights', 'public policy'],
    published: true,
    publishedAt: new Date('2026-03-28'),
    metadata: {
      kicker: 'Digital infrastructure',
      volume: 'Vol. I',
      featured: false,
      legacyDisqus: false,
    },
  },
]

async function seed() {
  console.log(`Seeding ${placeholderPosts.length} placeholder posts...`)

  let inserted = 0
  let skipped = 0

  for (const post of placeholderPosts) {
    try {
      await db.insert(posts).values(post)
      console.log(`  ✓ Inserted: "${post.title}"`)
      inserted++
    } catch (error: any) {
      if (error?.code === '23505') {
        console.log(`  ↷ Already exists: "${post.title}" — skipping`)
        skipped++
      } else {
        console.error(`  ✗ Failed: "${post.title}"`, error.message)
      }
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped`)
  process.exit(0)
}

seed()
