// Line icons (24px grid, stroked in currentColor). Sized 1em, so they take the font-size of where they sit.
const P = {
  home: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z',
  library: 'M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5m0-13c2-1.5 5-2 8-1.5v13c-3-.5-6 0-8 1.5m0-13v13',
  league: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5v1a3 3 0 0 0 3 3m8-4h3v1a3 3 0 0 1-3 3m-4 3v4m-4 3h8m-6-3h4',
  friends: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-6 9a6 6 0 0 1 12 0m1-9a3 3 0 1 0-1.5-5.6M17 14a5 5 0 0 1 4 6',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0',
  flame: 'M12 21a7 7 0 0 0 7-7c0-4-3-6.5-4.5-10-1 2.5-2 3.5-3.5 3.5C11 5.5 10 4 8.5 3 8.5 7.5 5 9.5 5 14a7 7 0 0 0 7 7zm0 0a3 3 0 0 0 3-3c0-2-1.5-3-3-5-1.5 2-3 3-3 5a3 3 0 0 0 3 3z',
  heart: 'M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z',
  bolt: 'M13 3 5 14h6l-1 7 8-11h-6z',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z',
  lock: 'M8 11V8a4 4 0 0 1 8 0v3M6 11h12v9H6zm6 4v2',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  done: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm-4-9 3 3 5-6',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  gift: 'M4 11h16v9H4zM3 7h18v4H3zm9 0v13m0-13C11 4 7 3 7 5.5S11 7 12 7s5-1 5-1.5S13 4 12 7',
  pin: 'M12 21s-6-6-6-11a6 6 0 0 1 12 0c0 5-6 11-6 11zm0-9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  dumbbell: 'M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-13v4l3 2',
  bulb: 'M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.3.3.5.6.5 1.1v1h6v-1c0-.5.2-.8.5-1.1A6 6 0 0 0 12 3z',
  // subjects (keyed by subject id)
  maths: 'M6 3h12v18H6zM9 6h6v3H9zm0 7h.01M12 13h.01M15 13h.01M9 17h.01M12 17h.01M15 17h.01',
  science: 'M9 3h6m-5 0v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M7 15h10',
  english: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zm0 13a3 3 0 0 1 3-3h11M9 8h6',
  cs: 'M5 6h14v9H5zM3 18h18M10 9l-2 1.5 2 1.5m4-3 2 1.5-2 1.5',
  // chapters (keyed by chapter gen)
  count: 'M12 7c-2-2-7-2-7 4 0 5 3 9 5 9 1 0 1.5-.5 2-.5s1 .5 2 .5c2 0 5-4 5-9 0-6-5-6-7-4zm0 0c0-2 1-3 3-4',
  compare: 'M12 4v16m-4 0h8M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zm14 0-3 6a3 3 0 0 0 6 0z',
  linear: 'M12 4v16m-4 0h8M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zm14 0-3 6a3 3 0 0 0 6 0z',
  shapes:'M7 3l5 8H2zm7 10h7v7h-7zM3.5 17.5a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0',
  pattern: 'M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z',
  add: 'M12 5v14M5 12h14',
  sub: 'M5 12h14',
  mul: 'M6 6l12 12M18 6 6 18',
  div: 'M5 12h14M12 7h.01M12 17h.01',
  fraction: 'M12 3 3 19c6 3 12 3 18 0zM10 12h.01M14 15h.01M11 17h.01',
  area: 'M3 17 17 3l4 4L7 21zM7 13l2 2m1-5 2 2m1-5 2 2',
  percent: 'M19 5 5 19M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  roots: 'M3 13h3l3 7 5-16h7',
  probability: 'M5 5h14v14H5zm4 4h.01M15 15h.01M12 12h.01',
  quadratic: 'M3 3v18h18M6 5c2 13 10 13 12 0',
  ap: 'M7 3v18M17 3v18M7 7h10M7 12h10M7 17h10',
  pythagoras: 'M4 20V4l16 16zm4-4v-4l4 4z',
  trig: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 0v18m0-14a5 5 0 0 1 0 10',
  derivative: 'M12 2c3 2 5 6 4 12H8C7 8 9 4 12 2zM8 14l-3 3 3 1m8-4 3 3-3 1m-6 0 2 4 2-4m-2-11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z',
}
export type IconName = keyof typeof P
// unknown name falls back to a star so a new chapter/subject never renders blank
export const Icon = ({ name, className = '' }: { name: string; className?: string }) => (
  <svg className={`i ${className}`} viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={P[name as IconName] ?? P.star} />
  </svg>
)
