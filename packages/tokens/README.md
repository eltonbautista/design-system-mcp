# @eltonbautista/tokens

Design tokens for Cabinet, built with Style Dictionary from DTCG JSON (exported from Figma variables).

```ts
import '@eltonbautista/tokens/tokens.css'          // :root { --cab-color-action-primary-bg: … }
import { tokens } from '@eltonbautista/tokens'     // { 'cab-color-action-primary-bg': '#d6146a', … }
import list from '@eltonbautista/tokens/tokens.json' // [{ name, cssVar, value, type, description }]
```

- **Semantic names only:** `color.action.primary.bg`, `space.4`, `radius.lg`, `motion.duration.base` and so on.
- **Contrast checked:** every text and background pair is tested against WCAG AA in CI.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, `--cab-motion-distance-press` becomes `0px`.

MIT © Elton Bautista
