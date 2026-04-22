import { db } from '../lib/db'
import { posts } from '../lib/db/schema'

async function seed() {
  console.log('Seeding: "Crying this backlog of tears"...')

  try {
    await db.insert(posts).values({
      type: 'poetry',
      title: 'Crying this backlog of tears',
      slug: 'crying-this-backlog-of-tears',
      content: `<span class="line">I do not know what the body does</span>
<span class="line">with the tears it doesn't cry.</span>
<span class="line">Whether it files them,</span>
<span class="line">or ferments them,</span>
<span class="line">or simply waits —</span>

<span class="line">Titanic. Schindler's List. Toy Story 3.</span>
<span class="line">Whole rows of people</span>
<span class="line">coming undone beside me</span>
<span class="line">while I sat</span>
<span class="line">in my own dry country,</span>
<span class="line">wondering what they knew</span>
<span class="line">that I didn't.</span>

<span class="line">Each one logged and deferred.</span>
<span class="line i1"><em>Will process later.</em></span>
<span class="line i1"><em>Not blocking.</em></span>

<span class="line">Then I am thirty-something,</span>
<span class="line">it is a Wednesday evening,</span>
<span class="line">10000km from the place I've called home —</span>
<span class="line">fictional footballers</span>
<span class="line">in a fictional locker room</span>
<span class="line">pulling out pieces of a torn sign</span>
<span class="line">that was supposed to be lost.</span>

<span class="line">The system picks that moment</span>
<span class="line">to present the bill.</span>

<span class="line">Not quietly.</span>

<span class="line">I do not know what the body does</span>
<span class="line">with the tears it doesn't cry.</span>
<span class="line">Whether it files them,</span>
<span class="line">or ferments them,</span>
<span class="line">or simply waits —</span>

<span class="line">Nora stands on a sidewalk in New York</span>
<span class="line">watching a cab take someone</span>
<span class="line">she would have chosen</span>
<span class="line">in another life</span>
<span class="line">round the corner.</span>

<span class="line">And I do not know why a Korean film</span>
<span class="line">clears the queue</span>
<span class="line">when the children of Kraków</span>
<span class="line">did not.</span>

<span class="line">The players put down their pieces.</span>
<span class="line">The sign reassembles.</span>

<span class="line"><em>Believe.</em></span>`,
      excerpt: "On deferred feeling, fictional footballers, and why a Korean film clears the queue when Schindler's List did not.",
      tags: ['lyric'],
      published: true,
      publishedAt: new Date('2026-04-22'),
      metadata: {
        category: 'Lyric',
        legacyDisqus: false,
      },
    })
    console.log('  ✓ Inserted: "Crying this backlog of tears"')
  } catch (error: any) {
    if (error?.code === '23505') {
      console.log('  ↷ Already exists — skipping')
    } else {
      console.error('  ✗ Failed:', error.message)
    }
  }

  console.log('\nDone.')
  process.exit(0)
}

seed()
