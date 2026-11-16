import { useEffect, useLayoutEffect, useState } from 'react'
import { CLASSES, LESSONS_PER_CHAPTER, SUBJECTS, chaptersFor, scale } from './data'
import { MAX_HEARTS, day, useStore } from './store'
import { makeLesson, makeMix } from './questions'
import { dailyResult, lessonResult } from './xp'
import Lesson, { Burst } from './Lesson'
import SlideLesson from './SlideLesson'
import Login from './Login'
import { ACHIEVEMENTS } from './achievements'
import Splash, { WeekStrip } from './Splash'
import { Icon } from './Icon'
import Premium, { untilText } from './Premium'
import { DEMOTE, PROMOTE, SIZE, TIERS, board as leagueBoard, daysLeft, weekProgress } from './league'
import { SLIDE_LESSONS, SLIDE_XP } from './slides'

const COLORS = ['var(--sky)', 'var(--berry)', 'var(--grape)', 'var(--tang)', 'var(--lime-d)'] // chapter colours, from the palette in index.css
const NAME = 'Princesam' // shortcut: one hardcoded learner name, read it from the account when auth lands
const QUEST_XP = 30 // daily quest goal
const CHEST_XP = 20 // reward, stored as a best entry so totalXp picks it up
const OFFSETS = [-30, 20, 50, 10, -40]
const TABS = [['home', 'Home'], ['library', 'Library'], ['league', 'League'], ['friends', 'Friends'], ['profile', 'Profile']] as const
type Tab = (typeof TABS)[number][0]
// dummy friends; replace with a Supabase query later
const FRIENDS = [{ name: 'Aarav', e: '🦁', xp: 420, streak: 12 }, { name: 'Diya', e: '🦄', xp: 310, streak: 5 }, { name: 'Kabir', e: '🐼', xp: 150, streak: 2 }]

const Subjects = ({ cur, set }: { cur: string; set: (p: { subject: string }) => void }) => (
  <nav className="subjects">
    {SUBJECTS.map((x) => (
      <button key={x.id} disabled={x.soon} className={`chip ${cur === x.id ? 'on' : ''}`} onClick={() => set({ subject: x.id })}>
<Icon name={x.id} /> {x.name}{x.soon && <small> soon</small>}
      </button>
    ))}
  </nav>
)

const phoneDark = matchMedia('(prefers-color-scheme: dark)')
function useDark(theme: '' | 'light' | 'dark') {
  const [sys, setSys] = useState(phoneDark.matches)
  useEffect(() => { const f = () => setSys(phoneDark.matches); phoneDark.addEventListener('change', f); return () => phoneDark.removeEventListener('change', f) }, [])
  return theme ? theme === 'dark' : sys
}

