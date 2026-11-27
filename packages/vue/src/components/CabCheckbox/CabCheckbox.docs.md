## Summary

A checkbox for an independent yes/no choice that takes effect later, usually when a form is submitted. For a setting that applies immediately, use `CabSwitch`. Group related checkboxes in a `<fieldset>` with a `<legend>`.

## Pattern

[WAI-ARIA APG: Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/), built on a native `<input type="checkbox">` so role, state and form submission come from the browser. The visible box is decorative and hidden from assistive tech.

## Keyboard

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Moves focus to and from the checkbox. |
| Space | Toggles checked state. |

## Focus

The 3px purple focus ring is drawn around the visible box (not the hidden input) on keyboard focus. The whole label is a click target, which gives a target well above 24×24px.

## Screen reader

Announced as "*label*, checkbox, checked/not checked". The hint is linked with `aria-describedby`. The component is controlled: the checked state shown always matches `modelValue`, so a parent that rejects a change never leaves the box out of sync.
