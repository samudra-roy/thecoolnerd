export const CLASSES = ['Pre-Nursery', 'Nursery', 'LKG', 'UKG', ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)]

export const SUBJECTS = [
  { id: 'maths', name: 'Maths', emoji: '🧮' },
  { id: 'science', name: 'Science', emoji: '🔬', soon: true },
  { id: 'english', name: 'English', emoji: '📖', soon: true },
  { id: 'cs', name: 'Computer Science', emoji: '💻', soon: true },
]

export type Chapter = { title: string; emoji: string; gen: string }
const c = (title: string, emoji: string, gen: string): Chapter => ({ title, emoji, gen })

// Dummy syllabus (CBSE/NCERT-flavoured). Replace with a Supabase table later.
export const chaptersFor = (cls: number): Chapter[] => {
  if (cls <= 1) return [c('Counting', '🍎', 'count'), c('Bigger or Smaller', '⚖️', 'compare'), c('Shapes', '🔺', 'shapes')]
  if (cls <= 3) return [c('Counting', '🍎', 'count'), c('Numbers', '🔢', 'compare'), c('Patterns', '🧩', 'pattern'), c('Tiny Addition', '➕', 'add')]
  if (cls <= 5) return [c('Numbers', '🔢', 'compare'), c('Addition', '➕', 'add'), c('Subtraction', '➖', 'sub'), c('Patterns', '🧩', 'pattern'), c('Shapes', '🔺', 'shapes')]
  if (cls <= 8) return [c('Multiplication', '✖️', 'mul'), c('Division', '➗', 'div'), c('Fractions', '🍕', 'fraction'), c('Perimeter & Area', '📏', 'area'), c('Patterns', '🧩', 'pattern')]
  if (cls <= 11) return [c('Fractions', '🍕', 'fraction'), c('Percentages', '💯', 'percent'), c('Linear Equations', '⚖️', 'linear'), c('Squares & Roots', '√', 'roots'), c('Probability', '🎲', 'probability')]
  if (cls <= 13) return [c('Linear Equations', '⚖️', 'linear'), c('Quadratic Equations', '📈', 'quadratic'), c('Arithmetic Progressions', '🪜', 'ap'), c('Pythagoras', '📐', 'pythagoras'), c('Trigonometry', '🌗', 'trig')]
  return [c('Quadratic Equations', '📈', 'quadratic'), c('Arithmetic Progressions', '🪜', 'ap'), c('Trigonometry', '🌗', 'trig'), c('Derivatives', '🚀', 'derivative'), c('Probability', '🎲', 'probability')]
}

export const LESSONS_PER_CHAPTER = 5
// difficulty scale handed to question generators
export const scale = (cls: number, step: number) => 1 + cls * 0.8 + step * 0.4
