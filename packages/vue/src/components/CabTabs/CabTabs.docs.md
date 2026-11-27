## Summary

Tabs switch between related panels of content in the same place, like a workshop's schedule, venue and FAQ. Use them for peer content a person might compare, not for steps in a process or for site navigation.

## Pattern

[WAI-ARIA APG: Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) with roving tabindex. `role="tablist"` is named by the `label` prop; each `role="tab"` controls its `role="tabpanel"`, and each panel is labelled by its tab. Activation is automatic by default (selection follows focus); set `activation="manual"` when showing a panel is slow or expensive.

## Keyboard

| Key | Action |
| --- | --- |
| Tab | Moves focus into the tab list (to the selected tab), then to the panel. |
| → / ← | Moves to the next / previous tab, wrapping at the ends. Disabled tabs are skipped. |
| Home / End | Moves to the first / last enabled tab. |
| Enter / Space | Selects the focused tab (manual activation). |

## Focus

Only the selected tab is in the tab order (`tabindex="0"`); the others are `-1` and reached with the arrow keys. Panels are focusable (`tabindex="0"`) so keyboard users can reach panels without interactive content. Both show the 3px purple focus ring. If `modelValue` is unknown or points at a disabled tab, the first enabled tab is selected so focus always has somewhere to land.

## Screen reader

Announced as "*label*, tab, selected, 1 of 3". Disabled tabs carry `aria-disabled="true"` and stay visible so people know the option exists. Inactive panels use the `hidden` attribute and are not read.
