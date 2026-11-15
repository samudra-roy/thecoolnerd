import { LESSONS_PER_CHAPTER } from './data'
import type { State } from './store'

type S = Pick<State, 'bestStreak' | 'done' | 'best'> & { xp: number }
// Badges are derived from saved progress, so nothing extra is stored except bestStreak.
export const ACHIEVEMENTS: { id: string; emoji: string; name: string; desc: string; earned: (s: S) => boolean }[] = [
  { id: 'first', emoji: '🌱', name: 'First steps', desc: 'Finish a lesson', earned: (s) => Object.keys(s.best).length > 0 },
  { id: 'perfect', emoji: '🦉', name: 'Perfect lesson', desc: 'Get 3 stars on a lesson', earned: (s) => Object.values(s.best).some((b) => b.stars === 3) },
  { id: 'chapter', emoji: '📘', name: 'Chapter done', desc: 'Finish every lesson in a chapter', earned: (s) => Object.values(s.done).some((n) => n >= LESSONS_PER_CHAPTER) },
  { id: 'streak3', emoji: '🔥', name: 'On fire', desc: '3-day streak', earned: (s) => s.bestStreak >= 3 },
  { id: 'week', emoji: '🏅', name: 'Perfect week', desc: 'Practice 7 days in a row', earned: (s) => s.bestStreak >= 7 },
  { id: 'xp100', emoji: '⚡', name: 'Spark', desc: 'Earn 100 XP', earned: (s) => s.xp >= 100 },
  { id: 'xp500', emoji: '🚀', name: 'Rocket', desc: 'Earn 500 XP', earned: (s) => s.xp >= 500 },
]
