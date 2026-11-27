export interface ComponentDocs {
  summary: string
  pattern: string
  keyboard: string
  focus: string
  screenReader: string
}

const SECTIONS = [
  ['summary', 'Summary'],
  ['pattern', 'Pattern'],
  ['keyboard', 'Keyboard'],
  ['focus', 'Focus'],
  ['screenReader', 'Screen reader'],
] as const

/**
 * Splits a `Cab<Name>.docs.md` file on its fixed `## ` headings.
 * Used by Storybook's docs page and by the MCP registry generator.
 */
export function parseDocsMd(md: string, fileName: string): ComponentDocs {
  const blocks = new Map<string, string>()
  for (const chunk of md.split(/^## /m).slice(1)) {
    const nl = chunk.indexOf('\n')
    const heading = (nl === -1 ? chunk : chunk.slice(0, nl)).trim()
    blocks.set(heading, nl === -1 ? '' : chunk.slice(nl + 1).trim())
  }
  const out = {} as ComponentDocs
  for (const [key, heading] of SECTIONS) {
    const body = blocks.get(heading)
    if (body === undefined) throw new Error(`Missing section "${heading}" in ${fileName}`)
    out[key] = body
  }
  return out
}

/** Storybook component description: the summary, then a full Accessibility section. */
export function docsDescription(md: string, fileName: string): string {
  const d = parseDocsMd(md, fileName)
  return [
    d.summary,
    '## Accessibility',
    `### Pattern\n\n${d.pattern}`,
    `### Keyboard\n\n${d.keyboard}`,
    `### Focus\n\n${d.focus}`,
    `### Screen reader\n\n${d.screenReader}`,
  ].join('\n\n')
}
