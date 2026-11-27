# @eltonbautista/vue

## 0.1.1

### Patch Changes

- 9ab74ae: Fixes from the 0.1.0 review:
  
  - **CabDialog:** the exit animation now plays. The duration token `0.2s` had been read as 0.2ms. Reopening during the exit keeps the dialog open, and a native close (for example a forced Escape) now emits `update:open` `false`.
  - **CabTabs:** arrow keys keep focus and selection together after tabs are inserted.
  - **CabCard:** with `href`, other links and controls inside the card stay clickable.
  - **MCP:** the server's instructions and `get_component` now include the one-time CSS setup imports.
- Updated dependencies [9ab74ae]
  - @eltonbautista/tokens@0.1.1

## 0.1.0

### Minor Changes

- 3f3f19d: First release: Cabinet tokens, 8 accessible Vue 3 components (Button, TextField, Checkbox, Switch, Select, Tabs, Dialog, Card) and an MCP server with list_components, get_component, get_tokens and get_usage_example.

### Patch Changes

- Updated dependencies [3f3f19d]
  - @eltonbautista/tokens@0.1.0