export default function App() {
  const { s, set, finish, loseHeart, refillHearts, buyPremium } = useStore()
  const [tab, setTab] = useState<Tab>('home')
  const [active, setActive] = useState<{ ci: number; step: number; practice?: boolean } | 'daily' | null>(null)
  const [lib, setLib] = useState<{ ci: number; step?: number } | null>(null) // Library drill-down: chapter -> lesson
  const [badgeId, setBadgeId] = useState('') // achievement shown full screen
  const [pickCls, setPickCls] = useState(false) // profile class list open
  const [celebrate, setCelebrate] = useState(0) // new streak count, shown once after the day's first lesson
  const [page, setPage] = useState<'' | 'streak' | 'hearts' | 'premium'>('') // full-screen pages
  const [chest, setChest] = useState<'' | 'shut' | 'open'>('') // daily quest reward screen
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

  const earned = (a: (typeof ACHIEVEMENTS)[number]) => a.earned({ ...s, bestStreak: Math.max(s.bestStreak, s.streak) })
  // stamp the time each achievement is first seen earned, so the profile can show newest first
  const unstamped = ACHIEVEMENTS.filter((a) => earned(a) && !s.gotAt[a.id]).map((a) => a.id).join()
  useEffect(() => { if (unstamped) set({ gotAt: { ...s.gotAt, ...Object.fromEntries(unstamped.split(',').map((id) => [id, Date.now()])) } }) }, [unstamped]) // eslint-disable-line react-hooks/exhaustive-deps
  // earned newest first (same-time ties: harder ones, later in the list, first), then locked in list order
  const achs = ACHIEVEMENTS.map((a, i) => ({ a, i, t: earned(a) ? s.gotAt[a.id] || Infinity : 0 })).sort((x, y) => y.t - x.t || (x.t ? y.i - x.i : x.i - y.i))

  // theme on <html data-theme>: the profile switch if set, else the phone setting (kept live); layout effect so dark users never see a light flash
  const dark = useDark(s.theme)
  useLayoutEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light' }, [dark])

  if (!s.user) return <Login onLogin={(user) => set({ user })} />

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
    const slides = SLIDE_LESSONS[`${chapters[ci].gen}:${step}`]
    if (slides && !practice) return (
      <SlideLesson key={id} slides={slides} title={chapters[ci].title} hearts={s.hearts} nextHeartMs={s.nextHeartMs} onWrong={loseHeart} onRefill={refillHearts}
        award={(c, secs) => lessonResult(c, secs, s.best[id], slides.length * SLIDE_XP)}
        onExit={() => setActive(null)}
        onDone={(r) => { finish([key(ci)], r, { id, progress: { key: key(ci), step } }); finished() }} />
    )
    return <Lesson key={`${ci}:${step}`} hearts={s.hearts} nextHeartMs={s.nextHeartMs} onWrong={loseHeart} onRefill={refillHearts} title={chapters[ci].title}
      make={review ? mixOf(idx, 4) : () => makeLesson(chapters[ci].gen, scale(s.cls, step))}
      award={(c, secs) => lessonResult(c, secs, s.best[practice ? `practice:${id}` : id])} // practice keeps its own record, same rules as a lesson
      onExit={() => setActive(null)}
      onDone={(r) => { finish(review ? idx.map(key) : [key(ci)], r, practice ? { id: `practice:${id}` } : { id, progress: { key: key(ci), step } }); finished() }} />
  }

  if (celebrate) return (
    <Splash bubble={celebrate === 1 ? 'A new streak! Practice every day to help it grow.' : `${celebrate} days in a row! Keep it going.`}
      hero={<span className="flame">🔥</span>} big={String(celebrate)} caption="day streak"
      btn="I'm coming back" onClick={() => setCelebrate(0)}>
      <WeekStrip streak={celebrate} />
    </Splash>
  )

  const close = () => setPage('')
  if (page === 'streak') return (
    <Splash onClose={close} bubble={s.streak ? `${s.streak} day${s.streak > 1 ? 's' : ''} in a row! ${s.lastDay === day() ? 'You practiced today. See you tomorrow!' : 'Practice today to keep it going.'}` : 'Do a lesson today to start a new streak!'}
      hero={<span className="flame">🔥</span>} big={String(s.streak)} caption="day streak" dim={!s.streak}
      btn={s.lastDay === day() ? 'Keep learning' : 'Practice now'} onClick={() => { close(); setActive('daily') }}>
      <WeekStrip streak={s.streak} />
      <p className="fine">Longest streak: {Math.max(s.bestStreak, s.streak)} day{Math.max(s.bestStreak, s.streak) === 1 ? '' : 's'}</p>
    </Splash>
  )
  if (page === 'premium') return <Premium until={s.premiumUntil} plan={s.plan} onBuy={buyPremium} onClose={close} />
  if (page === 'hearts' && s.premium) return (
    <Splash onClose={close} bubble="You're Premium, so your hearts never run out!" hero="💖" big="∞" caption="Unlimited hearts" btn="Keep learning" onClick={close} />
  )
  if (page === 'hearts') {
    const full = s.hearts >= MAX_HEARTS
    return (
      <Splash onClose={close} bubble={full ? 'Your hearts are full. Go learn something!' : 'You lose a heart for each wrong answer. One comes back every hour.'}
        hero="❤️" big={`${s.hearts} / ${MAX_HEARTS}`} caption={full ? 'Full hearts' : `Next heart in ${Math.ceil(s.nextHeartMs / 6e4)} min`}
        btn={full ? 'Keep learning' : 'Watch ad: refill hearts'} onClick={full ? close : refillHearts}>
        <div className="heartrow" aria-hidden>{Array.from({ length: MAX_HEARTS }, (_, i) => <span key={i} className={i < s.hearts ? '' : 'off'}>❤️</span>)}</div>
        <button className="btn alt" onClick={() => setPage('premium')}>👑 Get unlimited hearts</button>
      </Splash>
    )
  }

  const chestId = `chest:${day()}`
  const claimed = !!s.best[chestId]
  const questDone = s.todayXp >= QUEST_XP
  if (chest) {
    const open = () => setChest('open')
    return (
      <Splash bubble={chest === 'open' ? 'Great job! Here is your reward.' : 'Daily quest complete! Tap the chest.'}
        hero={<span className={`chest ${chest}`} onClick={open}>{chest === 'open' ? '💎' : '🎁'}{chest === 'open' && <Burst loop />}</span>}
        big={chest === 'open' ? `+${CHEST_XP} XP` : 'Tap to open!'} btn={chest === 'open' ? 'Claim' : 'Open chest'}
        onClick={chest === 'shut' ? open : () => {
          finish([], { stars: 0, timeXp: 0, starXp: 0, gained: CHEST_XP, next: { xp: CHEST_XP, stars: 0 } }, { id: chestId })
          setChest('')
        }} />
    )
  }

  const badge = ACHIEVEMENTS.find((a) => a.id === badgeId)
  if (badge) return (
    <Splash bubble={earned(badge) ? 'You earned this badge. Well done!' : badge.desc} hero={badge.emoji} dim={!earned(badge)}
      big={badge.name} caption={earned(badge) ? badge.desc : 'Not earned yet'} btn="Continue" onClick={() => setBadgeId('')} />
  )

  const board = [...FRIENDS, { name: 'You', e: '🧑‍🚀', xp: s.xp, streak: s.streak }].sort((a, b) => b.xp - a.xp)
  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="app">
      {tab !== 'profile' && <header>
        <div className="cls">
          <span className="av">🧑‍🚀</span>
          <span><small>{hello}</small><b>{NAME}!</b></span>
        </div>
        <button className="stat" aria-label={`Day streak: ${s.streak}`} onClick={() => setPage('streak')}><span className="dot fire"><Icon name="flame" className="fill" /></span>{s.streak}</button>
        <button className="stat" aria-label={`Hearts: ${s.premium ? 'unlimited' : s.hearts}`} onClick={() => setPage('hearts')}><span className="dot heart"><Icon name="heart" className="fill" /></span>{s.premium ? '∞' : s.hearts}</button>
      </header>}

      <main key={tab} className={tab === 'home' ? 'world' : undefined}>
        {tab === 'home' && (
          <div className="hometop">
            <button className="daily" onClick={() => setActive('daily')}>
              <span className="tag">{nextSet < 0 ? 'Bonus set' : `Today · set ${nextSet + 1} of 3`}</span>
              <b>Daily practice</b>
              <small>{nextSet < 0 ? 'All 3 perfect! Extra practice, no XP' : 'Revises what you learned'}</small>
              <span className="setstars">{setStars.map((n, i) => <span key={i}>{n ? Array.from({ length: n }, (_, j) => <Icon key={j} name="star" className="c-star" />) : <Icon name="star" />}</span>)}</span>
              <span className="go">{nextSet < 0 ? 'Bonus round' : "Let's play"}</span>
              <span className="art" aria-hidden><Icon name="target" /></span>
            </button>
            {s.questHidden !== day() && <div className="qwrap">
            <button className={`quest ${claimed ? 'claimed' : ''}`} disabled={!questDone || claimed} onClick={() => setChest('shut')}>
              <span className={`qic ${questDone && !claimed ? 'wiggle' : ''}`}><Icon name={claimed ? 'done' : 'gift'} /></span>
              <span className="grow"><b>{claimed ? 'Quest complete!' : `Daily quest: earn ${QUEST_XP} XP`}</b>
                {claimed ? <><br /><small>New quest tomorrow</small></>
                  : <span className="qbar"><i style={{ width: `${Math.min(100, (s.todayXp / QUEST_XP) * 100)}%` }} /><em>{Math.min(s.todayXp, QUEST_XP)} / {QUEST_XP}</em></span>}</span>
              {questDone && !claimed && <span className="go">Open</span>}
            </button>
            {claimed && <button className="x qclose" aria-label="Hide quest card" onClick={() => set({ questHidden: day() })}><Icon name="close" /></button>}
            </div>}
            {!s.premium && <button className="gopro" onClick={() => setPage('premium')}>
              <span className="art" aria-hidden>👑</span>
              <span className="grow"><b>Go Premium</b><small>No ads · unlimited hearts · 10% to good causes</small></span>
              <Icon name="next" />
            </button>}
            <Subjects cur={s.subject} set={set} />
            <button className="jump" aria-label="Jump to current lesson" onClick={() => document.querySelector('.node.current')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}><Icon name="pin" className="c-red" /></button>
          </div>
        )}
        {tab === 'home' && <div className="trail">{chapters.map((ch, ci) => {
          const color = COLORS[ci % COLORS.length]
          const done = doneIn(ci)
          const unlocked = ci === 0 || doneIn(ci - 1) >= LESSONS_PER_CHAPTER
          return (
            <section key={ch.title} className="scene">
              <div className="banner" style={{ '--c': color } as React.CSSProperties}>
                <small>CHAPTER {ci + 1}</small><h3><Icon name={ch.gen} /> {ch.title}</h3>
              </div>
              <div className="path">
                {Array.from({ length: LESSONS_PER_CHAPTER }, (_, step) => {
                  const open = unlocked && step <= done
                  // book = teaching slides, question mark = chapter test (mixed review), pencil = practice questions
                  const type = step === REVIEW ? 'test' : SLIDE_LESSONS[`${ch.gen}:${step}`] ? 'lesson' : 'practice'
                  return (
                    <button
                      key={step}
                      className={`node ${open ? '' : 'locked'} ${unlocked && step === done ? 'current' : ''}`}
                      style={{ marginLeft: OFFSETS[step], background: open ? color : undefined }}
                      disabled={!open}
                      aria-label={`${ch.title} ${type} ${step + 1}${open ? '' : ' (locked)'}`}
                      onClick={() => setActive({ ci, step })}
                    >
                      <Icon name={type} />
                      <span className="nstars" aria-label={`${s.best[`${key(ci)}:${step}`]?.stars ?? 0} of 3 stars`}>
                        {[1, 2, 3].map((n) => <i key={n} className={n <= (s.best[`${key(ci)}:${step}`]?.stars ?? 0) ? 'on' : ''}>★</i>)}
                      </span>
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
              <div className="tiles">
                {chapters.map((ch, ci) => (
                  <button key={ch.title} className="tile" onClick={() => setLib({ ci })}>
                    <span className="art" style={{ '--c': COLORS[ci % COLORS.length] } as React.CSSProperties}><Icon name={ch.gen} /></span>
                    <b>{ch.title}</b>
                    <small>{doneIn(ci)} of {LESSONS_PER_CHAPTER} done</small>
                  </button>
                ))}
              </div>
            </>
          )
          const { ci, step } = lib
          const ch = chapters[ci]
          const open = (n: number) => (ci === 0 || doneIn(ci - 1) >= LESSONS_PER_CHAPTER) && n <= doneIn(ci)
          if (step === undefined) return (
            <>
              <button className="back" onClick={() => setLib(null)}><Icon name="prev" /> Chapters</button>
              <h2><Icon name={ch.gen} /> {ch.title}</h2>
              {Array.from({ length: LESSONS_PER_CHAPTER }, (_, n) => (
                <button key={n} className="row" disabled={!open(n)} onClick={() => setLib({ ci, step: n })}>
                  <span className="emo"><Icon name={n < doneIn(ci) ? 'done' : open(n) ? 'star' : 'lock'} className={n < doneIn(ci) ? 'c-ok' : open(n) ? 'c-star' : ''} /></span>
                  <span className="grow">Lesson {n + 1}{n === REVIEW && ' · Mixed review'}</span>
                  <Icon name="next" className="chev" />
                </button>
              ))}
            </>
          )
          return (
            <>
              <button className="back" onClick={() => setLib({ ci })}><Icon name="prev" /> {ch.title}</button>
              <h2>Lesson {step + 1}{step === REVIEW && ' · Mixed review'}</h2>
              <p className="fine">{step < doneIn(ci) ? 'Completed' : 'Not completed yet'}</p>
              <button className="btn big" onClick={() => setActive({ ci, step })}>{step < doneIn(ci) ? 'Replay lesson' : 'Start lesson'}</button>
              <h2>Practice</h2>
              <p className="fine">Same questions style. XP works like a lesson: speed + stars the first time, then more stars pay extra.</p>
              <button className="btn big alt" onClick={() => setActive({ ci, step, practice: true })}>Practice this lesson</button>
            </>
          )
        })()}

        {tab === 'league' && (() => {
          const t = TIERS[s.league]
          const rows = leagueBoard(s.week, s.league, s.weekXp, weekProgress())
          return (
            <>
              <div className="tier"><span>{t.emoji}</span><h2>{t.name} League</h2>
                <small>{s.league === TIERS.length - 1 ? 'Top league! Stay in the top 10.' : `Top ${PROMOTE} move up to ${TIERS[s.league + 1].name}`} · {daysLeft()} day{daysLeft() > 1 ? 's' : ''} left</small></div>
              {rows.map((e, i) => (
                <div key={e.name}>
                  {i === PROMOTE && <div className="zone">Stay in {t.name}</div>}
                  {i === SIZE - DEMOTE && s.league > 0 && <div className="zone bad">Demotion zone</div>}
                  <div className={`row ${e.me ? 'me' : ''}`}>
                    <span className={`rank ${i < PROMOTE ? 'up' : i >= SIZE - DEMOTE && s.league > 0 ? 'down' : ''}`}>{i + 1}</span>
                    <span className="grow">{e.me ? 'You' : e.name}</span><span><Icon name="bolt" className="c-star" /> {e.xp}</span>
                  </div>
                </div>
              ))}
            </>
          )
        })()}

        {tab === 'friends' && (
          <>
            <h2>Leaderboard</h2>
            {board.map((f, i) => (
              <div key={f.name} className={`row ${f.name === 'You' ? 'me' : ''}`}>
                <span className="rank">{i + 1}</span><span className="emo">{f.e}</span>
                <span className="grow">{f.name}</span><span><Icon name="flame" className="c-fire" /> {f.streak} · <Icon name="bolt" className="c-star" /> {f.xp}</span>
              </div>
            ))}
          </>
        )}

        {tab === 'profile' && (
          <div className="profile">
            <div className="pavatar" aria-hidden><span>🧑‍🚀</span></div>
            <h2>{NAME}</h2>
            {/* themed dropdown instead of a native <select>: the OS popup can't be coloured */}
            <div className="dd" onKeyDown={(e) => e.key === 'Escape' && setPickCls(false)}>
              <button className={`picker ${pickCls ? 'open' : ''}`} aria-haspopup="listbox" aria-expanded={pickCls} aria-controls="cls-list" onClick={() => setPickCls(!pickCls)}>
                <span className="pic"><Icon name="cap" /></span>
                <span className="grow"><small>My class</small><b>{CLASSES[s.cls]}</b></span>
                <Icon name="down" className="chev" />
              </button>
              {pickCls && <>
                <div className="dd-scrim" onClick={() => setPickCls(false)} />
                <ul id="cls-list" className="dd-menu" role="listbox" aria-label="My class" ref={(el) => el?.querySelector<HTMLElement>('[aria-selected=true]')?.scrollIntoView({ block: 'nearest' })}>
                  {CLASSES.map((n, i) => (
                    <li key={n} role="option" aria-selected={i === s.cls}>
                      <button autoFocus={i === s.cls} onClick={() => { set({ cls: i }); setPickCls(false) }}>{n}{i === s.cls && <Icon name="check" />}</button>
                    </li>
                  ))}
                </ul>
              </>}
            </div>
            <button className="gopro" onClick={() => setPage('premium')}>
              <span className="art" aria-hidden>👑</span>
              <span className="grow"><b>{s.premium ? 'Premium is on' : 'Go Premium'}</b><small>{s.premium ? `No ads · unlimited hearts · until ${untilText(s.premiumUntil)}` : 'No ads · unlimited hearts · 10% to good causes'}</small></span>
              <Icon name="next" />
            </button>
            <label className="setting">
              <span className="pic"><Icon name={dark ? 'moon' : 'sun'} /></span>
              <span className="grow"><b>Dark mode</b><small>{s.theme ? 'Your choice' : 'Following your phone'}</small></span>
              <input type="checkbox" role="switch" className="switch" checked={dark} onChange={(e) => set({ theme: e.target.checked ? 'dark' : 'light' })} />
            </label>
            <div className="pcards">
              <div className="pcard fire"><h3>{s.streak}</h3><p>Day streak</p><span><Icon name="flame" /></span></div>
              <div className="pcard zap"><h3>{s.xp}</h3><p>Total XP</p><span><Icon name="bolt" /></span></div>
              <div className="pcard cup"><h3>{TIERS[s.league].name}</h3><p>League</p><span>{TIERS[s.league].emoji}</span></div>
            </div>
            <h2>Achievements</h2>
            <div className="stickers">
              {achs.map(({ a, t }) => (
                <button key={a.id} className={`sticker ${t ? 'on' : ''}`} aria-label={`${a.name}${t ? '' : ' (locked)'}`} onClick={() => setBadgeId(a.id)}>
                  <span>{a.emoji}</span>
                </button>
              ))}
            </div>
            <button className="btn red" onClick={() => { set({ user: '' }); setTab('home') }}>Sign out</button>
          </div>
        )}
      </main>

      <nav className="tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? 'on' : ''} aria-label={label} aria-current={tab === id} onClick={() => setTab(id)}>
            <span><Icon name={id} /></span><small>{label}</small>
          </button>
        ))}
      </nav>
    </div>
  )
}
