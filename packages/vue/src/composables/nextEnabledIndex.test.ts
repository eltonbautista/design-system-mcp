import { nextEnabledIndex } from './nextEnabledIndex'

const d = [false, true, false, false] // index 1 disabled

test('next/prev skip disabled items', () => {
  expect(nextEnabledIndex(d, 0, 'next', false)).toBe(2)
  expect(nextEnabledIndex(d, 2, 'prev', false)).toBe(0)
})
test('without wrap, stops at the ends', () => {
  expect(nextEnabledIndex(d, 3, 'next', false)).toBe(3)
  expect(nextEnabledIndex(d, 0, 'prev', false)).toBe(0)
})
test('with wrap, wraps around', () => {
  expect(nextEnabledIndex(d, 3, 'next', true)).toBe(0)
  expect(nextEnabledIndex(d, 0, 'prev', true)).toBe(3)
})
test('first/last ignore current', () => {
  expect(nextEnabledIndex([true, false, false, true], 2, 'first', false)).toBe(1)
  expect(nextEnabledIndex([true, false, false, true], 1, 'last', false)).toBe(2)
})
test('from no current (-1), next goes to first enabled', () => {
  expect(nextEnabledIndex([true, false], -1, 'next', false)).toBe(1)
})
test('empty or all-disabled lists return -1 without looping', () => {
  expect(nextEnabledIndex([], 0, 'next', true)).toBe(-1)
  expect(nextEnabledIndex([true, true], 0, 'next', true)).toBe(-1)
  expect(nextEnabledIndex([true, true], -1, 'last', false)).toBe(-1)
})
