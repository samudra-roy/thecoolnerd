// XP rules. Per lesson we store only { xp, stars } (best ever); total XP is derived, never stored.
export type Best = { xp: number; stars: number }
export type Result = { stars: number; timeXp: number; starXp: number; gained: number; next?: Best }

export const STAR_XP = 10
// correct = questions right on the first try, out of 10
export const starsFor = (correct: number) => (correct >= 10 ? 3 : correct >= 6 ? 2 : correct >= 1 ? 1 : 0)
// 100 minus whole minutes taken, never below 0
export const timeXpFor = (seconds: number) => Math.max(0, 100 - Math.floor(seconds / 60))

// prior = what this lesson already earned. Time XP is awarded once (first completion);
// stars only ever go up, paying the difference.
export function lessonResult(correct: number, seconds: number, prior?: Best): Result {
  const stars = starsFor(correct)
  const best = Math.max(prior?.stars ?? 0, stars)
  const timeXp = prior ? 0 : timeXpFor(seconds)
  const starXp = (best - (prior?.stars ?? 0)) * STAR_XP
  return { stars, timeXp, starXp, gained: timeXp + starXp, next: { xp: prior?.xp ?? timeXp, stars: best } }
}

// Each of today's 3 daily sets keeps its own best stars (star XP only, upgrades pay the difference).
// pays=false is a bonus set: shows stars, earns nothing.
export function dailyResult(correct: number, prior?: Best, pays = true): Result {
  const stars = starsFor(correct)
  const best = Math.max(prior?.stars ?? 0, stars)
  const starXp = pays ? (best - (prior?.stars ?? 0)) * STAR_XP : 0
  return { stars, timeXp: 0, starXp, gained: starXp, next: pays ? { xp: 0, stars: best } : undefined }
}

export const totalXp = (best: Record<string, Best>) =>
  Object.values(best).reduce((a, b) => a + b.xp + b.stars * STAR_XP, 0)
