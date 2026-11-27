## Summary

An on/off switch for a setting that takes effect immediately, like turning on reminders. If the choice is only applied when a form is submitted, use `CabCheckbox` instead: a switch promises an instant result.

## Pattern

[WAI-ARIA APG: Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/). A native `<button role="switch">` with `aria-checked`, labelled by a native `<label for>` so clicking the text also toggles it.

## Keyboard

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Moves focus to and from the switch. |
| Space | Toggles on/off. |
| Enter | Toggles on/off. |

## Focus

A 3px purple ring with a 3px offset around the track on keyboard focus. On/off is shown three ways: thumb position, track colour, and thumb colour, so it never depends on colour alone.

## Screen reader

Announced as "*label*, switch, on/off". With reduced motion, the thumb jumps instead of sliding; colour still changes so the state is just as clear.
