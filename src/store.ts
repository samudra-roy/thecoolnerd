import { useEffect, useState } from 'react'
import { settle, weekKey } from './league'
import { totalXp, type Best, type Result } from './xp'

export type State = {
  cls: number
  subject: string
  streak: number
  lastDay: string
  done: Record<string, number> // "maths:cls:chapter" -> lessons finished
  last: Record<string, string> // chapter key -> last day practiced (drives revision)
  best: Record<string, Best> // lessonId -> { first-run time XP, best stars }
  hearts: number // stored count; use the live value from useStore
  heartAt: number // when the next regen hour started counting
  bestStreak: number // longest streak ever, for achievements
  league: number // tier index into TIERS
  week: string // Monday of the week weekXp belongs to
  weekXp: number
}
export const MAX_HEARTS = 5
const HOUR = 36e5
const KEY = 'thecoolnerd-v1'
const fresh: State = { cls: 4, subject: 'maths', streak: 0, lastDay: '', done: {}, last: {}, best: {}, hearts: MAX_HEARTS, heartAt: 0, bestStreak: 0, league: 0, week: '', weekXp: 0 }
// 1 heart per hour; the clock only runs while below max
const regen = (o: State, now: number) => {
  if (o.hearts >= MAX_HEARTS) return { hearts: MAX_HEARTS, heartAt: now }
  const n = Math.floor((now - o.heartAt) / HOUR)
  const hearts = Math.min(MAX_HEARTS, o.hearts + n)
  return { hearts, heartAt: hearts >= MAX_HEARTS ? now : o.heartAt + n * HOUR }
}
export const day = (offset = 0) => new Date(Date.now() - offset * 864e5).toLocaleDateString('en-CA')

// Dummy backend: localStorage. Swap load/save for Supabase calls later.
const load = (): State => {
  let st = fresh
  try { st = { ...fresh, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { /* use fresh */ }
  const wk = weekKey()
  // a new week started: settle last week's league (promote/demote) and reset weekly XP
  if (st.week !== wk) st = { ...st, league: st.week ? settle(st.week, st.league, st.weekXp) : st.league, week: wk, weekXp: 0 }
  return st
}

export function useStore() {
  const [s, setS] = useState<State>(load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode */ } }, [s])
  // a missed day resets the streak on display
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t) }, [])
  const h = regen(s, now)
  const live = s.lastDay === day() || s.lastDay === day(1) ? s.streak : 0
  return {
    s: { ...s, streak: live, xp: totalXp(s.best), hearts: h.hearts, nextHeartMs: h.hearts >= MAX_HEARTS ? 0 : h.heartAt + HOUR - now },
    loseHeart: () => setS((o) => { const r = regen(o, Date.now()); return { ...o, hearts: Math.max(0, r.hearts - 1), heartAt: r.heartAt } }),
    // shortcut: ad watch is simulated, wire a real ad SDK before release
    refillHearts: () => setS((o) => ({ ...o, hearts: MAX_HEARTS, heartAt: Date.now() })),
    set: (p: Partial<State>) => setS((o) => ({ ...o, ...p })),
    finish(touched: string[], r: Result, o: { id?: string; progress?: { key: string; step: number } } = {}) {
      setS((old) => {
        const streak = old.lastDay === day() ? old.streak : old.lastDay === day(1) ? old.streak + 1 : 1
        const last = { ...old.last }
        touched.forEach((k) => (last[k] = day()))
        const done = o.progress ? { ...old.done, [o.progress.key]: Math.max(old.done[o.progress.key] || 0, o.progress.step + 1) } : old.done
        const best = o.id && r.next ? { ...old.best, [o.id]: r.next } : old.best
        return { ...old, streak, lastDay: day(), bestStreak: Math.max(old.bestStreak, streak), done, last, best, weekXp: old.weekXp + r.gained }
      })
    },
  }
}
