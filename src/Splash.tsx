import type { ReactNode } from 'react'
import { Icon } from './Icon'

// Full-screen celebration layout shared by the streak page and achievement pages.
export default function Splash(p: { bubble: string; hero: ReactNode; big: string; caption?: string; dim?: boolean; children?: ReactNode; btn: string; onClick: () => void; onClose?: () => void }) {
  return (
    <div className="splash">
      {p.onClose && <button className="x close" aria-label="Close" onClick={p.onClose}><Icon name="close" /></button>}
      <div className="bubble">{p.bubble}</div>
      <div className={`hero ${p.dim ? 'dim' : ''}`} aria-hidden>{p.hero}</div>
      <div className="num">{p.big}</div>
      {p.caption && <div className="cap">{p.caption}</div>}
      {p.children}
      <button className="btn big" onClick={p.onClick}>{p.btn}</button>
    </div>
  )
}

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
// Mon-Sun of this week; a day is checked if it falls inside the current streak (the last `streak` days up to today).
export function WeekStrip({ streak }: { streak: number }) {
  const now = new Date()
  const idx = (now.getDay() + 6) % 7 // 0 = Monday
  return (
    <div className="week">
      {DAYS.map((d, k) => {
        const ago = idx - k // days before today; negative = future
        const on = ago >= 0 && ago < streak
        return <div key={d} className={ago === 0 ? 'today' : ''}><small>{d}</small><i className={on ? 'on' : ''}>{on && <Icon name="check" />}</i></div>
      })}
    </div>
  )
}
