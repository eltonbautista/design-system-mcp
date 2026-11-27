## Summary

A container with a soft ledge for grouping related content: a title, optional media, text and actions. Cards aren't interactive by themselves. To make a whole card open something, pass `href`: the title becomes a link whose hit area covers the card, so there is still exactly one link to tab to and one name to announce. Don't nest cards.

## Pattern

No ARIA widget pattern: semantic HTML. Rendered as `<article>` by default (self-contained content), labelled by its title. Use `as="section"` for a titled region of a page, or `as="div"` when the card is purely visual. The whole-card link uses the [stretched link technique](https://inclusive-components.design/cards/) rather than wrapping everything in `<a>`, which would make screen readers read the entire card as the link name.

## Keyboard

| Key | Action |
| --- | --- |
| Tab / Shift+Tab | Moves through interactive content inside the card (and the title link when `href` is set). The card itself is not a tab stop. |
| Enter | Follows the title link when `href` is set. |

## Focus

With `href`, the 3px purple focus ring is drawn around the whole card while its title link has keyboard focus (`:has(:focus-visible)`), matching the clickable area. Without `href`, only the controls inside the card take focus.

## Screen reader

An article is announced with its title as the name, and the title is a heading at `headingLevel` (default 3) so cards appear in the page's heading outline. With `href`, the link's name is just the title, not the whole card's text. Give `media` images real `alt` text, or `alt=""` when decorative.
