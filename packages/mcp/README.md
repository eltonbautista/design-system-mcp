# @eltonbautista/mcp

An MCP server that teaches AI coding assistants how to use the Cabinet Vue components (`@eltonbautista/vue`) correctly. Its data is generated from the library's own source (TypeScript types, tested examples, accessibility notes and design tokens), so it can't drift from the code.

## Use with Claude Code

```sh
claude mcp add cabinet -- npx -y @eltonbautista/mcp
```

## Tools

| Tool | What it returns |
| --- | --- |
| `list_components` | Every component with a one-line description and its import. |
| `get_component` | Props (types, defaults, required), events, slots, TypeScript interfaces, and the accessibility contract: pattern, keyboard map, focus and screen-reader notes. |
| `get_tokens` | Design tokens as `--cab-*` CSS custom properties, filterable by `category` and `query`. |
| `get_usage_example` | A complete, working Vue SFC for a component. |

MIT © Elton Bautista
