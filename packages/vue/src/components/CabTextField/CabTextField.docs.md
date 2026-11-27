## Summary

A single-line text input with a visible label, optional hint and error message. Use it for short free text such as names and email addresses. The label is always visible; placeholders are only for example values.

## Pattern

Native `<input>` with a `<label for>` association. Hint and error follow the [WAI form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/) and [validation](https://www.w3.org/WAI/tutorials/forms/notifications/) guidance.

## Keyboard

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Moves focus to and from the field. |
| Any character | Edits the value. |

## Focus

A 3px purple ring with a 3px offset on keyboard focus. The border also darkens on hover. Invalid fields keep a red border and add a drawn warning icon, so colour is never the only signal.

## Screen reader

Announced as "*label*, edit text", plus "required" and "invalid entry" when they apply. The hint and the error are linked with `aria-describedby` (hint first, then error), so both are read after the label. The required asterisk is hidden from assistive tech because the native `required` attribute already announces it.
