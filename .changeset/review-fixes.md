---
"@eltonbautista/vue": patch
"@eltonbautista/mcp": patch
"@eltonbautista/tokens": patch
---

Fixes from the 0.1.0 review:

- **CabDialog:** the exit animation now plays. The duration token `0.2s` had been read as 0.2ms. Reopening during the exit keeps the dialog open, and a native close (for example a forced Escape) now emits `update:open` `false`.
- **CabTabs:** arrow keys keep focus and selection together after tabs are inserted.
- **CabCard:** with `href`, other links and controls inside the card stay clickable.
- **MCP:** the server's instructions and `get_component` now include the one-time CSS setup imports.
