import { db } from '../lib/db'
import { posts } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

// Composed excerpts — 80-120 chars, single sentence, no quotes, no ellipsis
const excerpts: Record<string, string> = {
  '7c7c5946-a9f8-4f19-92ab-b558272275b0': // Eket 0.5
    'Rain in Eket falls without regard for occasion, soaking Sunday clothes and sorrow with equal indifference.',

  'b2b25a1e-ec50-4379-bedd-531405450fa8': // Lavender
    'A woman whose hair smelled of lavender left only her scent and a name she never surrendered.',

  'ad62b8cd-3160-42f6-b030-31cbd7335cbe': // When you die
    'The birds do not mourn you, and the sun spins on, indifferent to your inconsequence in the vast earth.',

  '1894292e-8bf1-42c2-9290-9b5d4c3c76c9': // Waiting
    'Waiting becomes grief only when the train departs and you realize at last what you had been standing there for.',

  '7e9fa571-092c-4cd7-877e-6e8340f4271a': // If I am in your heart
    'If love were truly lodged within your chest, I should feel its heat the way damp air foretells rain.',

  '010948d2-4c7e-42ff-a415-6272ddd3d6b0': // A failed exorcism...
    'Lavender seeps through every song and poem, making each day\'s end another failed attempt at forgetting.',

  'f36faf35-669c-465b-9269-fb052f25744e': // A snapshot of Lavender's mind
    'Her mother taught her to smile with lips and never let it reach her heart, so she never gave her name.',

  '72aaa7a2-25df-43ef-863d-94e1ebfb024e': // In closing
    'When all else falls away, only three things hold their weight: poetry, music, and love.',

  '697c8093-ae97-463f-a27d-a9eebe72f35c': // The good death
    'There may be no good death, but the worst is the one that takes you before you even see it coming.',

  '013fbeb8-d710-432e-b2d1-e62acfa9a581': // The Happiness jar
    'He slipped the moment she sat down beside him into a happiness jar made from an old lotion container.',

  '85e44755-c4c9-4b55-abe0-46cb724cb3dd': // Does Sun sit on clouds?
    'An orange sun shoves the clouds aside and sits on them, quietly unsettling every certainty about which way is east.',

  'ffd1f1ca-db75-427f-9064-6e4dd214f33d': // Dark days
    'Something in the darkness knew how to whisper your name until it hollowed out the space where your soul should be.',

  'c6bfefac-8596-4a81-9f23-1a44c2523c40': // No. 33
    'Every passing of No. 33 fills the windows with her painted face and a lifetime of unpursued what-ifs.',

  '5534f8d9-3ff8-4696-ad58-0de86ae9508a': // Reaping Happiness
    'A boy\'s confident answer about metamorphosis instead of photosynthesis became an inexhaustible well of joy.',

  'cb285621-edb5-4ed2-a5f0-456415ee5ed5': // Tomorrow's Muse
    'Sun chases the moon away each morning while weary workers trudge toward a tomorrow holding all their buried dreams.',

  '3fb81faa-ebb8-455f-bd07-47fc0163e973': // An Early Morning Stroll
    'Morning mist clings like last night\'s guilt while the city hums around someone still walking and not quite awake.',

  'd0b75a0c-93ff-41b6-9758-f9ace5f9a2bf': // Untethered: Memoirs of a retired nerd
    'A lifelong back-row listener finally opens the drapes on a self-absorbed nerd\'s tunes through a phase of life.',

  '975df777-d0b3-421a-a093-91c9e4e58f81': // The Plea
    'Stay and let me bask in your laughter while death wanders nearby, an unwilling pilgrim looking for rest.',

  '1d734180-5297-4c3b-a6d3-fdd7dadbf705': // Home Burial
    'An old man\'s will insists he be buried where he called home, defying every tradition but his own.',

  'a1457ec2-a287-49d6-bd6c-f7d20dc1f8a5': // See The Light
    'Light rises at every dawn and flees at dusk, freely given to all and only sometimes hidden by cloud or decree.',

  'a6d3d978-63b2-4cd3-88e7-151f970d3727': // Love Owes Me One
    'Love paints every picture of your existence and then slips away before the canvas has time to dry.',

  '73d7005c-2474-4920-ae94-27d420b75e12': // About this site
    'After years of domain limbo and a squatter\'s silence, the writer finally returns to his own corner of the web.',

  '4999500f-6261-4db7-a8f6-8683f402d107': // Needful Things
    'Family to run to or from, friends who hold your shadow, happiness self-measured, and love to heal by.',

  '14ae33c0-7c25-498f-8a4b-77b1cb6e2524': // The harmattan that felt different
    'In January the harmattan dust returned to cover everything, and the speaker surrendered a heart that needed tending.',

  '998309ae-de63-46ed-a913-e75956c8eb81': // Eket 1.0 : Small town problems
    'In this small town every destination is a fifty-naira bike ride away, though he\'s in no hurry to test the last one.',

  '7b1b8d67-f83b-4bc5-9ab8-d9ce496175ba': // Nostalgia
    'Childhood laughter and the tap of machetes on fallen palms fade when cracked lips taste only the bus window\'s dust.',

  '6ca35f10-817d-4c7f-af2c-27a446db28b9': // The Man From Down The Street
    'A bent man stares at an obituary, his poverty mirrored in the dead man\'s face, wondering when his own turn will come.',

  '953bfd70-ea8e-4e0b-8f36-855b1099dcf6': // On Her Breath
    'Their breathing never aligns, and in the gap between his inhale and her exhale, he finds what he loves most.',
}

async function run() {
  console.log(`Prepared ${Object.keys(excerpts).length} poetry excerpts.\n`)
  console.log('─'.repeat(80))

  // Fetch the posts to display title alongside each excerpt
  const poetryPosts = await db
    .select({ id: posts.id, title: posts.title })
    .from(posts)
    .where(eq(posts.type, 'poetry'))

  const titleById: Record<string, string> = {}
  for (const p of poetryPosts) titleById[p.id] = p.title

  // Preview — show every title + excerpt before writing
  for (const [id, excerpt] of Object.entries(excerpts)) {
    const title = titleById[id] ?? '(unknown)'
    console.log(`\nTitle:   ${title}`)
    console.log(`Excerpt: ${excerpt}`)
    console.log(`Length:  ${excerpt.length} chars`)
    console.log('─'.repeat(80))
  }

  console.log(`\nWriting ${Object.keys(excerpts).length} excerpts to database...\n`)

  for (const [id, excerpt] of Object.entries(excerpts)) {
    const title = titleById[id] ?? id
    await db.update(posts).set({ excerpt }).where(eq(posts.id, id))
    console.log(`✓ ${title}`)
  }

  console.log('\nDone.')
  process.exit(0)
}

run()
