## Summary

An arcade-style button for actions. The glossy face presses down into its coloured base when activated. Use `primary` for the single main action on a view, `secondary` for supporting actions, and `ghost` for low-emphasis ones. Use a link, not a button, for navigation.

## Pattern

[WAI-ARIA APG: Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/). Rendered as a native `<button>`, so role, focus and activation come from the browser.

## Keyboard

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Moves focus to and from the button. |
| Enter | Activates the button. |
| Space | Activates the button. |

## Focus

A 3px purple ring (`--cab-color-focus-ring`) with a 3px offset appears on keyboard focus only (`:focus-visible`). A `loading` button stays focusable so focus is never lost mid-action; a `disabled` button is removed from the tab order by the browser.

## Screen reader

Announced as "*label*, button". While `loading`, `aria-busy="true"` is set and the spinner is hidden from assistive tech, so the label stays the accessible name. Disabled buttons are announced as dimmed/unavailable. Icon-only buttons are not supported: always give the button visible text.
