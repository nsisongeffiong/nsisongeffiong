import { db } from '../lib/db'
import { posts } from '../lib/db/schema'

const newPosts = [
  {
    type: 'ideas' as const,
    title: 'What the "innovation economy" discourse consistently leaves out',
    slug: 'what-the-innovation-economy-discourse-leaves-out',
    excerpt: 'The language of innovation hubs travels fast. Evidence of who benefits arrives slowly — and usually tells a different story than the press releases.',
    tags: ['political economy', 'technology'],
    published: true,
    publishedAt: new Date('2026-03-15'),
    content: `<p class="ideas-lede">In 2019, a major West African city announced its ambition to become "Africa's Silicon Valley." By 2023, the co-working spaces were half-empty, the flagship accelerator had quietly closed, and the developers who had relocated for the opportunity were mostly working remotely for companies based elsewhere. The story was covered nowhere.</p>

<p>This is a pattern, not an exception. The innovation economy discourse — with its hubs, clusters, ecosystems, and pipelines — generates enormous amounts of coverage on the way in and almost none on the way out. The asymmetry is not accidental.</p>

<aside class="ideas-pq ideas-pq--right">
  <p>&ldquo;Every city that has followed the innovation economy playbook has produced the same outcome: higher rents, displaced residents, and a small group of people who were already doing well doing somewhat better.&rdquo;</p>
</aside>

<p>The discourse travels because it is useful to several parties simultaneously. Property developers benefit from the zoning changes and infrastructure investment that follow the designation of a tech district. National governments benefit from the appearance of forward-looking economic strategy. Venture capital benefits from the subsidised talent pipelines and the implicit government backstop. Universities benefit from the research commercialisation narrative.</p>

<h2>The measurement problem</h2>

<p>When the evidence is eventually examined, it tends to be measured on terms that were set by the same institutions that promoted the investment. Job creation figures count the baristas serving the developers as much as the developers. GDP contribution numbers aggregate value that accrues disproportionately to a small number of shareholders. Patent counts measure activity, not welfare.</p>

<aside class="ideas-pq ideas-pq--left">
  <p>&ldquo;The metrics used to evaluate the innovation economy were designed by the people who benefit from it. This is not a conspiracy — it is how institutional measurement works.&rdquo;</p>
</aside>

<p>The harder question — whether the investment produced better outcomes for the people who already lived in the area than an equivalent investment in schools, hospitals, or affordable housing would have — is rarely asked. When it is asked, the answer is usually uncomfortable.</p>

<div class="ideas-section-break">I.</div>

<h2>Who the discourse serves</h2>

<p>None of this means that technological development is unimportant or that cities should not try to foster it. It means that the current discourse systematically obscures the distributional question: who captures the gains, and who bears the costs?</p>

<p>The innovation economy playbook treats that question as secondary — a matter of policy refinement after the main work of growth is done. The evidence suggests it should be the first question, because the distributional structure of an economic intervention tends to get locked in early and prove very difficult to change later.</p>`,
    metadata: {
      kicker: 'Political economy',
      volume: 'Vol. I',
      featured: false,
      legacyDisqus: false,
    },
  },
  {
    type: 'ideas' as const,
    title: 'The attention economy has a geography problem nobody is naming',
    slug: 'attention-economy-geography-problem',
    excerpt: 'Global platforms optimise for engagement metrics set in a handful of cities. The result is not just cultural homogenisation — it is a systematic misalignment between what gets amplified and what most people\'s lives actually contain.',
    tags: ['media', 'technology', 'digital rights'],
    published: true,
    publishedAt: new Date('2026-02-27'),
    content: `<p class="ideas-lede">The feed is not neutral. This is now widely understood. What is less understood is that the non-neutrality has a specific geography: the preferences, aesthetics, and concerns that get amplified by recommendation systems were largely defined by the engineers, product managers, and early users who built and shaped those systems — a group concentrated in a small number of cities in a small number of countries.</p>

<p>This is not simply about whose stories get told. It is about the deeper question of whose sense of what is interesting, urgent, or worth attention gets encoded into the infrastructure that mediates everyone else's information environment.</p>

<aside class="ideas-pq ideas-pq--right">
  <p>&ldquo;When we say an algorithm is biased, we usually mean it is biased toward a protected characteristic. The geographic bias is structurally identical but almost never named as such.&rdquo;</p>
</aside>

<p>The effect is compounding. Content that performs well in San Francisco and London shapes the training data for the next generation of recommendation systems. Those systems then amplify content that resembles what performed well before. The feedback loop is self-reinforcing and largely invisible to the people inside it, because they are optimising for the only signal available to them: engagement within the system they have already built.</p>

<h2>The infrastructure of attention</h2>

<p>Attention has always been geographically unequal. The printing press, the telegraph, the broadcast network — each created centres and peripheries. What is different about the current moment is the combination of global reach with local optimisation: platforms that operate everywhere but were calibrated somewhere specific.</p>

<div class="ideas-section-break">I.</div>

<p>The policy conversation about platform regulation has focused primarily on content moderation, privacy, and market competition. These are real concerns. But the geographic attention problem sits upstream of all of them: it shapes which content exists to be moderated, whose privacy concerns are legible to regulators, and which markets are visible enough to generate competitive pressure.</p>

<aside class="ideas-pq ideas-pq--left">
  <p>&ldquo;Fixing the content is downstream of fixing the infrastructure. And the infrastructure question is fundamentally about who gets to define what counts as engaging.&rdquo;</p>
</aside>

<p>There is no clean solution to this. Platforms cannot be simultaneously global and locally calibrated in any meaningful sense. But acknowledging the problem — naming the geography of the attention economy rather than treating recommendation systems as neutral optimisers — is a precondition for thinking clearly about what partial improvements might look like.</p>`,
    metadata: {
      kicker: 'Media & attention',
      volume: 'Vol. I',
      featured: false,
      legacyDisqus: false,
    },
  },
  {
    type: 'ideas' as const,
    title: 'Bureaucracy as care work — and why that framing changes everything',
    slug: 'bureaucracy-as-care-work',
    excerpt: 'What would it mean to design government systems the way we design care — with patience, iteration, and sustained attention to the person in front of us? The question sounds utopian. The evidence suggests it is merely practical.',
    tags: ['governance', 'public policy'],
    published: true,
    publishedAt: new Date('2026-02-10'),
    content: `<p class="ideas-lede">The standard critique of bureaucracy is that it is dehumanising — that it replaces the particular person with the generic case, the lived situation with the administrative category. This critique is accurate but incomplete. It describes the failure mode without naming what success would look like, and so it tends to produce reforms that replace one kind of abstraction with another.</p>

<p>The framing I want to suggest is different: bureaucracy, at its best, is care work. Not in the soft sense — not in the sense of being warm or empathetic, though those things matter — but in the structural sense. Care work is work that requires sustained, attentive, iterative engagement with another person's specific situation over time. That is exactly what good casework, good benefits administration, good public health intervention requires.</p>

<aside class="ideas-pq ideas-pq--right">
  <p>&ldquo;The problem with most government reform programmes is that they optimise for efficiency without asking: efficient at producing what, for whom, measured how?&rdquo;</p>
</aside>

<p>The implication is not that bureaucracies should become therapy. It is that the design principles we apply to care — caseload limits, relationship continuity, outcome measurement that tracks the person not just the transaction — should apply to public administration too.</p>

<h2>Why the comparison matters</h2>

<p>Care work is systematically undervalued because its outputs are difficult to quantify and its costs are easy to cut without immediate visible consequence. The same is true of the parts of public administration that work well. The caseworker who knows a client's situation well enough to identify a problem before it becomes a crisis is doing something that is nearly impossible to capture in a performance metric.</p>

<div class="ideas-section-break">I.</div>

<aside class="ideas-pq ideas-pq--left">
  <p>&ldquo;Every time a government service is redesigned to reduce headcount, it is implicitly making a bet that the tacit knowledge held by the people it is removing is not valuable. That bet is usually wrong.&rdquo;</p>
</aside>

<p>The austerity programmes of the 2010s demonstrated this at scale. The services that were cut most aggressively — youth services, early intervention programmes, housing support — were precisely the ones whose value was most diffuse, most relational, and least legible to the spreadsheet. The costs appeared elsewhere, years later, in more expensive and less effective crisis services.</p>

<h2>What different design would look like</h2>

<p>Designing public systems as care systems would mean, concretely: smaller caseloads and longer tenure for frontline workers; outcome measurement that follows the person through time rather than the transaction through a system; procurement criteria that reward relationship continuity rather than cost per intervention; and political language that treats the quality of public administration as an end in itself rather than an unfortunate overhead on the way to delivering services.</p>

<p>None of this is cheap. But the current model is not cheap either — it simply displaces its costs onto the people least able to bear them.</p>`,
    metadata: {
      kicker: 'Governance',
      volume: 'Vol. I',
      featured: false,
      legacyDisqus: false,
    },
  },
]

async function seed() {
  console.log(`Seeding ${newPosts.length} ideas posts...`)
  let inserted = 0
  let skipped = 0

  for (const post of newPosts) {
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
