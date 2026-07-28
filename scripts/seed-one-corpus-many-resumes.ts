/**
 * Seed script — inserts the "One Corpus, Many Resumes" tech post
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/seed-one-corpus-many-resumes.ts
 *
 * Seeded with published: false — flip to true (or publish from the admin)
 * after the review pass. Delete-then-reseed on slug collision so re-running
 * always lands the latest content.
 *
 * The tweet embed renders from the `tweetEmbed` editor node's stored form:
 *   <div class="tweet-embed" data-tweet-url="https://x.com/..."></div>
 * The tech/[slug] page splits the body on that block and mounts <TweetEmbed>.
 * If the shared TweetEmbed component is not yet wired in, the block is inert
 * (renders nothing) and the post reads fine without the card.
 */

import { db } from '../lib/db'
import { posts } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

const content = [
  `<p>I asked Claude back in May to clean up my computer, and it surfaced a pile of gems. One was a project my friend and I started in 2014 to hitch a ride with Skybox Imaging (now part of Planet Lab via the Terra Bella acquisition) and launch a satellite cube.</p>`,

  `<div class="tweet-embed" data-tweet-url="https://x.com/nsisong101/status/2054665584491512218"></div>`,

  `<p>Another was a ton of old resumes, spread across different folders and filenames.</p>`,

  `<p>Not drafts of one resume, but distinct documents spread across a career of thirteen years and two countries, with some of the most activity dated around the time of my move to Canada. Each one had been built by opening the last one and editing it toward a posting. Claude compiled them into an archive and analysis soon showed that the archive had long ago stopped agreeing with itself. Project numbers and wins drifted across different files, tools I added once for ATS optimization for a specific role carried over as an earned skill that I had shipped with.</p>`,

  `<p>None of it was lying, exactly. Each version was defensible on the day it was written, yet no document could be called the true one. The most recent file was just the most recent inflation.</p>`,

  `<p>The result of this archive analysis brought me to the conclusion that a master resume cannot be the source of truth, because a resume is a rendering: one flattened view, shaped for one reader. Every time you target it, you are editing the artifact instead of the data behind it, and the drift compounds.</p>`,

  `<p>So instead of a master resume, I started a corpus: an agent-operated career framework that serves as the single source of truth going forward. I have open-sourced it on GitHub as <a href="https://github.com/nsisongeffiong/ai-career-corpus">ai-career-corpus</a>, with demo data and every name and number anonymized and fictional. What follows is what I learned building it.</p>`,

  `<h2>Structured by intent</h2>`,

  `<p>Career data splits by what it is for, not by what a resume needs. The chronology lives in one file; the measurable wins in another, flat and tagged into a search index a job description gets matched against. Skills carry years, recency, proficiency, and evidence. Interview stories, side projects, voice samples, and the exact <code>.docx</code> rendering contract each get their own file. An agent brief in <code>CLAUDE.md</code> tells the model which subset to read for each task, so generating a resume does not slurp the whole folder.</p>`,

  `<p>The folder structure is not the interesting part. The constraints are.</p>`,

  `<h2>Honesty as a hard constraint</h2>`,

  `<p>The obvious risk when an AI writes your resume against a posting is that it stretches to match. The skills matrix carries a binding do-not-overclaim column and an explicit known-gaps list. Portfolio projects carry a Status field with a verbs-by-stage table: a project that only ever existed on paper can be Conceived or Pitched, never Launched. The brief forbids extending a bullet past corpus facts to chase a keyword. An unsupported requirement becomes a flagged gap in the coverage table, not a quiet broadening of a sentence.</p>`,

  `<p>There is a companion rule for the other direction. Every company-side fact in a cover letter, legal name, office, mission, has to come from the posting or from the corpus owner, never from what the model happens to know. Plausible inference is still fabrication, and a confidently guessed legal name is the kind of error that ends an application.</p>`,

  `<h2>Rules alone fail; checks hold</h2>`,

  `<p>Heavy em-dash use is a top AI tell, so generated artifacts ban it. The rule alone did not hold. What holds is a post-render scan of the <code>.docx</code> XML for U+2014, where the count in prose has to be zero before a draft is done. Another finding showed that <code>python-docx</code> left metadata fingerprints in two places, the Author field and the Comments field, so the scrub clears both and also checks that the generated document carried the file creation date instead of the stale template date.</p>`,

  `<p>That pattern generalized into how <code>HISTORY.md</code> works.</p>`,

  `<blockquote><p>An incident is not closed when it produces a stronger rule. It is closed when it produces a deterministic check.</p></blockquote>`,

  `<h2>Postings are untrusted input</h2>`,

  `<p>A job description is third-party text you are feeding to a model. It can contain instructions aimed at an AI screener, hidden Unicode, a URL it wants fetched. To guard against this potential attack surface, the brief treats every posting as data to analyze and never as instructions, minimizes what personal data sits in context while one is being read, and permits no outbound actions from a posting-reading session. The scoring layer sees a compact digest, the skills matrix, and the targeting profile, not the files with PII such as salary and references in them.</p>`,

  `<p>If you decide to automate role scouting, keep that layer a deterministic script. Code that never interprets posting text as instructions is injection-immune by construction.</p>`,

  `<h2>The publish gate</h2>`,

  `<p>A filled corpus holds contact details, employers, client names, salary floors. It is private by definition, which made open-sourcing the framework a little precarious because there was real risk that people will clone it, fill it, and keep working in the same git tree.</p>`,

  `<p>So <code>scripts/validate_corpus.py</code> scans every tracked file for emails, phone-shaped numbers, secret-shaped strings, tracked binaries, and terms from a gitignored <code>private-terms.txt</code> blocklist built from your own filled corpus. The unfilled template passes but a filled corpus should fail. If yours passes, the blocklist is too thin: that is a finding about the blocklist, not a license to push.</p>`,

  `<p>There is one more trap, and it is the kind a careful person still walks into. When you clone the template, git remembers where you got it and sends every <code>git push</code> back there by default, to this repo. Fill your clone with real salary figures and client names, push out of habit, and that data lands in a repo you do not own. So bootstrapping re-points git at your own private repo before any real data goes in. Do it first, while you are still thinking about it, because the whole problem is that <code>git push</code> is the command you run without thinking.</p>`,

  `<h2>What the archive was actually for</h2>`,

  `<p>The ton of surfaced resumes were not waste. Bootstrapping runs the agent across them, pulls every bullet with a number into the wins bank, and annotates each with its source consistency: consistent across versions, single-source, or in conflict. Those annotations set the order of the verification pass, conflicts first. Where versions disagree, that is a question for you the user, never a silent choice by the model.</p>`,

  `<p>Then the archive gets closed and never read again. It was a lead generator, not a source of truth.</p>`,

  `<p>The verification pass is the only step that cannot be automated, and it is the one that makes the rest worth anything. An agent can extract a hundred claims from a decade of documents in an afternoon. Deciding which of them are true is still the job of the human in the loop.</p>`,
].join('\n\n')

const post = {
  type: 'tech' as const,
  title: 'One Corpus, Many Resumes',
  slug: 'one-corpus-many-resumes',
  excerpt:
    'A resume is a rendering, not a source of truth, and thirteen years of tailored versions prove it by disagreeing with themselves.',
  tags: ['ai', 'tooling', 'career', 'open-source'],
  published: false,
  publishedAt: null as Date | null,
  metadata: {
    readTime: 5,
    featured: false,
    codeLanguages: ['python'],
    legacyDisqus: false,
  },
  content,
}

async function seed() {
  console.log(`Seeding post: "${post.title}"`)

  try {
    // Delete-then-reseed so re-runs always land the latest content.
    const deleted = await db.delete(posts).where(eq(posts.slug, post.slug)).returning({ id: posts.id })
    if (deleted.length > 0) {
      console.log(`  ↷ Removed existing post with slug "${post.slug}" — reseeding`)
    }

    await db.insert(posts).values(post)
    console.log(`  ✓ Inserted: "${post.title}" (published: ${post.published})`)
  } catch (error: any) {
    console.error(`  ✗ Failed: "${post.title}"`, error.message)
  }

  process.exit(0)
}

seed()
