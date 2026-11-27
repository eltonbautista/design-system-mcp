## Summary

Choose one value from a short list (roughly 3 to 15 options). Use it when the options don't fit comfortably as radio buttons. For long or searchable lists, a different pattern is needed. The label is always visible; the placeholder only says nothing is selected yet.

## Pattern

[WAI-ARIA APG: Select-Only Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/). A `role="combobox"` element controls a `role="listbox"` popup. DOM focus never leaves the combobox; the highlighted option is conveyed with `aria-activedescendant`.

## Keyboard

| Key | Action |
| --- | --- |
| ↓ / ↑ / Enter / Space / Alt+↓ | Opens the list on the selected option (or the first option). |
| Home / End | Opens the list on the first / last option. |
| ↓ / ↑ (open) | Moves to the next / previous option, skipping disabled ones. Stops at the ends. |
| Home / End (open) | Moves to the first / last option. |
| Page Down / Page Up (open) | Moves 10 options. |
| Enter / Space / Alt+↑ (open) | Selects the highlighted option and closes. |
| Tab (open) | Selects the highlighted option, closes, and moves focus on. |
| Escape (open) | Closes without changing the value. |
| Letters | Opens the list and jumps to the next option starting with the typed text (500ms buffer). |

## Focus

The combobox shows the 3px purple focus ring. Inside the open list, the highlighted option gets a purple inset outline and a tinted background, so it's visible without relying on colour alone. Clicking an option returns focus to the combobox. Clicking elsewhere closes the list.

## Screen reader

Announced as "*label*, combobox, collapsed, *selected value*". When open, each highlighted option is read as "*option*, selected/not selected, 2 of 4". Disabled options stay in the list with `aria-disabled="true"` so people know they exist. Hint and error are linked with `aria-describedby`, and errors set `aria-invalid`.
