# Tokens ↔ Figma variables

Cabinet's tokens live as DTCG JSON in `packages/tokens/src/`. Figma's Variables REST API needs an Enterprise plan, so the link between the code and Figma runs through a variables **import/export plugin** that reads and writes DTCG JSON, not an API sync.

## One-time round trip (about 30 minutes)

1. **Duplicate the kit.** In Figma, duplicate the *Simple Design System* community file into your drafts.
2. **Install a plugin.** In the Figma Community, search for a variables plugin that supports **W3C DTCG JSON import and export**, and install it. Use the same plugin for both directions.
3. **Import the tokens.** Import `packages/tokens/src/primitives.tokens.json`, then `semantic.light.tokens.json`, into the file's variables. Check that the semantic collection aliases the primitives (for example, `color.action.primary.bg` → `palette.pink.600`).
4. **Take a screenshot.** Screenshot the Variables panel and save it as `docs/media/figma-variables.png`.
5. **Export.** Export the variables back to DTCG JSON, saving the file(s) in `packages/tokens/figma/`.
6. **Compare.**

   ```sh
   pnpm figma:compare
   ```

   The command prints `0 differences, 0 missing` when the round trip is lossless.

### Expected gaps

Figma variables hold colours, numbers, strings and booleans. A few token types may come back as strings, or not at all:

- **Shadow:** `shadow.ledge` is a composite value.
- **Easing:** `motion.easing.standard` is a cubic Bézier.
- **Font families:** these are lists.

The compare script lists these as `missing` instead of hiding them. Note any of them here once you've seen what your plugin does.

## Day-to-day flow (Figma first)

1. Edit a variable in Figma.
2. Export it with the plugin into `packages/tokens/figma/`.
3. Copy the changed values into `packages/tokens/src/*.tokens.json`, or replace those files if your plugin's export shape matches.
4. Run `pnpm --filter @eltonbautista/tokens test`. This rebuilds with Style Dictionary and checks AA contrast.
5. Run `pnpm figma:compare` and `pnpm registry`, then commit. A changeset publishes the new tokens.
