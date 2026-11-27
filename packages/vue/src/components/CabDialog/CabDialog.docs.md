## Summary

A modal dialog for a short task or a decision that must be made before going back to the page, like confirming a booking. Don't use it for content people may want to read alongside the page. Keep it short: a title, a sentence or a small form, and one or two actions.

## Pattern

[WAI-ARIA APG: Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Built on the native `<dialog>` opened with `showModal()`, which makes the rest of the page inert for free: it can't be clicked, focused or read while the dialog is open. Named by its title (`aria-labelledby`) and described by `description` (`aria-describedby`).

## Keyboard

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Moves between focusable elements inside the dialog, wrapping from last to first and first to last. |
| Escape | Closes the dialog (emits `update:open` `false`). |
| Enter / Space | Activates the focused button. |

## Focus

On open, focus moves to the first focusable element in the body; if there is none, it goes to the close button. Focus stays inside while the dialog is open. On close, focus returns to the element that opened it, or stays safely on the page if that element has since been removed. The close button and actions show the 3px purple focus ring.

## Screen reader

Announced as "*title*, dialog", followed by the description. The close button has a visually hidden text label (`closeLabel`, default "Close") and its icon is hidden from assistive tech. With reduced motion, the dialog fades instead of rising and scaling.
