import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { resolveComponent } from './lookup'
import type { Registry } from './registry.types'

const CATEGORIES = ['color', 'space', 'radius', 'font', 'motion', 'shadow'] as const

const text = (value: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] })
const fail = (message: string) => ({ content: [{ type: 'text' as const, text: message }], isError: true })

/** Creates the Cabinet MCP server over a registry generated from the library source. */
export function createServer(registry: Registry, version = registry.version): McpServer {
  const server = new McpServer(
    { name: 'cabinet-ds', version },
    {
      instructions:
        `Cabinet is a Vue 3 component library (${registry.package}). Build UI only from its components and style ` +
        `with its CSS custom properties (--cab-*), never hard-coded colours. Call list_components first, then ` +
        `get_component for props/keyboard behaviour and get_usage_example for working code.`,
    },
  )

  server.registerTool('list_components', {
    title: 'List Cabinet components',
    description: 'Call this first to see which Cabinet components exist. Build UI only from these components; returns each name, a one-line description and the import statement.',
    annotations: { readOnlyHint: true },
  }, async () => text(registry.components.map(c => ({ name: c.name, description: c.description, import: c.import }))))

  server.registerTool('get_component', {
    title: 'Get a component\'s API and accessibility contract',
    description: 'Full API for one Cabinet component: props (types, defaults, required), events, slots, exported TypeScript interfaces, and its accessibility contract (pattern, keyboard map, focus, screen reader notes). Accepts "Button", "button" or "CabButton".',
    inputSchema: { name: z.string().describe('Component name, e.g. "CabSelect" or "select"') },
    annotations: { readOnlyHint: true },
  }, async ({ name }) => {
    const c = resolveComponent(registry, name)
    if ('error' in c) return fail(c.error)
    const { examples, ...rest } = c
    return text({ ...rest, examples: examples.map(e => ({ name: e.name, description: e.description })) })
  })

  server.registerTool('get_tokens', {
    title: 'Get design tokens',
    description: 'Cabinet design tokens as CSS custom properties. Use these (var(--cab-...)) for any custom styling instead of hard-coded values. Filter by category and/or a case-insensitive substring of the token name.',
    inputSchema: {
      category: z.enum(CATEGORIES).optional().describe('Token group: color, space, radius, font, motion or shadow'),
      query: z.string().optional().describe('Case-insensitive substring of the token name, e.g. "primary"'),
    },
    annotations: { readOnlyHint: true },
  }, async ({ category, query }) => {
    const q = query?.toLowerCase()
    return text(registry.tokens.filter(t =>
      (!category || t.name.split('.')[0] === category) && (!q || t.name.toLowerCase().includes(q))))
  })

  server.registerTool('get_usage_example', {
    title: 'Get a usage example',
    description: 'A complete, working Vue SFC showing how to use a Cabinet component (taken from the library\'s own tested examples). Defaults to the first example; get_component lists the example names.',
    inputSchema: {
      name: z.string().describe('Component name, e.g. "CabDialog"'),
      example: z.string().optional().describe('Example name from get_component; defaults to the first'),
    },
    annotations: { readOnlyHint: true },
  }, async ({ name, example }) => {
    const c = resolveComponent(registry, name)
    if ('error' in c) return fail(c.error)
    const ex = example ? c.examples.find(e => e.name.toLowerCase() === example.toLowerCase()) : c.examples[0]
    if (!ex) return fail(`Unknown example "${example}" for ${c.name}. Valid examples: ${c.examples.map(e => e.name).join(', ')}.`)
    return text({ component: c.name, example: ex.name, description: ex.description, code: ex.code })
  })

  return server
}
