import { useEffect, useRef, useState } from 'react'
import type { Q } from './questions'
import type { Result } from './xp'
import { Icon } from './Icon'

type Props = {
  make: () => Q[]
  title: string
  award: (firstTryCorrect: number, seconds: number) => Result
  hearts: number
  nextHeartMs: number
  onWrong: () => void
  onRefill: () => void
  onExit: () => void
  onDone: (r: Result) => void
}
// sparkle bits flying out of the parent's centre; `loop` keeps twinkling (end screens)
export const Burst = ({ loop }: { loop?: boolean }) => (
  <span className={`burst ${loop ? 'loop' : ''}`} aria-hidden>
    {Array.from({ length: 10 }, (_, i) => <i key={i} style={{ '--a': `${i * 36}deg`, '--i': i } as React.CSSProperties} />)}
  </span>
)
// number that ticks up from 0, like the XP box on Duolingo's end screen
export function CountUp({ to }: { to: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let v = 0
    const t = setInterval(() => { v = Math.min(to, v + Math.max(1, Math.ceil(to / 20))); setN(v); if (v >= to) clearInterval(t) }, 40)
    return () => clearInterval(t)
  }, [to])
  return <>{n}</>
}
// each space-separated group wraps as one unit, so "🍪🍪🍪 = 🍪🍪🍪" never splits a group across rows
export const Visual = ({ v, pop }: { v: string; pop?: boolean }) => (
  <div className={`visual ${pop ? 'pop' : ''}`} aria-hidden>{v.split(/\s+/).map((g, i) => <span key={i}>{g}</span>)}</div>
)
export const Stars = ({ n }: { n: number }) => <>{n ? Array.from({ length: n }, (_, i) => <Icon key={i} name="star" className="c-star" />) : '—'}</>
export const clock =(s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function Lesson({ make, title, award, hearts, nextHeartMs, onWrong, onRefill, onExit, onDone }: Props) {
  const [queue, setQueue] = useState<Q[]>(make)
  const [correct, setCorrect] = useState(0) // progress bar: includes retries
  const [first, setFirst] = useState(0) // right on the first try: drives stars
  const [combo, setCombo] = useState(0) // consecutive first-try answers
  const [pick, setPick] = useState('')
  const [result, setResult] = useState<'' | 'ok' | 'bad'>('')
  const start = useRef(Date.now())
  const [endAt, setEndAt] = useState(0)
  const [now, setNow] = useState(Date.now())
  const retried = useRef(new WeakSet<Q>())
  const q = queue[0]

  useEffect(() => {
    if (endAt) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [endAt])
  const secs = Math.floor(((endAt || now) - start.current) / 1000)

  if (hearts === 0) return <End emoji="💔" head="Out of hearts!" btn="Not now" onClick={onExit} bad>
    <p>Next heart in {Math.ceil(nextHeartMs / 6e4)} min.</p>
    <button className="btn big" onClick={onRefill}><Icon name="play" /> Watch ad: refill hearts</button>
  </End>
  if (!q) {
    const r = award(first, secs)
    return (
      <End emoji={r.stars === 3 ? '🦉' : '🏆'} head={r.stars === 3 ? 'Perfect lesson!' : 'Lesson complete!'} btn="Claim XP" onClick={() => onDone(r)}>
        <div className="boxes">
          <div className="box xp"><small>XP</small><b><Icon name="bolt" className="c-star" /> <CountUp to={r.gained} /></b></div>
          <div className="box st"><small>STARS</small><b><Stars n={r.stars} /></b></div>
          <div className="box tm"><small>TIME</small><b>{clock(secs)}</b></div>
        </div>
        <p className="fine">Speed +{r.timeXp} · Stars +{r.starXp}</p>
      </End>
    )
  }

  const check = () => {
    if (!pick || result) return
    const ok = pick.trim() === q.answer
    setResult(ok ? 'ok' : 'bad')
    if (ok) {
      setCorrect((c) => c + 1)
      if (!retried.current.has(q)) { setFirst((f) => f + 1); setCombo((c) => c + 1) } else setCombo(0)
    } else {
      retried.current.add(q)
      setCombo(0)
      onWrong()
    }
  }
  const next = () => {
    // wrong questions come back at the end, like Duolingo
    if (result === 'ok' && queue.length === 1) setEndAt(Date.now())
    setQueue((x) => (result === 'bad' ? [...x.slice(1), q] : x.slice(1)))
    setPick(''); setResult('')
  }

  return (
    <div className="lesson">
      <div className="lbar">
        <button className="x" aria-label="Quit lesson" onClick={onExit}><Icon name="close" /></button>
        <div className="pwrap">
          {combo >= 3 && <span className="combo">COMBO x{combo}</span>}
          <div className="progress" role="progressbar" aria-label={title} aria-valuenow={correct} aria-valuemax={10}>
            <i style={{ width: `${correct * 10}%` }} />
          </div>
        </div>
        <span className={`hearts ${result === 'bad' ? 'hit' : ''}`}><span className="time"><Icon name="clock" /> {clock(secs)}</span><Icon name="heart" /> {hearts === Infinity ? '∞' : hearts}</span>
      </div>

      <div className="qbody">
        <h2>{q.prompt}</h2>
        {q.visual && <Visual v={q.visual} />}
        {q.options ? (
          <div className="opts">
            {q.options.map((o) => (
              <button key={o} className={`opt ${pick === o ? 'sel' : ''} ${pick === o ? result : ''}`} disabled={!!result} onClick={() => setPick(o)}>{o}{pick === o && result === 'ok' && <Burst />}</button>
            ))}
          </div>
        ) : (
          <input className="ans" autoFocus value={pick} disabled={!!result} onChange={(e) => setPick(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && check()} />
        )}
      </div>

      <div className={`foot ${result}`}>
        {result && <div className="msg">{result === 'ok' ? <><Icon name="done" /> Correct!</> : <><Icon name="close" /> Correct answer: {q.answer}</>}</div>}
        <button className={`btn big ${result === 'bad' ? 'red' : ''}`} disabled={!pick && !result} onClick={result ? next : check}>
          {result ? 'Continue' : 'Check'}
        </button>
      </div>
    </div>
  )
}

export function End(p: { emoji: string; head: string; btn: string; onClick: () => void; bad?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`lesson end ${p.bad ? 'bad' : ''}`}>
      <div className="huge">{p.emoji}{!p.bad && <Burst loop />}</div>
      <h1>{p.head}</h1>
      {p.children}
      <button className={`btn big ${p.bad ? 'red' : ''}`} onClick={p.onClick}>{p.btn}</button>
    </div>
  )
}
