/**
 * Seed script — inserts "AI is breaking the pipeline, not replacing software engineers"
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/seed-ai-breaking-pipeline.ts
 */

import { db } from '../lib/db'
import { posts } from '../lib/db/schema'

const post = {
  type: 'ideas' as const,
  title: 'AI is breaking the pipeline, not replacing software engineers',
  slug: 'ai-breaking-pipeline-not-replacing-engineers',
  excerpt: "AI isn't going to kill software engineering, but it is closing the door every senior engineer once walked through as a junior, and the industry hasn't noticed how thin the pipeline has become.",
  tags: ['AI', 'software engineering', 'hiring', 'tech industry'],
  published: true,
  publishedAt: new Date('2026-04-27'),
  metadata: {
    kicker: 'Essay',
    readTime: 7,
    deck: "AI isn't going to kill software engineering. But it is quietly closing the door that every senior engineer once walked through as a junior.",
    pullQuote: "The tasks were the training. And now there's a generation of seniors who went through that formation and a generation of juniors who won't get the chance to.",
    legacyDisqus: false,
  },
  content: `<p>Software engineers are not being replaced. Something quieter is already in motion: AI is eating the bottom of the pipeline while the top stays intact.</p>

<p>Writing code is maybe 30% of the job. The rest is understanding what to build, why to build it, whether the thing you just built will collapse under load three months from now, how it fits into the system that already exists, and what the tradeoffs are between five approaches none of which are obviously right. That work requires judgment built from experience. It requires knowing what you don't know. It requires having been burned enough times to recognize the smell of a bad architecture before it's too late. The models that exist today, including the ones Anthropic builds, the ones I use, are extraordinary at pattern completion. They are not reasoning about your system. They don't know your constraints. They have no skin in the game when the deploy breaks at 2am.</p>

<p>AI is not replacing senior engineers. It's amplifying them. A senior engineer with Claude or Copilot is faster, broader, more dangerous in the best sense. She can draft infrastructure, scaffold a service, write tests, and review a PR in a morning. The leverage is real. Companies feel it, and so they do the rational thing: they stop hiring the people they no longer think they need.</p>

<p>A Harvard study examined 285,000 U.S. firms and 62 million workers. When companies adopted generative AI, junior employment dropped 9 to 10 percent within six quarters. Senior employment barely moved. Employment for software developers aged 22 to 25 has fallen nearly 20% from its peak in late 2022. Entry-level postings dropped 60% between 2022 and 2024. Salesforce halted junior hiring for 2025. Google and Meta cut new grad offers by half. A junior costs $80,000 to $120,000 a year and needs six to twelve months before contributing meaningfully. A Copilot license costs ten dollars a month. The spreadsheet math is not complicated.</p>

<blockquote class="ideas-pq ideas-pq--left"><p>The tasks were the training. And now there's a generation of seniors who went through that formation and a generation of juniors who won't get the chance to.</p></blockquote>

<p>What the spreadsheet doesn't capture is the work those junior years were actually doing. Not the output. The formation. You debug someone else's CRUD implementation and you learn how data flows through a system. You spend three months writing boilerplate and develop an intuition for when the pattern is wrong. You get assigned the documentation nobody wants and discover, slowly, that you don't understand the system as well as you thought you did. The gap between what you know and what you need to know is where engineers are made. AI eliminated the tasks, but the tasks were never really the point. The tasks were the training. And now there's a generation of seniors who went through that formation and a generation of juniors who won't get the chance to.</p>

<p>The same tool that makes seniors more productive also makes them less available to teach. A 2025 paper on AI-assisted programming found that while productivity rises, core developers reviewed more code after AI adoption and saw their own original output drop by 19%. Seniors are spending more time validating AI-generated code and less time mentoring anyone. The pipeline narrows from both ends: fewer juniors entering, less mentorship available for the ones who do. It doesn't break overnight. It narrows every year until nobody notices how thin it became.</p>

<div class="ideas-section-break">·</div>

<p>Klarna is the parable. The company slashed its workforce from 5,500 to 3,400, declared AI could perform all human jobs, and celebrated the savings. By mid-2025 it was scrambling to rehire. Customer satisfaction had tanked. Engineers were being pulled from specialized roles to answer customer service calls. The CEO admitted: "We focused too much on efficiency and cost. The result was lower quality, and that's not sustainable." Duolingo went "AI-first" in April 2025 and reversed it a year later. The pattern holds across companies that moved fast: the engineers didn't go away, the work didn't go away, what went away was the fantasy that you could delete the humans and keep the output. Research from Orgvue and Forrester found that 55% of companies that executed AI-driven layoffs now regret the decision. The gap between executive expectation and measured engineering reality is, per Google's DORA data, approximately 12x.</p>

<blockquote class="ideas-pq ideas-pq--right"><p>The engineers didn't go away, the work didn't go away. What went away was the fantasy that you could delete the humans and keep the output.</p></blockquote>

<p>AWS chief Matt Garman put it plainly when asked about replacing junior developers with AI: "That's one of the dumbest things I've ever heard. How's that going to work when ten years in the future you have no one that has learned anything?" He's right. Every senior engineer was a junior engineer once. Every architect who can look at a system and immediately see where it will break learned that by shipping systems that broke. You cannot shortcut that. You cannot prompt it into existence. The judgment has to be earned through repetition and failure and time under load. Microsoft's CTO of Azure wrote in the April 2026 issue of the Communications of the ACM that AI imposes what he calls "AI drag" on early-career developers who lack the systems knowledge to steer and verify agent output. Without early-in-career hiring, he writes, organizations face a future without the next generation of experienced engineers. Companies that killed their apprenticeship pipeline will spend the next few years paying the bill: code review debt, architectural drift, nobody under 35 who understands why the system looks the way it looks.</p>

<div class="ideas-section-break">·</div>

<p>The old path is gone. The entry-level job where you spend your first year fixing small bugs while a senior watches over your shoulder is rarer now. Programmer employment in the United States fell 27.5% between 2023 and 2025. But the door is not closed. OpenAI and Anthropic are hiring juniors for the first time. Netflix hired a junior engineer last year for the first time in 25 years. The bottom of the pyramid doesn't come back in its old shape, but it is reforming. The new version doesn't write boilerplate. It directs AI output with enough judgment to know when it's wrong, and builds that judgment deliberately, through real projects, in public, with real stakes.</p>

<p>The engineers who will inherit the next decade are not the ones who avoided AI. They're not the ones who outsourced their thinking to it either. They're the ones who used it as a power tool and stayed uncomfortable enough with the output to understand what it produced. That discomfort is the work now. The same discomfort that came from debugging someone else's code at midnight, from writing the documentation nobody wanted, from getting a PR rejected and not knowing why. The medium changed. The formation didn't.</p>

<p>I'm still one of those bets. So are you, probably. That's not a comforting thought. It's an accurate one, and accuracy is the better thing to carry, at least until AGI makes it a different rollercoaster entirely.</p>`,
}

async function seed() {
  console.log(`Seeding post: "${post.title}"`)

  try {
    await db.insert(posts).values(post)
    console.log(`  ✓ Inserted: "${post.title}"`)
  } catch (error: any) {
    if (error?.code === '23505') {
      console.log(`  Already exists: "${post.title}" — skipping`)
    } else {
      console.error(`  Failed: "${post.title}"`, error.message)
    }
  }

  process.exit(0)
}

seed()
