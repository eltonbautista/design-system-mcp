/**
 * Browser checks for decisions that TypeScript types can't make for you:
 * whole-card links done accessibly, switch vs checkbox, consent controls.
 */
import type { Page } from 'playwright'

export interface TrackCardResult { track: string; wholeCardClick: boolean; oneTabStop: boolean; conciseLinkName: boolean }
export interface Judgment {
  trackCards: TrackCardResult[]
  trackCardsCorrect: number
  remindersControl: 'switch' | 'checkbox' | 'button' | 'missing'
  conductControl: 'switch' | 'checkbox' | 'button' | 'missing'
}

const TRACKS = [
  { track: 'board', label: 'board' },
  { track: 'digital', label: 'digital' },
  { track: 'larp', label: 'live-action|larp' },
]

async function controlKind(page: Page, name: RegExp): Promise<Judgment['remindersControl']> {
  for (const role of ['switch', 'checkbox', 'button'] as const) {
    if (await page.getByRole(role, { name }).count()) return role
  }
  return 'missing'
}

export async function judgmentChecks(page: Page): Promise<Judgment> {
  const start = page.url()
  const trackCards: TrackCardResult[] = []
  for (const { track, label } of TRACKS) {
    // Runs in the page. No named functions in here: tsx's keepNames would inject a __name() helper the page lacks.
    const info = await page.evaluate(({ track, label, all }) => {
      const re = new RegExp(label, 'i')
      const candidates = [...document.querySelectorAll<HTMLElement>('.cab-card, article, [class*="card" i]')]
        .filter(el => re.test(el.textContent ?? ''))
        // Card containers only: <article>, or a class token that *ends* in "card" (not BEM parts like cab-card__body).
        .filter(el => el.tagName === 'ARTICLE' || [...el.classList].some(c => /card$/i.test(c)))
        .filter(el => { const r = el.getBoundingClientRect(); return r.width >= 100 && r.height >= 60 })
        .sort((a, b) => a.getBoundingClientRect().width * a.getBoundingClientRect().height - b.getBoundingClientRect().width * b.getBoundingClientRect().height)
      // Prefer the smallest card-like element that mentions only this track.
      const card = candidates.find(el => all.filter(l => new RegExp(l, 'i').test(el.textContent ?? '')).length === 1) ?? candidates[0]
      if (!card) return null
      card.scrollIntoView({ block: 'center' })
      const r = card.getBoundingClientRect()
      const focusSel = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
      const wrapping = card.closest('a[href]')
      const inner = [...card.querySelectorAll<HTMLElement>(focusSel)]
      const tabStops = inner.length + (wrapping ? 1 : 0) + (card.matches(focusSel) ? 1 : 0)
      const link = (wrapping as HTMLAnchorElement | null) ?? card.querySelector<HTMLAnchorElement>(`a[href*="tracks/${track}"]`)
      const name = link ? (link.getAttribute('aria-label') ?? link.textContent ?? '').replace(/\s+/g, ' ').trim() : ''
      return { x: r.left + 20, y: r.bottom - 12, tabStops, linkName: name }
    }, { track, label, all: TRACKS.map(t => t.label) })

    if (!info) { trackCards.push({ track, wholeCardClick: false, oneTabStop: false, conciseLinkName: false }); continue }
    // Click near the bottom-left of the card (body text, not the title) and see if it goes to the track page.
    await page.mouse.click(info.x, info.y)
    await page.waitForTimeout(250)
    const wholeCardClick = page.url().includes(`tracks/${track}`)
    if (page.url() !== start) await page.goto(start, { waitUntil: 'networkidle' })
    trackCards.push({
      track,
      wholeCardClick,
      oneTabStop: info.tabStops === 1,
      conciseLinkName: info.linkName.length > 0 && info.linkName.length <= 40,
    })
  }
  return {
    trackCards,
    trackCardsCorrect: trackCards.filter(c => c.wholeCardClick && c.oneTabStop && c.conciseLinkName).length,
    remindersControl: await controlKind(page, /remind/i),
    conductControl: await controlKind(page, /conduct/i),
  }
}
