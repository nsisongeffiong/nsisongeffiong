import 'dotenv/config'
import { db } from '../lib/db'
import { posts } from '../lib/db/schema'

async function seed() {
  console.log('Seeding poetry post "The Weight of Morning"...')

  try {
    await db.insert(posts).values({
      type: 'poetry',
      title: 'The Weight of Morning',
      slug: 'the-weight-of-morning',
      content: `<div class="stanza">
  <span class="line">I woke to the weight of morning,</span>
  <span class="line">the light a slow persuasion</span>
  <span class="line i1">pressing through curtains drawn</span>
  <span class="line i2">against forgetting.</span>
</div>

<div class="stanza">
  <span class="line">There is a name for this hour—</span>
  <span class="line">the one the body remembers</span>
  <span class="line i1">before the mind agrees to rise,</span>
  <span class="line i1">before language finds its feet.</span>
</div>

<div class="stanza">
  <span class="line">I held the silence like a bowl,</span>
  <span class="line i1">careful not to spill</span>
  <span class="line i2">the little water left.</span>
</div>`,
      excerpt: 'On the hour before rising, and what the body carries before language arrives.',
      tags: ['lyric'],
      published: true,
      publishedAt: new Date('2024-03-12'),
      metadata: {
        category: 'Lyric',
        poetNote: 'This poem began as a journal entry on a morning in Lagos when the power had been out for two days. I was thinking about how the body carries its own clock, separate from alarms and obligations—how waking is itself an act of faith.',
        legacyDisqus: false,
      },
    })
    console.log('  ✓ Inserted: "The Weight of Morning"')
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
