// Slide-lesson content. Plain JSON-shaped data so the future admin hub (Supabase) can store and serve it as-is.
export type Slide =
  | { kind: 'explain'; title: string; text: string; visual: string }
  | { kind: 'practice'; prompt: string; options: string[]; answer: string; hint: string; visual?: string }

export const SLIDE_XP = 2 // per slide, paid once on first completion

// Dummy lesson, keyed `${chapter gen}:${lesson index}`. Only this one is slide-based for now.
export const SLIDE_LESSONS: Record<string, Slide[]> = {
  'compare:0': [
    { kind: 'explain', title: 'Which one has more?', text: 'When we compare, we look at two groups and decide which has MORE and which has FEWER.', visual: '🍎🍎🍎 vs 🍎' },
    { kind: 'practice', prompt: 'Which group has more?', visual: '🐟🐟🐟🐟  vs  🐟🐟', options: ['4 fish', '2 fish'], answer: '4 fish', hint: 'Count each group. The bigger number means more.' },
    { kind: 'practice', prompt: 'Which group has fewer?', visual: '⭐⭐⭐  vs  ⭐⭐⭐⭐⭐', options: ['3 stars', '5 stars'], answer: '3 stars', hint: 'Fewer means the smaller number.' },
    { kind: 'practice', prompt: 'Which number is bigger?', options: ['7', '4'], answer: '7', hint: 'Count up: 4 comes before 7, so 7 is bigger.' },
    { kind: 'explain', title: 'Bigger and smaller', text: 'The numbers further along when we count are bigger. 9 is bigger than 6 because we say 6 first.', visual: '1 2 3 4 5 6 7 8 9' },
    { kind: 'practice', prompt: 'Which number is smaller?', options: ['8', '3'], answer: '3', hint: 'Which one do you say first when counting?' },
    { kind: 'practice', prompt: 'Pick the biggest number.', options: ['2', '9', '5'], answer: '9', hint: 'Find the one you say last when counting.' },
    { kind: 'explain', title: 'The same!', text: 'Sometimes two groups have the same amount. Then we say they are EQUAL.', visual: '🍪🍪🍪 = 🍪🍪🍪' },
    { kind: 'practice', prompt: 'Which two groups are equal?', options: ['🐱🐱 and 🐶🐶', '🐱 and 🐶🐶'], answer: '🐱🐱 and 🐶🐶', hint: 'Equal means the same number in each group.' },
    { kind: 'practice', prompt: 'Which is the biggest number?', options: ['6', '10', '8'], answer: '10', hint: 'Count up to each one. Which comes last?' },
  ],
}
