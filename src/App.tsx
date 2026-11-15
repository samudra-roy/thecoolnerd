import { useState } from 'react'
import { CLASSES, LESSONS_PER_CHAPTER, SUBJECTS, chaptersFor, scale } from './data'
import { day, useStore } from './store'
import { makeLesson, makeMix } from './questions'
import { dailyResult, lessonResult } from './xp'
import Lesson from './Lesson'

const COLORS = ['#58cc02', '#1cb0f6', '#ce82ff', '#ff9600', '#ff86d0']
const OFFSETS = [-30, 20, 50, 10, -40]
const TABS = [['home', '🏠', 'Home'], ['library', '📚', 'Library'], ['friends', '👫', 'Friends'], ['profile', '🙂', 'Profile']] as const
type Tab = (typeof TABS)[number][0]
// dummy friends; replace with a Supabase query later
const FRIENDS = [{ name: 'Aarav', e: '🦁', xp: 420, streak: 12 }, { name: 'Diya', e: '🦄', xp: 310, streak: 5 }, { name: 'Kabir', e: '🐼', xp: 150, streak: 2 }]

const Subjects = ({ cur, set }: { cur: string; set: (p: { subject: string }) => void }) => (
  <nav className="subjects">
    {SUBJECTS.map((x) => (
      <button key={x.id} disabled={x.soon} className={`chip ${cur === x.id ? 'on' : ''}`} onClick={() => set({ subject: x.id })}>
        {x.emoji} {x.name}{x.soon && <small> soon</small>}
      </button>
    ))}
  </nav>
)

