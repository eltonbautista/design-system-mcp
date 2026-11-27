export type Move = 'next' | 'prev' | 'first' | 'last'

/**
 * The index to move to from `current` among items, skipping disabled ones.
 * Returns -1 when no item is enabled. With `wrap`, next/prev wrap around the ends;
 * without it they stop at the last enabled item in that direction.
 */
export function nextEnabledIndex(disabled: readonly boolean[], current: number, move: Move, wrap: boolean): number {
  const n = disabled.length
  if (!disabled.some(d => !d)) return -1
  if (move === 'first') return disabled.findIndex(d => !d)
  if (move === 'last') return disabled.findLastIndex(d => !d)
  const step = move === 'next' ? 1 : -1
  let i = current
  for (let k = 0; k < n; k++) {
    i += step
    if (i >= n || i < 0) {
      if (!wrap) return current >= 0 && current < n && !disabled[current] ? current : nextEnabledIndex(disabled, -1, move === 'next' ? 'last' : 'first', false)
      i = (i + n) % n
    }
    if (!disabled[i]) return i
  }
  return current
}
