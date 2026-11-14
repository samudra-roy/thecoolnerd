import { useEffect, useState } from 'react'

export type State = {
  cls: number
  subject: string
  xp: number
  streak: number
  lastDay: string
  done: Record<string, number> // "maths:cls:chapter" -> lessons finished
}
const KEY = 'thecoolnerd-v1'
const fresh: State = { cls: 4, subject: 'maths', xp: 0, streak: 0, lastDay: '', done: {} }
const day = (offset = 0) => new Date(Date.now() - offset * 864e5).toLocaleDateString('en-CA')

// Dummy backend: localStorage. Swap load/save for Supabase calls later.
const load = (): State => {
  try { return { ...fresh, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return fresh }
}

export function useStore() {
  const [s, setS] = useState<State>(load)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* private mode */ } }, [s])
  // a missed day resets the streak on display
  const live = s.lastDay === day() || s.lastDay === day(1) ? s.streak : 0
  return {
    s: { ...s, streak: live },
    set: (p: Partial<State>) => setS((o) => ({ ...o, ...p })),
    finish(key: string, step: number, xp: number) {
      setS((o) => {
        const streak = o.lastDay === day() ? o.streak : o.lastDay === day(1) ? o.streak + 1 : 1
        return { ...o, xp: o.xp + xp, streak, lastDay: day(), done: { ...o.done, [key]: Math.max(o.done[key] || 0, step + 1) } }
      })
    },
  }
}
