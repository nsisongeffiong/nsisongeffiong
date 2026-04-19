import { db } from '../lib/db'
import { posts } from '../lib/db/schema'

const newPosts = [
  {
    type: 'ideas' as const,
    title: 'The infrastructure of forgetting — how states manage historical memory',
    slug: 'infrastructure-of-forgetting',
    excerpt: 'Forgetting is not the absence of memory work — it is a form of memory work, requiring sustained institutional effort. Understanding this changes how we think about truth commissions, archives, and the politics of public commemoration.',
    tags: ['governance', 'politics', 'history'],
    published: true,
    publishedAt: new Date('2026-03-28'),
    content: `<p class="ideas-lede">South Africa's Truth and Reconciliation Commission is usually discussed as a mechanism for producing memory — for bringing suppressed truths into the public record. What gets less attention is the parallel work of managed forgetting: the decisions about what would not be investigated, which perpetrators would not be named, which categories of harm would fall outside the Commission's mandate. These decisions were not incidental to the process. They were constitutive of it.</p>

<p>Every memory regime is also a forgetting regime. The archive that preserves some things necessarily excludes others. The monument that names some victims implies a hierarchy of whose deaths count. The school curriculum that teaches one account of contested events is also choosing not to teach others. This is not a critique — selection is unavoidable — but it is a description of how historical memory actually works that gets obscured when we talk only about preservation and recovery.</p>

<aside class="ideas-pq ideas-pq--right">
  <p>&ldquo;The most effective form of political forgetting is not erasure — it is saturation. Flood the record with enough competing narratives and the one that matters most becomes indistinguishable from noise.&rdquo;</p>
</aside>

<p>What makes this relevant now is that the infrastructure of memory — archives, museums, curricula, public commemoration — is increasingly contested terrain. The contestation is sometimes framed as a battle between memory and forgetting, between those who want to preserve difficult truths and those who want to suppress them. That framing is too simple.</p>

<h2>The politics of the archive</h2>

<p>Archives are not neutral repositories. They are institutions with budgets, governance structures, access policies, and professional cultures that shape what gets preserved, how it gets described, and who can use it. These structures are rarely designed with adversarial intent — but they produce systematic biases that are legible only in retrospect, when the records needed to understand a particular period or community turn out not to exist.</p>

<div class="ideas-section-break">I.</div>

<p>The digital turn has not solved this problem. It has changed its shape. More material is technically preserved, but the metadata and contextualisation that make material findable and interpretable are still produced by institutions with the same structural biases as before. A digitised colonial archive is still a colonial archive.</p>

<aside class="ideas-pq ideas-pq--left">
  <p>&ldquo;We have mistaken the preservation of data for the preservation of knowledge. They are not the same thing, and conflating them is expensive.&rdquo;</p>
</aside>

<p>The policy implication is that investment in memory infrastructure needs to be accompanied by investment in the governance of that infrastructure — who decides what gets preserved, how it gets described, and under what conditions it can be accessed. These questions are rarely asked at the point of funding decisions, which is precisely when they would be most tractable.</p>`,
    metadata: {
      kicker: 'Politics & history',
      volume: 'Vol. I',
      featured: false,
      legacyDisqus: false,
    },
  },
  {
    type: 'ideas' as const,
    title: 'Open data and the myth of the neutral dataset',
    slug: 'open-data-myth-neutral-dataset',
    excerpt: 'The open data movement promised that making government data publicly available would enable accountability and drive better policy. A decade on, the evidence is more complicated — and the complications are instructive.',
    tags: ['digital rights', 'public policy', 'technology'],
    published: true,
    publishedAt: new Date('2026-03-12'),
    content: `<p class="ideas-lede">When the open data movement emerged in the late 2000s, its core claim was straightforward: governments hold enormous amounts of data that, if released publicly, would enable journalists, researchers, and citizens to hold power to account, identify policy failures, and generate innovations that the state itself lacked the capacity to produce. The claim was not wrong — but it was incomplete in ways that have taken years to become visible.</p>

<p>The incompleteness was not primarily technical. The problems of format, interoperability, and discoverability that dominated early open data debates were real and have been substantially addressed. The deeper problem was a theory of change that treated data release as the end of the process rather than the beginning.</p>

<aside class="ideas-pq ideas-pq--right">
  <p>&ldquo;Making data available is not the same as making it usable. Making it usable is not the same as making it used. And making it used is not the same as making it consequential.&rdquo;</p>
</aside>

<p>Data does not speak for itself. It requires interpretation, and interpretation requires expertise, time, and institutional support that is not evenly distributed. The organisations best positioned to turn open government data into accountability journalism or policy analysis are concentrated in wealthy countries, in major cities, in institutions that already have access to the other resources that make data work possible.</p>

<h2>Who benefits from open data</h2>

<p>The pattern that has emerged is familiar from other open access initiatives: the resources that are released publicly tend to be captured most effectively by actors who were already well-resourced. This is not an argument against openness — it is an argument for pairing openness with investment in the capacity to use what is opened.</p>

<div class="ideas-section-break">I.</div>

<aside class="ideas-pq ideas-pq--left">
  <p>&ldquo;The open data movement optimised for supply. The constraint was always demand — specifically, the institutional capacity to turn data into knowledge.&rdquo;</p>
</aside>

<p>There is a further problem that has received less attention: the datasets that governments choose to release reflect their existing categories of understanding. A dataset on hospital admissions encodes a particular theory of what health is and how it should be measured. A dataset on crime encodes a theory of what counts as criminal behaviour and whose behaviour gets recorded. Opening these datasets does not open these assumptions — in some ways it entrenches them, because the open data infrastructure gives them a new kind of authority and legibility.</p>

<p>The next phase of open data policy needs to grapple with these questions directly rather than treating them as edge cases. What gets measured, how, by whom, and under what governance arrangements — these are prior questions to the question of whether the resulting data should be open.</p>`,
    metadata: {
      kicker: 'Digital rights',
      volume: 'Vol. I',
      featured: false,
      legacyDisqus: false,
    },
  },
  {
    type: 'ideas' as const,
    title: 'The return of industrial policy — and the questions it is not asking',
    slug: 'return-of-industrial-policy',
    excerpt: 'After three decades in which industrial policy was treated as a relic of a less enlightened era, it has returned to the centre of economic governance. The intellectual rehabilitation is largely complete. The harder work of asking what we are actually trying to achieve has barely begun.',
    tags: ['political economy', 'public policy', 'economics'],
    published: true,
    publishedAt: new Date('2026-03-05'),
    content: `<p class="ideas-lede">The rehabilitation of industrial policy as a respectable concept in mainstream economic discourse has been remarkably swift. A decade ago, any proposal for active government intervention in shaping industrial structure would have been met with a standard objection: governments cannot pick winners, markets allocate resources more efficiently than bureaucrats, and the attempt to do otherwise produces rent-seeking and distortion. These objections have not been answered so much as abandoned, largely because the evidence has made them too expensive to maintain.</p>

<p>The Inflation Reduction Act, the EU's Green Deal Industrial Plan, the UK's various iterations of industrial strategy — whatever one thinks of their specific provisions, they represent a genuine shift in the terms of the debate. Industrial policy is no longer a confession of heterodoxy. It is mainstream practice.</p>

<aside class="ideas-pq ideas-pq--right">
  <p>&ldquo;The question was never really whether governments shape industrial structure — they always have. The question is whether they do so intentionally, with clear objectives and accountability, or inadvertently, through the accumulation of decisions that were never examined as a whole.&rdquo;</p>
</aside>

<p>But the intellectual rehabilitation has moved faster than the institutional and analytical work needed to make industrial policy actually work. The debate has been largely about whether to do it, not about what doing it well requires. And the gap between those two questions is where the real difficulty lives.</p>

<h2>The missing theory of change</h2>

<p>Most contemporary industrial policy frameworks share a common structure: identify a strategic sector, provide subsidies or other support to attract or develop capacity in that sector, and measure success by investment volumes and job creation. This structure is legible and politically communicable. It is also incomplete in ways that matter.</p>

<div class="ideas-section-break">I.</div>

<p>The question of what industrial policy is for — beyond the generic goals of growth and competitiveness — is rarely asked explicitly. Yet the answer shapes everything: which sectors get prioritised, what conditions are attached to support, how success is measured, and what happens when the initial theory of change turns out to be wrong.</p>

<aside class="ideas-pq ideas-pq--left">
  <p>&ldquo;Industrial policy that cannot answer the question 'productive for whom?' is not neutral — it is implicitly answering 'for the firms that are currently best positioned to capture the support.'&rdquo;</p>
</aside>

<p>The green transition offers a useful test case. Decarbonisation requires industrial policy — the scale and speed of the required transformation is not achievable through price signals alone. But decarbonisation for what? A transition that produces cheap clean energy controlled by a small number of large corporations is a different thing from one that produces distributed energy ownership and the resilience that comes with it. Both require industrial policy. They require different industrial policy.</p>

<p>The return of industrial policy is, on balance, a good development. But the enthusiasm for its return should not be allowed to substitute for the harder analytical work of asking what we are trying to build, for whom, and how we will know if we are succeeding.</p>`,
    metadata: {
      kicker: 'Political economy',
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
