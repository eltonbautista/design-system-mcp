import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import registry from '../src/registry.json'
import { createServer } from '../src/server'
import type { Registry } from '../src/registry.types'

async function connect() {
  const server = createServer(registry as Registry)
  const client = new Client({ name: 'test', version: '0.0.0' })
  const [a, b] = InMemoryTransport.createLinkedPair()
  await Promise.all([server.connect(a), client.connect(b)])
  return client
}
type CallResult = { content: { type: string; text: string }[]; isError?: boolean }
const call = async (client: Client, name: string, args: Record<string, unknown> = {}) =>
  (await client.callTool({ name, arguments: args })) as CallResult
const json = (r: CallResult) => JSON.parse(r.content[0]!.text)

test('lists exactly 4 tools, each with a description', async () => {
  const { tools } = await (await connect()).listTools()
  expect(tools.map(t => t.name).sort()).toEqual(['get_component', 'get_tokens', 'get_usage_example', 'list_components'])
  for (const t of tools) expect(t.description!.length).toBeGreaterThan(30)
})

test('server reports its name', async () => {
  const client = await connect()
  expect(client.getServerVersion()?.name).toBe('cabinet-ds')
})

test('list_components returns 8 entries with name, description and import', async () => {
  const list = json(await call(await connect(), 'list_components'))
  expect(list).toHaveLength(8)
  expect(list[0]).toEqual({ name: 'CabButton', description: expect.any(String), import: "import { CabButton } from '@eltonbautista/vue'" })
})

test('get_component resolves "button", "Button", "CabButton" identically', async () => {
  const client = await connect()
  const [a, b, c] = await Promise.all(['button', 'Button', 'CabButton'].map(n => call(client, 'get_component', { name: n })))
  expect(json(a!).name).toBe('CabButton')
  expect(a!.content[0]!.text).toBe(b!.content[0]!.text)
  expect(b!.content[0]!.text).toBe(c!.content[0]!.text)
})

test('get_component returns props, a11y and example names without example code', async () => {
  const entry = json(await call(await connect(), 'get_component', { name: 'select' }))
  expect(entry.props.find((p: { name: string }) => p.name === 'options')).toBeDefined()
  expect(entry.types.join('')).toContain('CabSelectOption')
  expect(entry.a11y.keyboard).toContain('Escape')
  expect(entry.examples[0]).toEqual({ name: expect.any(String), description: expect.any(String) })
})

test('get_component "Buton" returns isError listing valid names', async () => {
  const r = await call(await connect(), 'get_component', { name: 'Buton' })
  expect(r.isError).toBe(true)
  expect(r.content[0]!.text).toContain('Unknown component "Buton"')
  expect(r.content[0]!.text).toContain('CabButton')
})

test('get_tokens category=color returns only color.* entries', async () => {
  const tokens = json(await call(await connect(), 'get_tokens', { category: 'color' }))
  expect(tokens.length).toBeGreaterThan(10)
  for (const t of tokens) expect(t.name.startsWith('color.')).toBe(true)
})

test('get_tokens query="primary" matches action.primary tokens (case-insensitive)', async () => {
  const names = json(await call(await connect(), 'get_tokens', { query: 'PRIMARY' })).map((t: { name: string }) => t.name)
  expect(names).toContain('color.action.primary.bg')
  expect(names.every((n: string) => n.includes('primary'))).toBe(true)
})

test('get_tokens with no args returns every token', async () => {
  const all = json(await call(await connect(), 'get_tokens'))
  expect(all).toHaveLength(registry.tokens.length)
})

test('get_tokens rejects an unknown category', async () => {
  const r = await call(await connect(), 'get_tokens', { category: 'sparkle' })
  expect(r.isError).toBe(true)
})

test('get_usage_example defaults to the first example', async () => {
  const ex = json(await call(await connect(), 'get_usage_example', { name: 'CabTabs' }))
  expect(ex.component).toBe('CabTabs')
  expect(ex.example).toBe(registry.components.find(c => c.name === 'CabTabs')!.examples[0]!.name)
  expect(ex.code).toContain("from '@eltonbautista/vue'")
})

test('get_usage_example errors on unknown example name with the valid names', async () => {
  const r = await call(await connect(), 'get_usage_example', { name: 'CabTabs', example: 'Nope' })
  expect(r.isError).toBe(true)
  expect(r.content[0]!.text).toContain('Basic')
})

test('setup imports reach the assistant: in server instructions and every get_component result', async () => {
  const client = await connect()
  expect(client.getInstructions()).toContain("import '@eltonbautista/vue/style.css'")
  const entry = json(await call(client, 'get_component', { name: 'button' }))
  expect(entry.setup).toContain("import '@eltonbautista/tokens/tokens.css'")
})
