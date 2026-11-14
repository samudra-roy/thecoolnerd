import { expect, test } from 'vitest'
import { GENS } from './questions'

test('every generator yields a valid question at every difficulty', () => {
  for (const [name, gen] of Object.entries(GENS))
    for (let s = 1; s < 16; s += 2)
      for (let i = 0; i < 50; i++) {
        const q = gen(s)
        expect(q.options, name).toBeTruthy()
        expect(q.options).toContain(q.answer)
        expect(new Set(q.options).size, `${name} dup options`).toBe(q.options!.length)
        expect(q.answer).not.toMatch(/NaN|undefined|Infinity/)
      }
})
