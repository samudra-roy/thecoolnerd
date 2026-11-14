export type Q = { prompt: string; visual?: string; options?: string[]; answer: string }
// s = difficulty scale (grows with class and lesson step)
type Gen = (s: number) => Q

const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))
const pick = <T,>(a: T[]) => a[r(0, a.length - 1)]
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

// 4 distinct numeric options around the answer
function nums(ans: number, spread = 4): string[] {
  const set = new Set([ans])
  while (set.size < 4) set.add(ans + r(-spread, spread) || ans + spread + 1)
  return shuffle([...set].map(String))
}
const num = (prompt: string, ans: number, extra: Partial<Q> = {}): Q => ({
  prompt, answer: String(ans), options: nums(ans, Math.max(3, Math.round(Math.abs(ans) / 5))), ...extra,
})
const choice = (prompt: string, answer: string, wrong: string[], extra: Partial<Q> = {}): Q => ({
  prompt, answer, options: shuffle([answer, ...wrong]), ...extra,
})

const FRUIT = ['🍎', '🐱', '⭐', '🐠', '🚗', '🍪', '🦋', '🎈']

export const GENS: Record<string, Gen> = {
  count: (s) => {
    const n = r(1, Math.min(20, Math.round(3 + s * 2)))
    return num('How many?', n, { visual: pick(FRUIT).repeat(n) })
  },
  compare: (s) => {
    const m = Math.round(5 + s * 12)
    const a = r(0, m), b = (a + r(1, m)) % (m + 1) // never equals a
    const big = Math.random() < 0.5
    return choice(big ? 'Which number is bigger?' : 'Which number is smaller?',
      String(big ? Math.max(a, b) : Math.min(a, b)), [String(big ? Math.min(a, b) : Math.max(a, b))])
  },
  shapes: () => {
    const S: [string, string, number][] = [['🔺', 'triangle', 3], ['🟦', 'square', 4], ['⬠', 'pentagon', 5], ['⬡', 'hexagon', 6]]
    const [v, name, sides] = pick(S)
    return Math.random() < 0.5
      ? choice('What shape is this?', name, S.filter((x) => x[1] !== name).map((x) => x[1]), { visual: v })
      : num(`How many sides does a ${name} have?`, sides, { visual: v })
  },
  pattern: (s) => {
    const step = r(1, Math.min(10, Math.round(1 + s))), a = r(0, 10 + Math.round(s * 3))
    const ans = a + step * 3
    return num(`${a}, ${a + step}, ${a + 2 * step}, ?`, ans, { visual: '🧩' })
  },
  add: (s) => {
    const m = Math.round(4 + s * 8), a = r(1, m), b = r(1, m)
    return num(`${a} + ${b} = ?`, a + b)
  },
  sub: (s) => {
    const m = Math.round(4 + s * 8), a = r(2, m), b = r(1, a)
    return num(`${a} − ${b} = ?`, a - b)
  },
  mul: (s) => {
    const a = r(2, Math.min(12, Math.round(3 + s))), b = r(2, 12)
    return num(`${a} × ${b} = ?`, a * b)
  },
  div: (s) => {
    const b = r(2, Math.min(12, Math.round(3 + s))), q = r(2, 12)
    return num(`${b * q} ÷ ${b} = ?`, q)
  },
  fraction: () => {
    const d = pick([2, 3, 4, 5]), k = r(2, 6)
    const n = r(1, d - 1)
    return num(`${n}/${d} of ${d * k} = ?`, n * k)
  },
  percent: (s) => {
    const p = pick([10, 20, 25, 50, 75]), base = pick([40, 80, 100, 200, 120]) + (s > 8 ? 40 : 0)
    return num(`${p}% of ${base} = ?`, (p * base) / 100)
  },
  area: () => {
    const l = r(2, 12), w = r(2, 12)
    return Math.random() < 0.5
      ? num(`A rectangle is ${l} by ${w}. What is its area?`, l * w, { visual: '▭' })
      : num(`A rectangle is ${l} by ${w}. What is its perimeter?`, 2 * (l + w), { visual: '▭' })
  },
  roots: () => {
    const x = r(2, 15)
    return num(`√${x * x} = ?`, x)
  },
  linear: (s) => {
    const x = r(1, 12), a = r(2, Math.min(9, Math.round(2 + s / 2))), b = r(1, 20)
    return num(`Solve: ${a}x + ${b} = ${a * x + b}. x = ?`, x)
  },
  quadratic: () => {
    const p = r(1, 8), q = r(1, 8)
    return num(`Larger root of x² − ${p + q}x + ${p * q} = 0?`, Math.max(p, q))
  },
  ap: () => {
    const a = r(1, 10), d = r(2, 6), n = r(5, 12)
    return num(`AP: ${a}, ${a + d}, ${a + 2 * d}, … What is the ${n}th term?`, a + (n - 1) * d)
  },
  pythagoras: () => {
    const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10]])
    return num(`Right triangle with legs ${a} and ${b}. Hypotenuse = ?`, c, { visual: '📐' })
  },
  trig: () => {
    const T: [string, string][] = [['sin 30°', '1/2'], ['cos 60°', '1/2'], ['sin 90°', '1'], ['cos 0°', '1'], ['tan 45°', '1'], ['sin 0°', '0']]
    const [q, a] = pick(T)
    return choice(`${q} = ?`, a, ['0', '1/2', '1', '√3/2'].filter((x) => x !== a).slice(0, 3))
  },
  derivative: () => {
    const a = r(2, 9), n = r(2, 6)
    return num(`f(x) = ${a}x^${n}. What is f′(1)?`, a * n)
  },
  probability: () => {
    const red = r(1, 6), blue = r(1, 6)
    const g = (x: number, y: number): number => (y ? g(y, x % y) : x)
    const d = g(red, red + blue), ans = `${red / d}/${(red + blue) / d}`
    const wrong = [`${blue / g(blue, red + blue)}/${(red + blue) / g(blue, red + blue)}`, `${red}/${blue}`, `1/${red + blue}`]
    const uniq = [...new Set([...wrong, '1/2', '1/3', '2/3'])].filter((w) => w !== ans).slice(0, 3)
    return choice(`A bag has ${red} red and ${blue} blue balls. P(red) = ?`, ans, uniq, { visual: '🔴'.repeat(red) + '🔵'.repeat(blue) })
  },
}

// 10 questions per lesson
export const makeLesson = (gen: string, s: number): Q[] => Array.from({ length: 10 }, () => GENS[gen](s))
