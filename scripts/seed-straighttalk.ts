import { db } from '../lib/db'
import { posts } from '../lib/db/schema'

const straightTalkPosts = [
  {
    type: 'ideas' as const,
    title: 'The average Nigerian — a tale of two cities',
    slug: 'the-average-nigerian-a-tale-of-two-cities',
    excerpt: 'The average Nigerian tends to live in two worlds — the real world and the imagined world. He calls for change while actively holding Nigeria down. Who will herald this change?',
    tags: ['politics', 'society', 'nigeria'],
    published: true,
    publishedAt: new Date('2011-10-21'),
    content: `<p class="ideas-lede">Some days ago, I stumbled across an article on a blog. A particular phrase caught my attention: "a real Nigerian is a 'tale of two cities'" (apologies to Charles Dickens).</p>

<p>The average Nigerian tends to live in two worlds or 'cities' — the real world and, if I may, the fake or imagined world.</p>

<p>Take the Nigerian leader as an example. During election campaigns, he makes all the promises, doles out cash at rallies, does a little charity work. But he knows real well that his promises are empty and his plans are to recoup his campaign expenses and become a billionaire during his tenure — one man, two cities.</p>

<p>Take the Nigerian footballer — he starts out in Nigeria, gets a big break and heads to Europe. He plays well for his club side. Then he gets called up to the national team and it becomes a whole different story. This leaves us asking: is this the same player?</p>

<p>The Nigerian civil servant finishes school, prays hard while searching for a job. Finally he gets one and it becomes a different ball game. He comes to the office late, puts in little effort and leaves before closing time. Yet this same man clamours for increase in pay.</p>

<p>The Nigerian student cheats his way through secondary school, cheats in his JAMB examination and gets into university. He 'sorts' and cheats his way through and finally gets his degree. He begins to look for a good paying job while blaming the government for his problems. Yet this graduate cannot defend his degree.</p>

<h2>The two cities problem</h2>

<p>The average Nigerian never sits to think if he actually contributes to the problem of our nation. It is always someone else's fault. He never wants to agree that his negative actions contribute to the troubles Nigeria is facing.</p>

<p>For quite some time, Nigerian youths have been asking for change through the online media — Twitter, Facebook, blogs. However, it will not be surprising to find that most of these same youths calling for change are actively involved in holding Nigeria down.</p>

<p>They give bribes to police men when they commit traffic offences, yet call the police corrupt. They constantly litter the roads with dirt yet complain about how dirty our cities are. They vote corrupt and clueless leaders into power because they have been given some money, yet they complain about bad leadership.</p>

<p>We do all these and still call for change, revolution, and whatever name you wish to give it. Who will herald this change? Who will lead the revolution? Is it the Nigerian who is a 'tale of two cities'?</p>`,
    metadata: {
      kicker: 'Society',
      volume: 'Straight Talk Nigeria',
      originalPublication: 'straighttalknigeria.wordpress.com',
      originalDate: '2011-10-21',
      legacyDisqus: false,
    },
  },
  {
    type: 'ideas' as const,
    title: 'Insecurity and a nation on the brink',
    slug: 'insecurity-and-a-nation-on-the-brink',
    excerpt: 'The coordinated terrorism of Boko Haram is not a religious war — it is a fight against Nigeria, its government, and its people. We must take these attacks personally.',
    tags: ['politics', 'security', 'nigeria'],
    published: true,
    publishedAt: new Date('2012-01-21'),
    content: `<p class="ideas-lede">I felt the earth vibrate under my feet. I was momentarily scared — bombs were going off. I counted twelve explosions but soon lost count as I was swept into the melee that ensued as people ran helter-skelter for refuge and safety.</p>

<p>The events that occurred earlier this week probably set the tone for Boko Haram's most coordinated act of terrorism on innocent Nigerians. It is not unthinkable that the Inspector General of Police, Mr. Hafiz Ringim, with the help of CP Zakare Biu, could bungle the arrest and subsequent detention of Kabiru Sokoto — a Boko Haram leader suspected in the Christmas day bombing of St. Theresa Catholic Church, Madalla, Niger State, that killed more than forty people.</p>

<p>It is also not unthinkable that the IG of Police will still keep his job. After all, we are in an era where government rewards service chiefs who have glaringly failed in their responsibilities with National Honour Awards, and clamps down on citizens exercising their freedom and rights to free speech.</p>

<h2>What these attacks actually are</h2>

<p>These are dangerous times for our country. The angst currently befuddling the nation has its roots in the brazen corruption of our political and economic system, bad leadership, and the underdevelopment facing a nation as blessed with resources as ours.</p>

<p>It is high time we see these attacks clearly for what they are — an attempt to destabilise Nigeria and lead our beloved nation into the throes of civil war. We must stop seeing Boko Haram as an Islamic organisation with a jihadist vendetta against Christians, because as the Kano attack has demonstrated, this is a fight against Nigeria, its government, and its people.</p>

<p>It is time for Nigerians to take these attacks personally. We must occupy Nigeria and demand that our government stamp out this menace and provide us with security. We deserve to go about our business without fear. We deserve to go back home at the end of the day in peace to the love of our family and friends.</p>

<p>As we demand changes from the leadership of our nation, we must be ready for these changes. It was a wise man that once said: be the change that you seek. We must totally overhaul the Nigerian system — our politics, our economy, our security. We must all join hands to win the battle for the soul of Nigeria.</p>`,
    metadata: {
      kicker: 'Politics & security',
      volume: 'Straight Talk Nigeria',
      originalPublication: 'straighttalknigeria.wordpress.com',
      originalDate: '2012-01-21',
      legacyDisqus: false,
    },
  },
  {
    type: 'ideas' as const,
    title: 'Leading failures',
    slug: 'leading-failures',
    excerpt: 'The true essence of leadership is to raise other leaders. When a party tells us there is only one man who can save Nigeria, they are confessing their own failure — and insulting our nation.',
    tags: ['politics', 'leadership', 'nigeria'],
    published: true,
    publishedAt: new Date('2012-02-28'),
    content: `<p class="ideas-lede">A few days ago I came across a tweet by Mallam El-Rufai, in which he stated that the Congress for Progressive Change was going to field General Buhari for the presidential elections in 2015. He also insinuated that General Buhari was the best man for the job — more or less the only one who can help Nigeria at this point. A sentiment many of Buhari's followers share.</p>

<p>When I saw those tweets, my first reaction was: what the heck is it with these guys? He'll be about 73 by 2015. But as I pondered on it, I began to see that it basically showed the failures of our so-called leaders and their followers. Was there no other person who could comfortably take after Buhari after learning from him for many years?</p>

<h2>What leadership is actually for</h2>

<p>Do our leaders know that the true essence of leadership is to raise other leaders? Do they know that as they grow, they are supposed to invest, empower, and train other leaders who will eventually take their place? Do their followers know that this is what their leaders ought to do?</p>

<p>Our present crop of leaders do not build lasting legacies. They rarely raise people who will take after them. They believe they are indispensable — and this defeats the aim of leadership. Maybe it is out of fear of being supplanted. Whatever the reason, this trait has created a huge leadership dearth in Nigeria.</p>

<p>The followers also make matters worse. They urge on these leaders, refuse to accept that one day they will be gone, and refuse to pressure them to raise other leaders. In the end, they have little to show for all their years of followership.</p>

<p>If the CPC says Buhari is our best bet and our only hope, then he has failed as a leader. And his followers have also failed. They have all failed our nation.</p>

<p>I believe that it is an insult to our nation — to the many youths and Nigerians who are fighting for change — to tell us that there is only one man who can save us. It is shameful and an indictment on all the so-called leaders.</p>`,
    metadata: {
      kicker: 'Politics',
      volume: 'Straight Talk Nigeria',
      originalPublication: 'straighttalknigeria.wordpress.com',
      originalDate: '2012-02-28',
      legacyDisqus: false,
    },
  },
  {
    type: 'ideas' as const,
    title: 'A realistic view of our failing democracy',
    slug: 'a-realistic-view-of-our-failing-democracy',
    excerpt: 'Abraham Lincoln defined democracy as government of the people, by the people, for the people. Against each component, Nigeria fails — but the failure is not only our leaders\'s. It is ours too.',
    tags: ['politics', 'democracy', 'nigeria'],
    published: true,
    publishedAt: new Date('2012-03-13'),
    content: `<p class="ideas-lede">Nigeria's existence as a democratic entity has been bogged down by inherent challenges and failures. But while we lay blame for these failures on corruption and the rascality of our leaders, we should take a holistic view of our democracy and make logical inferences to point out the loopholes in our democratic composition.</p>

<p>Abraham Lincoln simply defined democracy as: <em>government of the people, by the people, for the people.</em> Let us take a look at each component and determine how we measure up.</p>

<h2>Government of the people</h2>

<p>The people are invested with the sole authority and responsibility of constituting their government, mostly via elections. Unfortunately, elections in Nigeria have mostly been characterised by violence, rigging, ballot-snatching, and other criminal activities that have enabled our hare-brained politicians to usurp the mandate of the people. Notwithstanding, by failing to reject these impostors, our people have inadvertently been giving legitimacy to their leadership.</p>

<h2>Government by the people</h2>

<p>After choosing their government, it behoves the people to determine how government should be run. The people should communicate their needs and challenges to government, and also be ready to resist any abuse of power or neglect of responsibility. Evidently, this is the most important component.</p>

<p>The nonchalance and 'on-your-own' mentality of Nigerians towards the democratic process is saddening. We are not only failing in our responsibility but providing the necessary encouragement for our abuse, impoverishment, and the feverish looting of our resources. Most of us are unconcerned about our motherland — if we can provide a sense of comfort for our families, then all is well with the world.</p>

<h2>Government for the people</h2>

<p>Since Nigerians have directly or indirectly failed to elect their government and also failed to determine how it should be run, government exists for itself. It prides itself above the people and pursues activities that are only good for government. Corruption is good for government — it enriches their pockets. Implementation of unpopular policies that impoverish the masses is good for government — it makes more money available.</p>

<p>However, we cannot go on doing things the same way and expect different results. We must change. We must do our part and also hold government accountable to its responsibilities. Only then can we say we have true democracy.</p>`,
    metadata: {
      kicker: 'Democracy',
      volume: 'Straight Talk Nigeria',
      originalPublication: 'straighttalknigeria.wordpress.com',
      originalDate: '2012-03-13',
      legacyDisqus: false,
    },
  },
  {
    type: 'ideas' as const,
    title: 'Can violence change Nigeria?',
    slug: 'can-violence-change-nigeria',
    excerpt: 'There are numerous calls for violent change in Nigeria. But violence has no governing ideology — and in a society as diverse as ours, it will only worsen the situation.',
    tags: ['politics', 'society', 'nigeria'],
    published: true,
    publishedAt: new Date('2012-03-20'),
    content: `<p class="ideas-lede">Trolling social media over a period of time has shown me that there are numerous calls for violent change in Nigeria — individuals who have taken it upon themselves to propagate this school of thought. Anytime I think of the aftermath of violent change in Nigeria, images of Sudan, Somalia, Iraq, and Afghanistan flash through my mind.</p>

<p>I think of the innocent lives that will be lost, the devastation that will spread throughout the land. I think of the pain and the bloodshed, and I know that violence will just cause more problems for us.</p>

<h2>Why violence fails</h2>

<p>The positive effects of violent change are more or less illusions. They never last. After a short period of time, the negative effects begin to rise — and they do so with a grudge. Violent change has no underlying principle or idea other than to kill or overthrow. And after this, what next? Infighting begins. The revolutions are hijacked by the mediocre and the power-hungry, who are only thinking about their pockets.</p>

<p>In a very diverse society as ours, where various different groups are clamouring for a thousand and one different interests, how possible will it be to control the use of violence once it breaks out? How can you draw the line between righteous and unrighteous killing? What rules will guide the violence, and how will it be protected from hijacking?</p>

<p>I believe that violence cannot solve our problems as a nation. It has no governing ideology. Rather, it will worsen the situation. Martin Luther King put it plainly: the choice is not between violence and nonviolence, but between nonviolence and nonexistence. Wars are poor chisels for carving out peaceful tomorrows.</p>

<p>Before you conclude — imagine Somalia. The pain. The poverty. That is what we are being invited toward.</p>`,
    metadata: {
      kicker: 'Politics & society',
      volume: 'Straight Talk Nigeria',
      originalPublication: 'straighttalknigeria.wordpress.com',
      originalDate: '2012-03-20',
      legacyDisqus: false,
    },
  },
  {
    type: 'ideas' as const,
    title: '2015: Ominous vibes from Edo',
    slug: '2015-ominous-vibes-from-edo',
    excerpt: 'The pre-election violence in Edo State is not an isolated incident. Considered as a piece of the whole, it is a dress rehearsal — and our social media tools are being turned against us.',
    tags: ['politics', 'elections', 'nigeria'],
    published: true,
    publishedAt: new Date('2012-05-12'),
    content: `<p class="ideas-lede">The Nigerian political landscape has always been dotted by violence and unhealthy practices, so the pre-election insecurity in Edo State could by itself be shrugged off as normal. But when considered as a piece of the whole, everything rapidly falls into perspective.</p>

<p>The overall insecurity in the nation due to the Boko Haram menace has gone a long way to show the weakness and incapability of the Federal Government to confront and confound security challenges — as well as expose the inadequacies in training and tools currently afflicting our security agencies. This has given rise to a new wave of brazen, in-your-face criminal acts currently making the news all over the country.</p>

<h2>A departure from the norm</h2>

<p>Before now, violence in our political spectrum was mostly spread between foot soldiers — street brawls, attacking campaign trains, torching opponents' campaign offices — while the bigwigs would do all the talking on TV and in newspapers. The case of Edo State shows a clear departure from the norm. Governor Oshiomhole's convoy was attacked and innocent journalists were killed. This was followed by the murder of Comrade Olaitan Oyerinde, the Personal Secretary to the Governor — a key asset of the Oshiomhole campaign team.</p>

<p>There is an Ibibio proverb that says that one learns how to die by sleeping. The recent confusions in Edo State seem to point to a dress rehearsal.</p>

<h2>The social media front</h2>

<p>After the #OccupyNigeria protests, progressive youths and activists alike declared social media to be our forte — our most viable tool in organising a strong resistance ahead of the 2015 General Elections. But Edo State has also shown that the enemies of Nigeria are taking to social media and cyber wars. An obviously photoshopped picture of Oshiomhole in a compromising sexual position went viral, with youths taking sides. Fast-forward to 2015, and imagine how on the eve of an election, the credibility of a candidate could fizzle out in minutes to a Twitter hashtag — and you will agree that the waters are being tested.</p>

<p>Although it would be highly misleading to regard 2015 as our El Dorado, change will be the conglomeration of our successes and failures. We must not underestimate the enemy who is sworn to preserve the status quo — and who will not hesitate to use our own tools to put us down.</p>

<p>Nigeria will change. But we must remain aware of our constantly morphing enemy, and do whatever is necessary to triumph.</p>`,
    metadata: {
      kicker: 'Elections & politics',
      volume: 'Straight Talk Nigeria',
      originalPublication: 'straighttalknigeria.wordpress.com',
      originalDate: '2012-05-12',
      legacyDisqus: false,
    },
  },
  {
    type: 'ideas' as const,
    title: 'Fuel subsidy scam and the face of the enemy',
    slug: 'fuel-subsidy-scam-and-the-face-of-the-enemy',
    excerpt: 'Reading the Farouk Lawan committee report with burning anger, I found myself asking: who is the real enemy of Nigeria? Is it our corrupt leaders — or the people who condone their excesses?',
    tags: ['politics', 'corruption', 'nigeria'],
    published: true,
    publishedAt: new Date('2012-04-23'),
    content: `<p class="ideas-lede">I read with burning anger the contents of the report of the Farouk Lawan-led Fuel Subsidy Probe Committee, coupled with the recent Ibori fiasco. It got me thinking on the Nigerian situation — why are we this corrupt? How did looting the coffers of the nation with brazen impunity become a national sport where our leaders compete against each other with pride in a bid to emerge top thief of all time?</p>

<p>Who really is the enemy of our nation? Is it our corrupt leaders, or the people who condone their excesses?</p>

<h2>The pattern</h2>

<p>Bode George engaged in contract scams worth billions while at NPA and was jailed for a few years. When he came out, he was given a hero's welcome. Who is the enemy?</p>

<p>Diepreye Alamieyeseigha stole money as Governor of Bayelsa State and embarrassed our national image when he was caught masquerading as a woman. But today he is an elder statesman in Bayelsa politics — a king maker who is welcomed with open arms by his brothers. Who is the enemy?</p>

<p>James Ibori, notorious for his jaw-dropping pillaging of the Delta State treasury during his tenure as governor, was acquitted in Nigeria but convicted and handed a thirteen-year jail term in the UK. In mounting his defence, John Fashanu attempted to deify the petty criminal by listing his ghost achievements as governor. Who is the enemy?</p>

<p>When NEXT wrote series of articles raising reasons why Diezani Allison-Madueke should not be made Minister of Petroleum, did we not take sides, bandy sentiments, and even spew feminist slants? Now that it is evident she midwifed the most bizarre and brazen stealing of our oil wealth — who is the enemy?</p>

<h2>The real answer</h2>

<p>The list is endless — instances where individually or collectively as Nigerians, we have paid lip service to corrupt activities. Haven't we helped entrench corruption with our African mentality of triumphing brotherhood over national good? We do not have a system of values that condemns and spurns our corrupt brothers. Why won't our leaders steal when they know they will never be ostracised from society but glorified for their stolen wealth?</p>

<p>What the Farouk Lawan committee has done is commendable, but this report can still be swept under the carpet if we do not do all that is necessary to ensure that the culprits are punished. If we must occupy the National Assembly until justice is administered, then that is what we must do.</p>

<p>We must not continue to tongue-in-cheek blame corruption for our woes and expect a few activists to fight for the future we all dream of. If through our nonchalance we fail to bring these culprits to book, then once again we would have become the enemy.</p>`,
    metadata: {
      kicker: 'Corruption & governance',
      volume: 'Straight Talk Nigeria',
      originalPublication: 'straighttalknigeria.wordpress.com',
      originalDate: '2012-04-23',
      legacyDisqus: false,
    },
  },
]

async function seed() {
  console.log(`Seeding ${straightTalkPosts.length} Straight Talk Nigeria posts...`)
  let inserted = 0
  let skipped = 0

  for (const post of straightTalkPosts) {
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