export default function App() {
  const { s, set, finish, loseHeart, refillHearts } = useStore()
  const [tab, setTab] = useState<Tab>('home')
  const [active, setActive] = useState<{ ci: number; step: number; practice?: boolean } | 'daily' | null>(null)
  const [lib, setLib] = useState<{ ci: number; step?: number } | null>(null) // Library drill-down: chapter -> lesson
  const [celebrate, setCelebrate] = useState(0) // new streak count, shown once after the day's first lesson
  const chapters = chaptersFor(s.cls)
  const key = (ci: number) => `${s.subject}:${s.cls}:${ci}`
  const doneIn = (ci: number) => s.done[key(ci)] || 0
  const REVIEW = LESSONS_PER_CHAPTER - 1 // last node of each chapter mixes in older chapters
  // chapters not practiced for longer get picked more often (cap 8x)
  const weight = (ci: number) => { const l = s.last[key(ci)]; return 1 + (l ? Math.min(7, Math.round((Date.now() - +new Date(l)) / 864e5)) : 7) }
  const dailyId = (i: number) => `daily:${day()}:${i}`
  const setStars = [0, 1, 2].map((i) => s.best[dailyId(i)]?.stars ?? 0)
  const nextSet = setStars.findIndex((n) => n < 3) // -1 = all perfect, next one is a bonus set
  const mixOf = (idx: number[], boost = 0) => () => makeMix(idx.map((ci) => ({ gen: chapters[ci].gen, w: weight(ci) + (ci === idx[idx.length - 1] ? boost : 0) })), scale(s.cls, 2))

  const finished = () => { if (s.lastDay !== day()) setCelebrate(s.streak + 1); setActive(null) }

  if (active) {
    if (active === 'daily') {
      const started = chapters.map((_, ci) => ci).filter((ci) => doneIn(ci) > 0)
      const idx = started.length ? started : [0]
      return <Lesson key="daily" hearts={s.hearts} nextHeartMs={s.nextHeartMs} onWrong={loseHeart} onRefill={refillHearts} make={mixOf(idx)} title="Daily practice" onExit={() => setActive(null)}
        award={(c) => dailyResult(c, s.best[dailyId(nextSet)], nextSet >= 0)}
        onDone={(r) => { finish(idx.map(key), r, { id: nextSet >= 0 ? dailyId(nextSet) : undefined }); finished() }} />
    }
    const { ci, step, practice } = active
    const idx = Array.from({ length: ci + 1 }, (_, i) => i)
    const review = step === REVIEW
    const id = `${key(ci)}:${step}`
    return <Lesson key={`${ci}:${step}`} hearts={s.hearts} nextHeartMs={s.nextHeartMs} onWrong={loseHeart} onRefill={refillHearts} title={chapters[ci].title}
      make={review ? mixOf(idx, 4) : () => makeLesson(chapters[ci].gen, scale(s.cls, step))}
      award={(c, secs) => (practice ? dailyResult(c, undefined, false) : lessonResult(c, secs, s.best[id]))}
      onExit={() => setActive(null)}
      onDone={(r) => { finish(review ? idx.map(key) : [key(ci)], r, practice ? {} : { id, progress: { key: key(ci), step } }); finished() }} />
  }

  if (celebrate) return (
    <div className="lesson end">
      <div className="flame">🔥</div>
      <div className="bignum">{celebrate}</div>
      <h1>day streak</h1>
      <p>Come back tomorrow to keep it going!</p>
      <button className="btn big" onClick={() => setCelebrate(0)}>Continue</button>
    </div>
  )

  const board = [...FRIENDS, { name: 'You', e: '🧑‍🚀', xp: s.xp, streak: s.streak }].sort((a, b) => b.xp - a.xp)

  return (
    <div className="app">
      <header>
        <div className="cls">
          <span className="av">🧑‍🚀</span>
          <span><small>Welcome back</small><b>Princesam</b></span>
        </div>
        <span className="stat" title="Day streak">🔥 {s.streak}</span>
        <span className="stat" title="Hearts: +1 every 60 min">❤️ {s.hearts}</span>
      </header>

      <main className={tab === 'home' ? 'world' : undefined}>
        {tab === 'home' && (
          <>
            <button className="daily" onClick={() => setActive('daily')}>
              <span className="emo">🎯</span>
              <span className="grow"><b>Daily practice</b><br /><small>{nextSet < 0 ? 'All 3 perfect! Bonus set (no XP)' : `Set ${nextSet + 1} of 3 · revises what you learned`}</small><br />
                <small>{setStars.map((n) => (n ? '⭐'.repeat(n) : '☆')).join('  ·  ')}</small></span>
              <span className="go">{nextSet < 0 ? 'BONUS' : 'START'}</span>
            </button>
            <Subjects cur={s.subject} set={set} />
          </>
        )}
        {tab === 'home' && <div className="trail">{chapters.map((ch, ci) => {
          const color = COLORS[ci % COLORS.length]
          const done = doneIn(ci)
          const unlocked = ci === 0 || doneIn(ci - 1) >= LESSONS_PER_CHAPTER
          return (
            <section key={ch.title} className="scene">
              <div className="banner" style={{ background: color }}>
                <div><small>CHAPTER {ci + 1}</small><h3>{ch.title}</h3></div>
                <span className="emo">{ch.emoji}</span>
              </div>
              <div className="path">
                {Array.from({ length: LESSONS_PER_CHAPTER }, (_, step) => {
                  const open = unlocked && step <= done
                  return (
                    <button
                      key={step}
                      className={`node ${open ? '' : 'locked'} ${unlocked && step === done ? 'current' : ''}`}
                      style={{ marginLeft: OFFSETS[step], background: open ? color : undefined }}
                      disabled={!open}
                      aria-label={`${ch.title} lesson ${step + 1}`}
                      onClick={() => setActive({ ci, step })}
                    >
                      {step < done ? '✓' : open ? (step === REVIEW ? '🏋️' : '★') : '🔒'}
                    </button>
                  )
                })}
              </div>
            </section>
          )
        })}</div>}

        {tab === 'library' && (() => {
          if (!lib) return (
            <>
              <h2>Subject</h2>
              <Subjects cur={s.subject} set={set} />
              <h2>Chapters</h2>
              {chapters.map((ch, ci) => (
                <button key={ch.title} className="row" onClick={() => setLib({ ci })}>
                  <span className="emo">{ch.emoji}</span>
                  <span className="grow">{ch.title}</span>
                  <span>{doneIn(ci)}/{LESSONS_PER_CHAPTER}</span>
                </button>
              ))}
            </>
          )
          const { ci, step } = lib
          const ch = chapters[ci]
          const open = (n: number) => (ci === 0 || doneIn(ci - 1) >= LESSONS_PER_CHAPTER) && n <= doneIn(ci)
          if (step === undefined) return (
            <>
              <button className="back" onClick={() => setLib(null)}>‹ Chapters</button>
              <h2>{ch.emoji} {ch.title}</h2>
              {Array.from({ length: LESSONS_PER_CHAPTER }, (_, n) => (
                <button key={n} className="row" disabled={!open(n)} onClick={() => setLib({ ci, step: n })}>
                  <span className="emo">{n < doneIn(ci) ? '✅' : open(n) ? '⭐' : '🔒'}</span>
                  <span className="grow">Lesson {n + 1}{n === REVIEW && ' · Mixed review'}</span>
                  <span>›</span>
                </button>
              ))}
            </>
          )
          return (
            <>
              <button className="back" onClick={() => setLib({ ci })}>‹ {ch.title}</button>
              <h2>Lesson {step + 1}{step === REVIEW && ' · Mixed review'}</h2>
              <p className="fine">{step < doneIn(ci) ? 'Completed' : 'Not completed yet'}</p>
              <button className="btn big" onClick={() => setActive({ ci, step })}>{step < doneIn(ci) ? 'Replay lesson' : 'Start lesson'}</button>
              <h2>Practice</h2>
              <p className="fine">Same questions style, no XP. Good for warming up.</p>
              <button className="btn big alt" onClick={() => setActive({ ci, step, practice: true })}>Practice this lesson</button>
            </>
          )
        })()}

        {tab === 'friends' && (
          <>
            <h2>Leaderboard</h2>
            {board.map((f, i) => (
              <div key={f.name} className={`row ${f.name === 'You' ? 'me' : ''}`}>
                <span>{i + 1}</span><span className="emo">{f.e}</span>
                <span className="grow">{f.name}</span><span>🔥 {f.streak} · ⚡ {f.xp}</span>
              </div>
            ))}
          </>
        )}

        {tab === 'profile' && (
          <div className="profile">
            <div className="huge">🧑‍🚀</div>
            <h2>Little Learner</h2>
            <label className="row"><span className="grow">My class</span>
              <select aria-label="Class" value={s.cls} onChange={(e) => set({ cls: +e.target.value })}>
                {CLASSES.map((n, i) => <option key={n} value={i}>{n}</option>)}
              </select>
            </label>
            <div className="row"><span className="grow">Day streak</span>🔥 {s.streak}</div>
            <div className="row"><span className="grow">Total XP</span>⚡ {s.xp}</div>
            <div className="row"><span className="grow">Lessons done</span>{Object.values(s.done).reduce((a, b) => a + b, 0)}</div>
            <button className="btn red" onClick={() => { if (confirm('Erase all progress?')) { localStorage.clear(); location.reload() } }}>Reset progress</button>
          </div>
        )}
      </main>

      <nav className="tabs">
        {TABS.map(([id, icon, label]) => (
          <button key={id} className={tab === id ? 'on' : ''} aria-label={label} aria-current={tab === id} onClick={() => setTab(id)}>
            <span>{icon}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
