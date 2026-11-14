import { useState } from 'react'
import { CLASSES, LESSONS_PER_CHAPTER, SUBJECTS, chaptersFor, scale } from './data'
import { useStore } from './store'
import Lesson from './Lesson'

const COLORS = ['#58cc02', '#1cb0f6', '#ce82ff', '#ff9600', '#ff86d0']
const OFFSETS = [0, 40, 60, 40, 0]

export default function App() {
  const { s, set, finish } = useStore()
  const [active, setActive] = useState<{ ci: number; step: number } | null>(null)
  const chapters = chaptersFor(s.cls)
  const key = (ci: number) => `${s.subject}:${s.cls}:${ci}`

  if (active) {
    const ch = chapters[active.ci]
    return (
      <Lesson
        key={Math.random()}
        gen={ch.gen}
        s={scale(s.cls, active.step)}
        title={ch.title}
        onExit={() => setActive(null)}
        onDone={(xp) => { finish(key(active.ci), active.step, xp); setActive(null) }}
      />
    )
  }

  return (
    <div className="app">
      <header>
        <select aria-label="Class" value={s.cls} onChange={(e) => set({ cls: +e.target.value })}>
          {CLASSES.map((n, i) => <option key={n} value={i}>{n}</option>)}
        </select>
        <span className="stat" title="Day streak">🔥 {s.streak}</span>
        <span className="stat" title="XP">⚡ {s.xp}</span>
      </header>

      <nav className="subjects">
        {SUBJECTS.map((x) => (
          <button key={x.id} disabled={x.soon} className={`chip ${s.subject === x.id ? 'on' : ''}`} onClick={() => set({ subject: x.id })}>
            {x.emoji} {x.name}{x.soon && <small> soon</small>}
          </button>
        ))}
      </nav>

      <main>
        {chapters.map((ch, ci) => {
          const color = COLORS[ci % COLORS.length]
          const done = s.done[key(ci)] || 0
          const unlocked = ci === 0 || (s.done[key(ci - 1)] || 0) >= LESSONS_PER_CHAPTER
          return (
            <section key={ch.title}>
              <div className="banner" style={{ background: color }}>
                <div><small>CHAPTER {ci + 1}</small><h3>{ch.title}</h3></div>
                <span className="emo">{ch.emoji}</span>
              </div>
              <div className="path">
                {Array.from({ length: LESSONS_PER_CHAPTER }, (_, step) => {
                  const open = unlocked && step <= done
                  const complete = step < done
                  return (
                    <button
                      key={step}
                      className={`node ${open ? '' : 'locked'}`}
                      style={{ marginLeft: OFFSETS[step], background: open ? color : undefined }}
                      disabled={!open}
                      aria-label={`${ch.title} lesson ${step + 1}`}
                      onClick={() => setActive({ ci, step })}
                    >
                      {complete ? '✓' : open ? '★' : '🔒'}
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}
