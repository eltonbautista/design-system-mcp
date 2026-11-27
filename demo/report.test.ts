import { aggregate, qualityPass, type RunSummary } from './report'
import type { Score } from './score'

const run = (mode: 'with' | 'without', ok: boolean, secs: number, cost: number, reads: number): RunSummary => ({
  mode, qualityPass: ok, seconds: secs, costUsd: cost, nodeModulesReads: reads, mcpCalls: mode === 'with' ? 10 : 0,
})

test('aggregates trials per mode: pass count and averages', () => {
  const a = aggregate([run('without', true, 50, 0.2, 6), run('without', false, 70, 0.3, 4), run('with', true, 30, 0.1, 0)])
  expect(a.without).toEqual({ trials: 2, qualityPasses: 1, avgSeconds: 60, avgCostUsd: 0.25, avgNodeModulesReads: 5, avgMcpCalls: 0 })
  expect(a.with).toEqual({ trials: 1, qualityPasses: 1, avgSeconds: 30, avgCostUsd: 0.1, avgNodeModulesReads: 0, avgMcpCalls: 10 })
})

const clean: Score = {
  onlyLibraryComponents: true, rawControls: 0, unknownComponents: [], unknownProps: [], hardcodedColors: 0, cabUsages: 10,
  unknownTokens: [], buildOk: true, axeViolations: 0, axeRules: [],
  judgment: {
    trackCards: ['board', 'digital', 'larp'].map(track => ({ track, wholeCardClick: true, oneTabStop: true, conciseLinkName: true })),
    trackCardsCorrect: 3, remindersControl: 'switch', conductControl: 'checkbox',
  },
}

test('quality pass requires every check clean', () => {
  expect(qualityPass(clean, true)).toBe(true)
  expect(qualityPass({ ...clean, hardcodedColors: 1 }, true)).toBe(false)
  expect(qualityPass({ ...clean, unknownTokens: ['--cab-color-danger'] }, true)).toBe(false)
})

test('judged run sets fail when the judgment checks fail, even if every card check is false', () => {
  const allWrong: Score = {
    ...clean,
    judgment: {
      trackCards: ['board', 'digital', 'larp'].map(track => ({ track, wholeCardClick: false, oneTabStop: false, conciseLinkName: false })),
      trackCardsCorrect: 0, remindersControl: 'checkbox', conductControl: 'checkbox',
    },
  }
  expect(qualityPass(allWrong, true)).toBe(false)
  expect(qualityPass(allWrong, false)).toBe(true) // prompt 1 doesn't ask for track cards
})
