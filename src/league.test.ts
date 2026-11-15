import { expect, test } from 'vitest'
import { PROMOTE, SIZE, board, settle, weekKey } from './league'

test('board has 30 players, sorted, and is stable per week', () => {
  const a = board('2026-11-09', 0, 50, 1)
  expect(a).toHaveLength(SIZE)
  expect(a.map((e) => e.xp)).toEqual([...a.map((e) => e.xp)].sort((x, y) => y - x))
  expect(board('2026-11-09', 0, 50, 1)).toEqual(a)
})
test('settle: top 10 up, bottom 5 down, 0 XP stays, bounds hold', () => {
  expect(settle('w', 2, 99999)).toBe(3)
  expect(settle('w', 2, 1)).toBe(1)
  expect(settle('w', 0, 1)).toBe(0) // Bronze never demotes
  expect(settle('w', 2, 0)).toBe(2)
  expect(settle('w', 9, 99999)).toBe(9)
  expect(PROMOTE).toBe(10)
})
test('weekKey is a Monday', () => {
  expect(new Date(weekKey(+new Date('2026-11-15T12:00:00'))).getDay()).toBe(1)
})
