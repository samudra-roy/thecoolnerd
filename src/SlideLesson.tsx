import { useRef, useState } from 'react'
import type { Result } from './xp'
import { Burst, CountUp, End, Stars, Visual, clock } from './Lesson'
import { Icon } from './Icon'
import type { Slide } from './slides'

type Props = {
  slides: Slide[]
  title: string
  award: (firstTryCorrect: number, seconds: number) => Result
  hearts: number
  nextHeartMs: number
  onWrong: () => void
  onRefill: () => void
  onExit: () => void
  onDone: (r: Result) => void
}

export default function SlideLesson({ slides, title, award, hearts, nextHeartMs, onWrong, onRefill, onExit, onDone }: Props) {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState('')
  const [result, setResult] = useState<'' | 'ok' | 'bad'>('')
  const [hint, setHint] = useState(false)
  const [first, setFirst] = useState(0) // practice slides right on the first try
  const missed = useRef(false)
  const start = useRef(Date.now())
  const [endAt, setEndAt] = useState(0)
  const s = slides[i]
  const practices = slides.filter((x) => x.kind === 'practice').length

  if (hearts === 0) return (
    <End emoji="💔" head="Out of hearts!" btn="Not now" onClick={onExit} bad>
      <p>Next heart in {Math.ceil(nextHeartMs / 6e4)} min.</p>
      <button className="btn big" onClick={onRefill}><Icon name="play" /> Watch ad: refill hearts</button>
    </End>
  )
  if (!s) {
    const secs = Math.floor((endAt - start.current) / 1000)
    const r = award(Math.round((first / practices) * 10), secs) // stars scale is out of 10
    return (
      <End emoji={r.stars === 3 ? '🦉' : '🏆'} head={r.stars === 3 ? 'Perfect lesson!' : 'Lesson complete!'} btn="Claim XP" onClick={() => onDone(r)}>
        <div className="boxes">
          <div className="box xp"><small>XP</small><b><Icon name="bolt" className="c-star" /> <CountUp to={r.gained} /></b></div>
          <div className="box st"><small>STARS</small><b><Stars n={r.stars} /></b></div>
          <div className="box tm"><small>TIME</small><b>{clock(secs)}</b></div>
        </div>
        <p className="fine">Speed +{r.timeXp} · Slides +{r.slideXp ?? 0} · Stars +{r.starXp}</p>
      </End>
    )
  }

  const go = () => {
    if (i === slides.length - 1) setEndAt(Date.now())
    setI(i + 1); setPick(''); setResult(''); setHint(false); missed.current = false
  }
  const check = () => {
    if (s.kind !== 'practice' || !pick) return
    if (pick === s.answer) {
      setResult('ok')
      if (!missed.current) setFirst((f) => f + 1)
    } else {
      missed.current = true
      setResult('bad'); onWrong()
    }
  }

  return (
    <div className="lesson">
      <div className="lbar">
        <button className="x" aria-label="Quit lesson" onClick={onExit}><Icon name="close" /></button>
        <div className="pwrap">
          <div className="progress" role="progressbar" aria-label={title} aria-valuenow={i} aria-valuemax={slides.length}>
            <i style={{ width: `${(i / slides.length) * 100}%` }} />
          </div>
        </div>
        <span className={`hearts ${result === 'bad' ? 'hit' : ''}`}><Icon name="heart" /> {hearts === Infinity ? '∞' : hearts}</span>
      </div>

      <div className="qbody">
        {s.kind === 'explain' ? (
          <>
            <Visual v={s.visual} pop />
            <h2>{s.title}</h2>
            <p className="explain">{s.text}</p>
          </>
        ) : (
          <>
            <h2>{s.prompt}</h2>
            {s.visual && <Visual v={s.visual} />}
            <div className="opts">
              {s.options.map((o) => (
                <button key={o} className={`opt ${pick === o ? 'sel' : ''} ${pick === o ? result : ''}`} disabled={result === 'ok'} onClick={() => { setPick(o); setResult('') }}>{o}{pick === o && result === 'ok' && <Burst />}</button>
              ))}
            </div>
            <button className="back" onClick={() => setHint(true)}><Icon name="bulb" /> Hint</button>
            {hint && <p className="fine">{s.hint}</p>}
          </>
        )}
      </div>

      <div className={`foot ${result}`}>
        {result && <div className="msg">{result === 'ok' ? <><Icon name="done" /> Correct!</> : <><Icon name="close" /> Not quite, try again</>}</div>}
        {s.kind === 'explain' || result === 'ok'
          ? <button className="btn big" onClick={go}>Continue</button>
          : <button className={`btn big ${result === 'bad' ? 'red' : ''}`} disabled={!pick} onClick={check}>Check</button>}
      </div>
    </div>
  )
}
