import { useState } from 'react'
import { makeLesson, type Q } from './questions'

type Props = { gen: string; s: number; title: string; onExit: () => void; onDone: (xp: number) => void }

export default function Lesson({ gen, s, title, onExit, onDone }: Props) {
  const [queue, setQueue] = useState<Q[]>(() => makeLesson(gen, s))
  const [correct, setCorrect] = useState(0)
  const [hearts, setHearts] = useState(5)
  const [pick, setPick] = useState('')
  const [result, setResult] = useState<'' | 'ok' | 'bad'>('')
  const q = queue[0]

  if (hearts === 0) return <End emoji="💔" head="Out of hearts!" sub="Take a breath and try again." btn="Try again" onClick={onExit} bad />
  if (!q) {
    const xp = 10 + hearts * 2
    return <End emoji="🏆" head="Lesson complete!" sub={`+${xp} XP · ${hearts} ❤️ left`} btn="Continue" onClick={() => onDone(xp)} />
  }

  const check = () => {
    if (!pick || result) return
    const ok = pick.trim() === q.answer
    setResult(ok ? 'ok' : 'bad')
    if (ok) setCorrect((c) => c + 1)
    else setHearts((h) => h - 1)
  }
  const next = () => {
    // wrong questions come back at the end, like Duolingo
    setQueue((x) => (result === 'bad' ? [...x.slice(1), q] : x.slice(1)))
    setPick(''); setResult('')
  }

  return (
    <div className="lesson">
      <div className="lbar">
        <button className="x" aria-label="Quit lesson" onClick={onExit}>✕</button>
        <div className="progress" role="progressbar" aria-label={title} aria-valuenow={correct} aria-valuemax={10}>
          <i style={{ width: `${correct * 10}%` }} />
        </div>
        <span className="hearts">❤️ {hearts}</span>
      </div>

      <div className="qbody">
        <h2>{q.prompt}</h2>
        {q.visual && <div className="visual" aria-hidden>{q.visual}</div>}
        {q.options ? (
          <div className="opts">
            {q.options.map((o) => (
              <button key={o} className={`opt ${pick === o ? 'sel' : ''}`} disabled={!!result} onClick={() => setPick(o)}>{o}</button>
            ))}
          </div>
        ) : (
          <input className="ans" autoFocus value={pick} disabled={!!result} onChange={(e) => setPick(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && check()} />
        )}
      </div>

      <div className={`foot ${result}`}>
        {result && <div className="msg">{result === 'ok' ? '🎉 Nice one!' : `Correct answer: ${q.answer}`}</div>}
        <button className={`btn big ${result === 'bad' ? 'red' : ''}`} disabled={!pick && !result} onClick={result ? next : check}>
          {result ? 'Continue' : 'Check'}
        </button>
      </div>
    </div>
  )
}

function End(p: { emoji: string; head: string; sub: string; btn: string; onClick: () => void; bad?: boolean }) {
  return (
    <div className="lesson end">
      <div className="huge">{p.emoji}</div>
      <h1>{p.head}</h1>
      <p>{p.sub}</p>
      <button className={`btn big ${p.bad ? 'red' : ''}`} onClick={p.onClick}>{p.btn}</button>
    </div>
  )
}
