import { redactTranscript } from './redact'

const init = JSON.stringify({
  type: 'system', subtype: 'init', model: 'claude-haiku-5-5', cwd: '/Users/someone/project/demo/runs/v2/with-1',
  tools: ['Read', 'Write', 'mcp__cabinet__get_component'], mcp_servers: [{ name: 'cabinet', status: 'connected' }],
  plugins: [{ name: 'private-work-plugin', path: '/Users/someone/.claude/plugins/x' }], skills: ['secret-skill'],
  slash_commands: ['secret'], memory_paths: { auto: '/Users/someone/.claude/projects/x/memory/' }, session_id: 'abc',
})
const tool = JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Read', input: { file_path: '/Users/someone/project/demo/runs/v2/with-1/src/App.vue' } }] } })

test('keeps only model, tools and MCP servers from the init event', () => {
  const [first] = redactTranscript(`${init}\n${tool}\n`, '/Users/someone').split('\n')
  expect(JSON.parse(first!)).toEqual({
    type: 'system', subtype: 'init', model: 'claude-haiku-5-5',
    tools: ['Read', 'Write', 'mcp__cabinet__get_component'], mcp_servers: [{ name: 'cabinet', status: 'connected' }],
  })
})

test('replaces the home directory with ~ everywhere and leaves no private names', () => {
  const out = redactTranscript(`${init}\n${tool}\n`, '/Users/someone')
  expect(out).not.toContain('/Users/someone')
  expect(out).toContain('~/project/demo/runs/v2/with-1/src/App.vue')
  expect(out).not.toMatch(/private-work-plugin|secret-skill/)
})
