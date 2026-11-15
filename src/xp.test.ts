import { expect, test } from 'vitest'
import { dailyResult, lessonResult, starsFor, timeXpFor, totalXp } from './xp'

test('stars thresholds', () => {
  expect([0, 1, 5, 6, 9, 10].map(starsFor)).toEqual([0, 1, 1, 2, 2, 3])
})

test('time XP = 100 - whole minutes, floored at 0', () => {
  expect([0, 59, 60, 600, 6000].map(timeXpFor)).toEqual([100, 100, 99, 90, 0])
})

test('first run pays time + stars; repeat only pays star upgrades, time XP stays', () => {
  const a = lessonResult(7, 600) // 2 stars in 10 min
  expect(a).toMatchObject({ timeXp: 90, starXp: 20, gained: 110, next: { xp: 90, stars: 2 } })
  const b = lessonResult(10, 60, a.next) // faster + perfect
  expect(b).toMatchObject({ timeXp: 0, starXp: 10, gained: 10, next: { xp: 90, stars: 3 } })
  const c = lessonResult(6, 30, b.next) // worse run never lowers anything
  expect(c).toMatchObject({ gained: 0, next: { xp: 90, stars: 3 } })
})

test('total is derived: first-run XP + 10 per best star', () => {
  expect(totalXp({ x: { xp: 90, stars: 3 }, y: { xp: 99, stars: 1 } })).toBe(90 + 30 + 99 + 10)
})

test('daily set: stars pay once and only upgrade; bonus set pays nothing', () => {
  const a = dailyResult(7) // 2 stars
  expect(a).toMatchObject({ gained: 20, next: { xp: 0, stars: 2 } })
  expect(dailyResult(10, a.next)).toMatchObject({ gained: 10, next: { xp: 0, stars: 3 } })
  expect(dailyResult(4, a.next).gained).toBe(0)
  expect(dailyResult(10, undefined, false)).toMatchObject({ stars: 3, gained: 0, next: undefined })
})
