// Duolingo-style weekly leagues: 30 players, ranked by XP earned this week (Mon-Sun).
// Top 10 move up a tier, bottom 5 move down (never below Bronze). Rivals are simulated until a backend exists.
export const TIERS = [
  { name: 'Bronze', emoji: '🥉' }, { name: 'Silver', emoji: '🥈' }, { name: 'Gold', emoji: '🥇' },
  { name: 'Sapphire', emoji: '💎' }, { name: 'Ruby', emoji: '♦️' }, { name: 'Emerald', emoji: '🟢' },
  { name: 'Amethyst', emoji: '🔮' }, { name: 'Pearl', emoji: '🦪' }, { name: 'Obsidian', emoji: '⚫' }, { name: 'Diamond', emoji: '👑' },
]
export const SIZE = 30
export const PROMOTE = 10 // ranks 1..10 go up
export const DEMOTE = 5 // last 5 go down
const WEEK = 7 * 864e5
const NAMES = ['Aarav', 'Diya', 'Kabir', 'Anaya', 'Vihaan', 'Myra', 'Reyansh', 'Siya', 'Arjun', 'Ira', 'Kiaan', 'Zara', 'Ishaan', 'Tara', 'Dev', 'Riya', 'Veer', 'Nila', 'Rohan', 'Meera', 'Advik', 'Pari', 'Yash', 'Avni', 'Neel', 'Kavya', 'Ayaan', 'Sana', 'Om']

const monday = (t: number) => {
  const d = new Date(t)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  d.setHours(0, 0, 0, 0)
  return d
}
export const weekKey = (t = Date.now()) => monday(t).toLocaleDateString('en-CA')
export const weekProgress = (t = Date.now()) => Math.min(1, (t - +monday(t)) / WEEK)
export const daysLeft = (t = Date.now()) => Math.max(1, Math.ceil((+monday(t) + WEEK - t) / 864e5))

// small seeded generator so a week's rivals stay the same across reloads
function rng(seed: string) {
  let h = 1779033703 ^ seed.length
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 3432918353), h = (h << 13) | (h >>> 19)
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296 }
}

export type Entry = { name: string; xp: number; me?: boolean }
// progress = how far through the week we are; rivals earn their weekly target gradually
export function board(week: string, tier: number, myXp: number, progress: number): Entry[] {
  const r = rng(`${week}:${tier}`)
  const rivals: Entry[] = NAMES.slice(0, SIZE - 1).map((name) => ({ name, xp: Math.round((80 + r() * (320 + tier * 120)) * progress) }))
  return [...rivals, { name: 'You', xp: myXp, me: true }].sort((a, b) => b.xp - a.xp || +!!b.me - +!!a.me)
}

// New tier after a finished week. Players with 0 XP never joined the week, so they stay put.
export function settle(week: string, tier: number, myXp: number): number {
  if (!myXp) return tier
  const rank = board(week, tier, myXp, 1).findIndex((e) => e.me) + 1
  if (rank <= PROMOTE) return Math.min(TIERS.length - 1, tier + 1)
  if (rank > SIZE - DEMOTE) return Math.max(0, tier - 1)
  return tier
}
