/** WCAG 2.x relative luminance contrast ratio for two #rrggbb colours. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
    if (!m) throw new Error(`Not a #rrggbb colour: ${hex}`)
    const n = parseInt(m[1]!, 16)
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
      const c = v / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * ch[0]! + 0.7152 * ch[1]! + 0.0722 * ch[2]!
  }
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}
