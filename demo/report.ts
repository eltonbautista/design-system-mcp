/**
 * Builds the README's demo table from demo/runs/<set>/<mode>[-n]/{score.json,transcript.jsonl}.
 *   pnpm demo:report   rewrites the block between <!-- demo:start --> and <!-- demo:end --> in README.md
 * Numbers come only from the run artifacts; nothing is typed by hand.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Score } from './score'

export interface RunSummary { mode: 'with' | 'without'; qualityPass: boolean; seconds: number; costUsd: number; nodeModulesReads: number; mcpCalls: number }
export interface ModeAggregate { trials: number; qualityPasses: number; avgSeconds: number; avgCostUsd: number; avgNodeModulesReads: number; avgMcpCalls: number }

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1)
const round = (n: number, d = 0) => Math.round(n * 10 ** d) / 10 ** d

export function aggregate(runs: RunSummary[]): Record<'with' | 'without', ModeAggregate> {
  const one = (mode: 'with' | 'without'): ModeAggregate => {
    const rs = runs.filter(r => r.mode === mode)
    return {
      trials: rs.length,
      qualityPasses: rs.filter(r => r.qualityPass).length,
      avgSeconds: round(avg(rs.map(r => r.seconds))),
      avgCostUsd: round(avg(rs.map(r => r.costUsd)), 3),
      avgNodeModulesReads: round(avg(rs.map(r => r.nodeModulesReads)), 1),
      avgMcpCalls: round(avg(rs.map(r => r.mcpCalls)), 1),
    }
  }
  return { without: one('without'), with: one('with') }
}

/**
 * A run passes on quality when every check is clean. `judged` turns on the judgment checks
 * (whole-card links, switch vs checkbox), which only apply to prompt 2.
 */
export function qualityPass(s: Score, judged: boolean): boolean {
  const base = s.buildOk && s.rawControls === 0 && s.unknownComponents.length === 0 && s.unknownProps.length === 0 &&
    (s.unknownTokens ?? []).length === 0 && s.hardcodedColors === 0 && s.axeViolations === 0
  if (!judged) return base
  const j = s.judgment
  return base && !!j && j.trackCardsCorrect === 3 && j.remindersControl === 'switch' && j.conductControl === 'checkbox'
}

export function summarizeRun(dir: string, mode: 'with' | 'without', judged: boolean): RunSummary {
  const s = JSON.parse(readFileSync(join(dir, 'score.json'), 'utf8')) as Score
  let seconds = 0, costUsd = 0, nodeModulesReads = 0, mcpCalls = 0
  for (const line of readFileSync(join(dir, 'transcript.jsonl'), 'utf8').split('\n')) {
    let e: { type?: string; duration_ms?: number; total_cost_usd?: number; message?: { content?: { type: string; name: string; input?: unknown }[] } }
    try { e = JSON.parse(line) } catch { continue }
    if (e.type === 'result') { seconds = (e.duration_ms ?? 0) / 1000; costUsd = e.total_cost_usd ?? 0 }
    if (e.type === 'assistant') for (const c of e.message?.content ?? []) {
      if (c.type !== 'tool_use') continue
      if (c.name.startsWith('mcp__')) mcpCalls++
      else if (JSON.stringify(c.input).includes('node_modules')) nodeModulesReads++
    }
  }
  return { mode, qualityPass: qualityPass(s, judged), seconds, costUsd, nodeModulesReads, mcpCalls }
}

const SETS: { dir: string; label: string; judged: boolean }[] = [
  { dir: 'v1', label: 'Prompt 1 (names the components), Sonnet', judged: false },
  { dir: 'v2', label: 'Prompt 2 (outcomes only), Sonnet', judged: true },
  { dir: 'v2-haiku', label: 'Prompt 2 (outcomes only), Haiku', judged: true },
]

export function table(root: string): string {
  const rows = [
    '| Run set | Mode | Trials | Clean on every quality check | Avg time | Avg cost | Avg `node_modules` reads | Avg MCP calls |',
    '|---|---|---|---|---|---|---|---|',
  ]
  for (const { dir, label, judged } of SETS) {
    const base = join(root, 'demo/runs', dir)
    if (!existsSync(base)) continue
    const runs = readdirSync(base)
      .filter(d => /^(with|without)(-\d+)?$/.test(d))
      .map(d => summarizeRun(join(base, d), d.startsWith('without') ? 'without' : 'with', judged))
    const a = aggregate(runs)
    for (const mode of ['without', 'with'] as const) {
      const m = a[mode]
      rows.push(`| ${label} | ${mode === 'with' ? '**with MCP**' : 'without MCP'} | ${m.trials} | ${m.qualityPasses} / ${m.trials} | ${m.avgSeconds}s | $${m.avgCostUsd.toFixed(3)} | ${m.avgNodeModulesReads} | ${m.avgMcpCalls} |`)
    }
  }
  return rows.join('\n')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const readme = join(root, 'README.md')
  const src = readFileSync(readme, 'utf8')
  if (!src.includes('<!-- demo:start -->')) throw new Error('README.md has no <!-- demo:start --> marker')
  writeFileSync(readme, src.replace(/<!-- demo:start -->[\s\S]*?<!-- demo:end -->/, `<!-- demo:start -->\n${table(root)}\n<!-- demo:end -->`))
  console.log(table(root))
}
