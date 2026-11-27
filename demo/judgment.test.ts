import { chromium, type Browser } from 'playwright'
import { judgmentChecks } from './judgment'

let browser: Browser
beforeAll(async () => { browser = await chromium.launch() })
afterAll(async () => { await browser.close() })

const check = async (name: string) => {
  const page = await browser.newPage()
  await page.goto(new URL(`./fixtures/judgment/${name}.html`, import.meta.url).href)
  const result = await judgmentChecks(page)
  await page.close()
  return result
}

test('good page: whole-card links done accessibly, switch for instant setting, checkbox for consent', async () => {
  expect(await check('good')).toEqual({
    trackCards: [
      { track: 'board', wholeCardClick: true, oneTabStop: true, conciseLinkName: true },
      { track: 'digital', wholeCardClick: true, oneTabStop: true, conciseLinkName: true },
      { track: 'larp', wholeCardClick: true, oneTabStop: true, conciseLinkName: true },
    ],
    trackCardsCorrect: 3,
    remindersControl: 'switch',
    conductControl: 'checkbox',
  })
})

test('bad page: wrapped card, click-only card, extra tab stops, checkbox for an instant setting', async () => {
  const r = await check('bad')
  expect(r.trackCards).toEqual([
    { track: 'board', wholeCardClick: true, oneTabStop: true, conciseLinkName: false },
    { track: 'digital', wholeCardClick: true, oneTabStop: false, conciseLinkName: false },
    { track: 'larp', wholeCardClick: false, oneTabStop: false, conciseLinkName: true },
  ])
  expect(r.trackCardsCorrect).toBe(0)
  expect(r.remindersControl).toBe('checkbox')
  expect(r.conductControl).toBe('checkbox')
})

test('works when run under tsx, as demo/score.ts runs it (no bundler helpers leak into the page)', async () => {
  const { execFileSync } = await import('node:child_process')
  const out = execFileSync('npx', ['tsx', new URL('./fixtures/judgment/run-under-tsx.ts', import.meta.url).pathname], { encoding: 'utf8' })
  expect(JSON.parse(out.trim().split('\n').at(-1)!).trackCardsCorrect).toBe(3)
}, 60_000)
