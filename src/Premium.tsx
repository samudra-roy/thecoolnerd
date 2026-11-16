import { useState } from 'react'
import { Icon } from './Icon'
import { Burst } from './Lesson'
import type { Plan } from './store'

// shortcut: fixed INR placeholder prices; load real per-region prices from the store's billing SDK before release
export const PLANS: Record<Plan, { label: string; price: number; months: number; unit: string }> = {
  monthly: { label: 'Monthly', price: 149, months: 1, unit: '/month' },
  semiannual: { label: '6 months', price: 699, months: 6, unit: ' for 6 months' },
  annual: { label: '12 months', price: 1199, months: 12, unit: '/year' },
}
const inr = (n: number) => '₹' + n.toLocaleString('en-IN')
const saving = (p: (typeof PLANS)[Plan]) => Math.round((1 - p.price / (PLANS.monthly.price * p.months)) * 100)
export const untilText = (t: number) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const TOPUPS = [50, 100, 500, 1000] // same INR top-ups lilcosmo offers
const PERKS = ['No ads, ever', 'Unlimited hearts: mistakes never stop a lesson', 'Practice as much as you like, every day']

export default function Premium({ until, plan, onBuy, onClose }: { until: number; plan: '' | Plan; onBuy: (p: Plan, months: number) => void; onClose: () => void }) {
  const [pick, setPick] = useState<Plan>('annual')
  const [thanks, setThanks] = useState(false)
  const [give, setGive] = useState(false) // second step: optional extra on top of the plan
  const [extra, setExtra] = useState(0)
  const [custom, setCustom] = useState<string | null>(null) // null = custom box closed
  const active = until > Date.now()
  const p = PLANS[pick]
  const add = custom === null ? extra : Math.min(Math.max(0, Math.round(Number(custom) || 0)), 100000)
  if (give) return (
    <div className="premium give">
      <button className="x close" aria-label="Back to plans" onClick={() => setGive(false)}><Icon name="prev" /></button>
      <div className="crown" aria-hidden>🌱</div>
      <h1><span className="pct">10%</span> of everything we receive goes to good causes first</h1>
      <ul className="perks causes">
        <li><span>📚</span>Kids who can't afford to study</li>
        <li><span>🐾</span>Injured and helpless animals</li>
        <li><span>💛</span>More small causes as we grow</li>
      </ul>
      <p className="fine">We're a very small team with a small app. Premium keeps The Cool Nerd alive and growing, and whatever we get, we first set 10% aside for those in need.</p>
      <h2>Would you like to add a little extra?</h2>
      <div className="topups">
        {TOPUPS.map((v) => (
          <button key={v} className={`chip ${custom === null && extra === v ? 'on' : ''}`} aria-pressed={custom === null && extra === v} onClick={() => { setCustom(null); setExtra(extra === v ? 0 : v) }}>+{inr(v)}</button>
        ))}
        <button className={`chip ${custom !== null ? 'on' : ''}`} aria-pressed={custom !== null} onClick={() => setCustom('')}>Custom</button>
      </div>
      {custom !== null && <input className="ans" autoFocus inputMode="numeric" maxLength={6} placeholder="Extra amount in ₹" aria-label="Extra amount in rupees" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))} />}
      <button className="btn big grape" onClick={() => { onBuy(pick, p.months); setGive(false); setThanks(true); setExtra(add) }}>Continue · {inr(p.price + add)}</button>
      <p className="fine">{add ? `${inr(p.price)} Premium + ${inr(add)} extra for good causes` : 'No extra? That is fine, Premium already helps.'}</p>
    </div>
  )
  return (
    <div className="premium">
      <button className="x close" aria-label="Close" onClick={onClose}><Icon name="close" /></button>
      <div className="crown" aria-hidden>👑{thanks && <Burst loop />}</div>
      <h1>{thanks ? 'Welcome to Premium!' : 'The Cool Nerd Premium'}</h1>
      {thanks && extra > 0 && <p className="impact">💛 Thank you for giving {inr(extra)} extra. It all goes to good causes.</p>}
      <ul className="perks">
        {PERKS.map((t) => <li key={t}><span className="dot"><Icon name="check" /></span>{t}</li>)}
      </ul>
      <p className="impact"><b>10%</b> of our earnings goes straight to doing good: children's education, caring for animals and more. You help just by being Premium.</p>
      {active ? (
        <div className="pstatus">
          <b>Premium is on</b>
          <small>{plan && PLANS[plan].label} plan · until {untilText(until)}</small>
        </div>
      ) : <>
        <div className="plans" role="radiogroup" aria-label="Choose a plan">
          {(Object.keys(PLANS) as Plan[]).map((k) => {
            const q = PLANS[k]
            return (
              <button key={k} role="radio" aria-checked={pick === k} className={`plan ${pick === k ? 'on' : ''}`} onClick={() => setPick(k)}>
                {k === 'annual' && <span className="best">Best value</span>}
                <small>{q.label}</small>
                <b>{inr(q.price)}</b>
                <span className="per">{q.months === 1 ? 'per month' : `≈ ${inr(Math.round(q.price / q.months))}/mo`}</span>
                {q.months > 1 && <em>Save {saving(q)}%</em>}
              </button>
            )
          })}
        </div>
        <button className="btn big grape" onClick={() => setGive(true)}>Start Premium · {inr(p.price)}{p.unit}</button>
        <p className="fine">Cancel anytime from your app store account.</p>
      </>}
    </div>
  )
}
