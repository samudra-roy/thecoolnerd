export type Provider = 'google' | 'facebook'

// Nerdy owl mascot: glasses, a book, and doodles around it.
const Owl = () => (
  <svg viewBox="0 0 300 300" className="mascot" aria-hidden>
    <path d="M40 70c-20 10-10 40 10 30s0-40-20-20" fill="none" stroke="#2b2b2b" strokeWidth="3" strokeLinecap="round" />
    <path d="M250 60c15 0 20 20 5 25s-10-20 10-20 20 15 10 25" fill="none" stroke="#2b2b2b" strokeWidth="3" strokeLinecap="round" />
    <path d="M245 150l8 18 20 2-15 13 5 20-18-11-17 11 5-20-15-13 20-2z" fill="#ffd166" />
    <path d="M50 190l6 13 14 1-11 9 4 14-13-8-12 8 4-14-11-9 14-1z" fill="#ffd166" />
    <ellipse cx="150" cy="185" rx="78" ry="88" fill="#8a6bd1" />
    <ellipse cx="150" cy="205" rx="52" ry="62" fill="#c9b8f5" />
    <path d="M85 110l-10-45 40 25M215 110l10-45-40 25" fill="#8a6bd1" />
    <circle cx="120" cy="140" r="26" fill="#fff" stroke="#2b2b2b" strokeWidth="6" />
    <circle cx="180" cy="140" r="26" fill="#fff" stroke="#2b2b2b" strokeWidth="6" />
    <path d="M146 140h8" stroke="#2b2b2b" strokeWidth="6" />
    <circle cx="124" cy="142" r="9" fill="#2b2b2b" />
    <circle cx="184" cy="142" r="9" fill="#2b2b2b" />
    <path d="M142 168l8 12 8-12z" fill="#ff9f1c" />
    <rect x="98" y="215" width="104" height="58" rx="6" fill="#2b2b2b" />
    <path d="M150 218v52" stroke="#ffd166" strokeWidth="4" />
    <path d="M112 235h26M112 250h20M162 235h26M162 250h20" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

const G = () => (
  <svg viewBox="0 0 48 48" width="22" height="22" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
  </svg>
)

const F = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
    <path fill="currentColor" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
  </svg>
)

export default function Login({ onLogin }: { onLogin: (p: Provider) => void }) {
  return (
    <div className="login">
      <div className="top"><Owl /></div>
      <div className="sheet">
        <small>Welcome to The Cool Nerd</small>
        <h1>Learn maths in 5 fun minutes a day</h1>
        <p>Bite-size lessons, streaks and stars, from Nursery to Class 12.</p>
        {/* shortcut: sign-in is simulated locally, wire Supabase OAuth when the backend lands */}
        <button className="btn big social google" onClick={() => onLogin('google')}><G /> Continue with Google</button>
        <button className="btn big social fb" onClick={() => onLogin('facebook')}><F /> Continue with Facebook</button>
      </div>
    </div>
  )
}
