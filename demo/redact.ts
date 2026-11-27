/**
 * Makes a Claude Code stream-json transcript safe to commit:
 * the init event keeps only model, tools and MCP servers (no local plugins, skills, paths or ids),
 * and the home directory is replaced with ~ on every line.
 *   tsx demo/redact.ts <transcript.jsonl>   (rewrites the file in place)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

export function redactTranscript(text: string, home: string): string {
  return text
    .split('\n')
    .map(line => {
      if (!line.trim()) return line
      let out = line
      try {
        const e = JSON.parse(line) as Record<string, unknown>
        if (e.type === 'system' && e.subtype === 'init') {
          out = JSON.stringify({ type: e.type, subtype: e.subtype, model: e.model, tools: e.tools, mcp_servers: e.mcp_servers })
        }
      } catch { /* not JSON: still scrub paths */ }
      return out.split(home).join('~')
    })
    .join('\n')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2]
  if (!file) throw new Error('usage: tsx demo/redact.ts <transcript.jsonl>')
  writeFileSync(file, redactTranscript(readFileSync(file, 'utf8'), homedir()))
}
