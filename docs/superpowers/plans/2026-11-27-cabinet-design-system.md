# Cabinet Design System + MCP Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Vue 3 + TS library of 8 accessible "Arcade Cabinet" components, its Style Dictionary tokens, Storybook docs, and an MCP server generated from the library's own source, all published on npm, with a README demo of Claude Code with vs without the MCP.

**Architecture:**
- A pnpm workspace with three packages, built in this order: `tokens`, then `vue`, then `mcp`. There are also two apps: `docs` (Storybook) and a separate `demo/` folder that sits outside the workspace.
- A root `scripts/build-registry.ts` script reads the component sources (`vue-component-meta`), the `*.docs.md` notes, the example SFCs and the tokens JSON. It writes `packages/mcp/src/registry.json`, and the MCP server serves that file.
- Accessibility is built in-house and follows the WAI-ARIA APG patterns. It's tested in a real browser using Vitest browser mode and axe-core.

**Tech Stack:**
- Node 22 LTS and pnpm 10.
- Vue 3.5 (`useId`), Vite 7 in library mode, TypeScript 5.
- Style Dictionary 5 with DTCG JSON.
- Vitest 4 in browser mode (Playwright Chromium), `vitest-browser-vue` and `axe-core`.
- Storybook 10 (`@storybook/vue3-vite`, `addon-a11y`, `addon-vitest`, `addon-docs`).
- `@modelcontextprotocol/sdk` 1.x and `zod`, and `vue-component-meta`.
- ESLint 9 with `eslint-plugin-vue`, `typescript-eslint` and `eslint-plugin-vuejs-accessibility`.
- Changesets and GitHub Actions.
- Install the latest version of each that meets these floors.

**Spec:** `docs/superpowers/specs/2026-11-27-cabinet-design-system-design.md` · product brief: `PRODUCT.md`

## Global Constraints

- **npm scope.** The placeholder is `@cabinet-ds`. Task 14 swaps in the user's npm username before the first publish. Package names are `@cabinet-ds/tokens`, `@cabinet-ds/vue` and `@cabinet-ds/mcp`.
- **Components.** All components are prefixed `Cab`: CabButton, CabTextField, CabCheckbox, CabSwitch, CabSelect, CabTabs, CabDialog, CabCard. That's exactly 8, with no Tooltip and no Menu.
- **CSS custom properties** use the prefix `--cab-`. Components read tokens only through `var(--cab-…)`. No hex values in component styles.
- **Colours:**
  - ground cream `#FFF6EC`, white surfaces, ink `#24163F`;
  - pink `#FF3D8B` (primary family), cyan `#2DD4E8` (secondary), purple `#6C2BD9` (focus and active), yellow `#FFE14D` (highlight);
  - a pink background behind white text must be ≥4.5:1, so use `#D6146A`.
- **Fonts:** display is Sora, interface and body is Outfit. No monospace in the components.
- **Shapes:** corner radii are 10, 14 and 20px, plus a pill (999px). The signature is glossy buttons with a coloured base that they press 3–4px down into.
- **Motion:**
  - `instant` 120ms, `base` 200ms, `overlay` 300ms (enter), `exit` 200ms;
  - easing `cubic-bezier(0.16, 1, 0.3, 1)`, with no bounce or elastic curves;
  - hover never moves the element;
  - with `prefers-reduced-motion: reduce`, movement is 0 and colour and opacity transitions stay.
- **Accessibility:** WCAG 2.1 AA. Every component is fully usable by keyboard, has a visible focus ring (`--cab-color-focus-ring`, 3px, offset 3px), and passes axe with zero violations in every example.
- **GSAP is never a dependency of `@cabinet-ds/vue`.**
- **No "terminal" styling:** no monospace interface text and no `//` labels.
- **Commit messages** follow Conventional Commits and end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Several instances of one component on a page:** each gets unique ids from `useId()`, so `for`, `aria-describedby`, `aria-controls` and `aria-activedescendant` never collide. Tested in Tasks 4, 8 and 7.
2. **Select with unusual data:** no options, every option disabled, or a `modelValue` that isn't in `options`. It shows the placeholder, doesn't throw, and arrow keys skip disabled options without looping forever. Tested in Task 8.
3. **Tabs with a bad selection:** the `modelValue` is unknown or points at a disabled tab. It falls back to the first enabled tab, and arrow keys skip disabled tabs. Tested in Task 7.
4. **Dialog closed with Escape, or opened from a trigger that has since left the DOM:** it emits `update:open` `false`. Focus returns to the trigger if it's still connected; otherwise nothing throws. Tested in Task 9.
5. **MCP lookups by a loose name** (`button`, `Button`, `CabButton`) resolve. A miss (`Buton`) returns `isError` with the valid names and doesn't crash the server. Tested in Task 12.

---

## Day 1: Library

### Task 1: Workspace + tokens package

**Files:**
- Create:
  - root: `package.json`, `pnpm-workspace.yaml` (`packages/*`, `apps/*`), `.npmrc`, `.nvmrc` (`22`), `tsconfig.base.json` (strict, `moduleResolution: bundler`), `eslint.config.js`
  - tokens sources: `packages/tokens/package.json`, `packages/tokens/src/primitives.tokens.json`, `packages/tokens/src/semantic.light.tokens.json`
  - tokens build: `packages/tokens/style-dictionary.config.mjs`, `packages/tokens/contrast-pairs.json`, `packages/tokens/fonts.css`
- Test: `packages/tokens/test/tokens.test.ts`

**Interfaces:**
- Produces build outputs in `packages/tokens/dist/`:
  - `tokens.css`: a `:root{…}` block, plus a `@media (prefers-reduced-motion: reduce){:root{…}}` block.
  - `tokens.js` and `tokens.d.ts`: `export const tokens: Record<string, string>`, keyed by CSS var name without `--`.
  - `tokens.json`: `Array<{ name: string /* "color.action.primary.bg" */; cssVar: string /* "--cab-color-action-primary-bg" */; value: string; type: string; description?: string }>`
- Produces package exports: `"."` → `tokens.js`, `"./tokens.css"`, `"./tokens.json"`, `"./fonts.css"`. `fonts.css` imports `@fontsource-variable/sora` and `@fontsource-variable/outfit`.
- Produces the semantic token names every later task uses. Write them as DTCG, with each value aliasing a primitive:
  - **Colour, backgrounds and text:**
    - `color.bg.canvas` = `#FFF6EC`, `color.bg.surface` = `#FFFFFF`, `color.bg.sunken` = `#F6E8D8`
    - `color.text.default` = `#24163F`, `color.text.muted` = `#6E5F86`
    - `color.text.on-primary` = `#FFFFFF`, `color.text.on-secondary` = `#24163F`
  - **Colour, actions and states:**
    - `color.action.primary.bg` = `#D6146A`, `color.action.primary.base` = `#8E0B45`
    - `color.action.secondary.bg` = `#2DD4E8`, `color.action.secondary.base` = `#138A99`
    - `color.state.active.bg` = `#6C2BD9`, `color.state.active.base` = `#3F1488`
    - `color.highlight.bg` = `#FFE14D`, `color.highlight.base` = `#C9A800`
    - `color.focus.ring` = `#6C2BD9`, `color.border.default` = `#EAD9C6`, `color.border.strong` = `#6E5F86`
    - `color.danger.text` = `#B4002A`, `color.shadow.ledge` = `#F0DCC6`
  - **Space:** `space.1`…`space.8` = 4, 8, 12, 16, 20, 24, 32, 40 px.
  - **Radius:** `radius.sm` 10px, `radius.md` 14px, `radius.lg` 20px, `radius.pill` 999px.
  - **Font:**
    - `font.family.display` `"Sora Variable", sans-serif` and `font.family.body` `"Outfit Variable", sans-serif`
    - `font.size.sm`/`md`/`lg`/`xl`/`2xl` = 14, 16, 18, 22, 28 px
    - `font.weight.regular`/`medium`/`bold`/`heavy` = 400, 500, 700, 800
  - **Motion:**
    - `motion.duration.instant` 120ms, `base` 200ms, `overlay` 300ms, `exit` 200ms
    - `motion.easing.standard` `cubic-bezier(0.16, 1, 0.3, 1)`
    - `motion.distance.press` 4px. The reduced-motion block sets it to `0px`.
  - **Shadow:** `shadow.ledge` `0 6px 0 var(--cab-color-shadow-ledge)`
- Produces `contrast-pairs.json` as `Array<[fg: string, bg: string, min: number]>`, using the semantic names. It covers every text-on-bg pair above (4.5), plus `color.focus.ring` on `color.bg.canvas` and on `color.bg.surface` (3.0).

- [ ] **Step 1: Scaffold the root workspace and the tokens package**
  - Root scripts: `build` (`pnpm -r build`), `test` (`pnpm -r test`), `lint` (`eslint .`), `typecheck` (`pnpm -r typecheck`).
  - Tokens scripts: `build` (`style-dictionary build --config style-dictionary.config.mjs`), `test` (`vitest run`).
  - Install: `pnpm add -Dw typescript eslint typescript-eslint eslint-plugin-vue eslint-plugin-vuejs-accessibility vitest`, and in tokens `style-dictionary @fontsource-variable/sora @fontsource-variable/outfit`.
  - Run: `pnpm install`. Expected: no errors.

- [ ] **Step 2: Write the failing test** `packages/tokens/test/tokens.test.ts`

```ts
import { readFileSync } from 'node:fs'
import pairs from '../contrast-pairs.json'
import tokens from '../dist/tokens.json'
const css = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8')
const byName = new Map(tokens.map(t => [t.name, t.value]))

test('emits prefixed custom properties', () => {
  expect(css).toContain('--cab-color-action-primary-bg: #d6146a')
  expect(css).toContain('--cab-motion-easing-standard: cubic-bezier(0.16, 1, 0.3, 1)')
})
test('reduced motion zeroes movement only', () => {
  expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*{\s*:root\s*{[^}]*--cab-motion-distance-press: 0px/)
  expect(css.match(/prefers-reduced-motion[\s\S]*$/)![0]).not.toContain('duration')
})
test.each(pairs)('%s on %s meets %d:1', (fg, bg, min) => {
  expect(contrastRatio(byName.get(fg)!, byName.get(bg)!)).toBeGreaterThanOrEqual(min)
})
test('no SDS naming leaks into output', () => {
  expect(css).not.toMatch(/--sds-/)
})
```

  `contrastRatio(hexA, hexB): number` is the WCAG 2.x relative-luminance formula, kept in `test/contrast.ts`.

- [ ] **Step 3: Run it.** `pnpm --filter @cabinet-ds/tokens test` → FAIL (`dist/tokens.json` missing).

- [ ] **Step 4: Write the token JSON and the Style Dictionary config**
  - **DTCG sources:** `$value`/`$type`, with `{color.pink.600}`-style aliases into `primitives`. Name the primitive palette with our own names: `pink`, `cyan`, `purple`, `yellow`, `cream`, `ink`, `red`.
  - **Config:** platforms `css` (`css/variables`, `outputReferences: false`, prefix `cab`), `js` (`javascript/es6` plus types), and a custom `json/cab-flat` format producing the `tokens.json` shape above.
  - **Reduced motion:** a custom `css/cab-reduced-motion` format appends the media block from a tiny `src/reduced-motion.tokens.json` override.
  - **Build order:** `build` runs before `test` via `"pretest": "pnpm build"`.

- [ ] **Step 5: Run it.** `pnpm --filter @cabinet-ds/tokens test` → PASS. If a contrast pair fails, adjust the primitive, never the threshold.

- [ ] **Step 6: Commit.** `git add -A && git commit -m "feat(tokens): Cabinet tokens via Style Dictionary with contrast checks"`

### Task 2: Vue package harness + CabButton

**Files:**
- Create the package setup: `packages/vue/package.json`, `vite.config.ts` (library mode, entry `src/index.ts`, `vue` external, `vite-plugin-dts`), `vitest.config.ts` (browser mode, Playwright provider, `chromium`, headless), `tsconfig.json`.
- Create the shared test and style helpers: `packages/vue/test/axe.ts`, `packages/vue/test/setup.ts` (imports `@cabinet-ds/tokens/tokens.css` and `fonts.css`), `packages/vue/src/styles/focus.css`.
- Create the component and its entry point: `packages/vue/src/index.ts`, `packages/vue/src/components/CabButton/{CabButton.vue, CabButton.docs.md, examples/Basic.vue, examples/Variants.vue}`.
- Test: `packages/vue/src/components/CabButton/CabButton.test.ts`

**Interfaces:**
- Consumes `--cab-*` vars and `@cabinet-ds/tokens` (`workspace:*`, a peer plus a dev dependency).
- Produces the test helper `expectNoA11yViolations(root: Element): Promise<void>` in `test/axe.ts`. It runs `axe.run(root)` and fails, listing `id` and `help` for each violation.
- Produces the **component folder convention** every later task follows:
  - `Cab<Name>.vue`. Its top-level JSDoc above `defineOptions({ name: 'Cab<Name>' })` gives the one-line description. Every prop gets a JSDoc line.
  - `Cab<Name>.docs.md` with exactly these headings: `## Summary`, `## Pattern` (APG link), `## Keyboard` (a `| Key | Action |` table), `## Focus`, `## Screen reader`.
  - `examples/*.vue`: self-contained SFCs that import only from `@cabinet-ds/vue`. The first line is an HTML comment holding a one-line description.
- Produces `CabButton`:
  - **Props:** `variant?: 'primary' | 'secondary' | 'ghost'` (default `primary`), `size?: 'sm' | 'md' | 'lg'` (`md`), `type?: 'button' | 'submit' | 'reset'` (`button`), `disabled?: boolean`, `loading?: boolean`.
  - **Slot:** `default`. **Emits:** `click(MouseEvent)`.
- Produces from `src/index.ts`: named exports of all components, plus `import '@cabinet-ds/vue/style.css'`, a single bundled stylesheet.

- [ ] **Step 1: Write the failing tests**

```ts
test('renders a native button with type=button by default', ...)       // getByRole('button', {name:'Save'}), attribute type === 'button'
test('Enter and Space activate it and emit click', ...)                  // userEvent.keyboard('{Enter}') then ('{ }') → emitted().click.length === 2
test('loading sets aria-busy, ignores clicks, keeps focusability', ...)  // aria-busy="true", no click emitted, still focusable (not disabled attr)
test('disabled uses the native disabled attribute', ...)
test('press moves by --cab-motion-distance-press only on :active', ...)  // read the computed style of the CSS rule: transform uses translateY(var(--cab-motion-distance-press))
test('examples have no axe violations', async () => { for (const Ex of [Basic, Variants]) await expectNoA11yViolations(render(Ex).container) })
```

- [ ] **Step 2: Run them.** `pnpm --filter @cabinet-ds/vue test -- CabButton` → FAIL (component missing). The first run needs `pnpm exec playwright install chromium`.

- [ ] **Step 3: Implement `CabButton.vue`**
  - It's a native `<button>`.
  - **Glossy face:** `background: var(--cab-color-action-<v>-bg)`, `box-shadow: 0 var(--cab-motion-distance-press) 0 var(--cab-color-action-<v>-base), inset 0 2px 0 rgb(255 255 255 / .35)`.
  - **Press:** on `:active`, `transform: translateY(var(--cab-motion-distance-press))` and the base shadow collapses to 0, over `var(--cab-motion-duration-instant) var(--cab-motion-easing-standard)`.
  - **Hover:** adds a soft outer glow only.
  - **Variants:** `ghost` has a transparent background with an ink outline.
  - **Loading:** `aria-busy` plus an `aria-hidden` spinner. The click handler ignores clicks while loading.
  - **Focus:** `focus.css` defines `.cab-focus:focus-visible{outline:3px solid var(--cab-color-focus-ring);outline-offset:3px}`.

- [ ] **Step 4: Write `CabButton.docs.md` and the two examples**
  - The docs file covers: APG Button; Enter and Space activate; loading is announced through `aria-busy`; there's no `aria-disabled` trick.
  - Run: `pnpm --filter @cabinet-ds/vue test` → PASS, and `pnpm --filter @cabinet-ds/vue build` emits `dist/index.js`, `dist/style.css` and `dist/index.d.ts`.

- [ ] **Step 5: Commit.** `feat(vue): package harness and CabButton`

### Task 3: Storybook docs app

**Files:**
- Create the Storybook setup: `apps/docs/package.json`, `apps/docs/.storybook/{main.ts, preview.ts, manager.ts, theme.ts}`, `apps/docs/vitest.config.ts`.
- Create the shared docs page: `apps/docs/src/ComponentDocs.tsx` (docs page template). Create the parser: `packages/vue/src/docs/parseDocsMd.ts` (+ `parseDocsMd.test.ts`).
- Create the first story: `packages/vue/src/components/CabButton/CabButton.stories.ts`.

**Interfaces:**
- Consumes the example SFCs and `Cab<Name>.docs.md` from Task 2's convention.
- Produces the **story convention**:
  - `Cab<Name>.stories.ts` lives next to the component, with `title: 'Components/Cab<Name>'` and `component`.
  - It has one story per `examples/*.vue`, rendering that SFC, with `parameters.docs.source.code` set to the example's raw source (`?raw` import).
  - `tags: ['autodocs']`.
- Produces `parseDocsMd(md: string, fileName: string): { summary: string; pattern: string; keyboard: string; focus: string; screenReader: string }`, which splits the file on the fixed `##` headings. It's exported as `@cabinet-ds/vue/docs-utils` and reused by Task 11.

- [ ] **Step 1: Write the failing test.** `packages/vue/src/docs/parseDocsMd.test.ts`:
  - Parsing `CabButton.docs.md` returns non-empty `summary`, `keyboard` containing `| Enter |`, and so on.
  - A file missing `## Keyboard` throws `Missing section "Keyboard" in CabButton.docs.md`.

- [ ] **Step 2: Run it.** → FAIL. Implement `parseDocsMd(md: string, fileName: string)`. → PASS.

- [ ] **Step 3: Configure Storybook**
  - **Stories glob:** `../../../packages/vue/src/**/*.stories.ts`.
  - **Addons:** `addon-docs`, `addon-a11y` (with `parameters.a11y.test = 'error'`), `addon-vitest`.
  - **Preview:** imports the tokens CSS, the fonts and the `vue` stylesheet. The canvas background is `var(--cab-color-bg-canvas)`.
  - **Docs page:** the template renders Summary, then the primary story, Controls, an **Accessibility** section (Pattern, a Keyboard table, Focus, Screen reader, from `parseDocsMd`), then all stories.
  - **Manager theme:** Cabinet colours, with the brand title as a placeholder for the user's name.

- [ ] **Step 4: Verify the stories run as tests**
  - Run: `pnpm --filter docs exec vitest run` (addon-vitest). Expected: CabButton stories pass, with zero a11y errors.
  - Run: `pnpm --filter docs build-storybook`. Expected: `storybook-static/` is produced.
  - Check the Button docs page with `impeccable shot`, and fix whatever the look shows.

- [ ] **Step 5: Commit.** `feat(docs): Storybook with accessibility docs sections`

### Tasks 4–10: The remaining components

Each task creates `packages/vue/src/components/Cab<Name>/` following the Task 2 and 3 conventions: SFC, `docs.md`, examples, stories and tests, exported from `src/index.ts`. Each task ends with `pnpm --filter @cabinet-ds/vue test`, `pnpm --filter docs exec vitest run` and a commit `feat(vue): Cab<Name>`. Every test file also includes `examples have no axe violations`.

#### Task 4: CabTextField
- **Props:**
  - `modelValue: string` (v-model) and `label: string` (required);
  - `hint?: string`, `error?: string`;
  - `type?: 'text'|'email'|'password'|'tel'|'url'|'search'` (`text`);
  - `required?`, `disabled?`, `autocomplete?: string`.
- **Emits:** `update:modelValue`.
- **Tests:**
  - `label is programmatically associated` (`getByLabelText('Email')`).
  - `hint and error are both in aria-describedby, error last`.
  - `error sets aria-invalid="true" and renders the text with color.danger.text`.
  - `required shows a visual marker that is aria-hidden and sets the required attribute`.
  - `two instances get distinct ids` (Review Focus 1).
- **Examples:** Basic, WithHint, WithError.

#### Task 5: CabCheckbox
- **Props:** `modelValue: boolean`, `label: string`, `hint?`, `disabled?`.
- **Implementation:** a native `<input type="checkbox">`, visually restyled (a 22px box with radius `sm` and an ink check), keeping native semantics.
- **Tests:**
  - `Space toggles and emits update:modelValue`.
  - `clicking the label toggles`.
  - `role is checkbox with correct checked state`.
  - `focus ring is visible on keyboard focus` (`:focus-visible` outline width is 3px).

#### Task 6: CabSwitch
- **Props:** `modelValue: boolean`, `label: string`, `disabled?`.
- **Implementation:** `<button role="switch" :aria-checked>` with a visible label wired through `aria-labelledby`. The thumb slides over `duration.base`; with reduced motion it changes colour only.
- **Tests:**
  - `Space and Enter toggle`.
  - `aria-checked reflects modelValue`.
  - `disabled prevents toggling`.
- **Docs:** explain why it uses switch and not a checkbox: the action applies immediately.

#### Task 7: CabTabs
- **Props:**
  - `modelValue?: string` (v-model, the tab id);
  - `tabs: Array<{ id: string; label: string; disabled?: boolean }>`;
  - `label: string` (the tablist's accessible name);
  - `activation?: 'automatic' | 'manual'` (`automatic`).
- **Slot:** `panel` with `{ tab }`.
- **Pattern:** APG Tabs with roving tabindex. Only the active tab has `tabindex=0`, and the panel has `tabindex=0`.
- **Tests:**
  - `ArrowRight/ArrowLeft move focus and wrap`.
  - `Home/End jump`.
  - `automatic activation selects on focus; manual requires Enter/Space`.
  - `arrow keys skip disabled tabs`.
  - `unknown or disabled modelValue falls back to first enabled tab` (Review Focus 3).
  - `tab aria-controls matches panel id and panel aria-labelledby matches tab id`.
  - `two Tabs on one page have distinct ids`.
- **Look:** chip tabs. The active chip uses `color.state.active.bg` with its `base` ledge.

#### Task 8: CabSelect
- **Props:**
  - `modelValue: string | null` (v-model) and `label: string`;
  - `options: Array<{ value: string; label: string; disabled?: boolean }>`;
  - `placeholder?: string` (`'Select…'`);
  - `hint?`, `error?`, `disabled?`.
- **Pattern:** APG *select-only combobox*.
  - A `div role="combobox" tabindex=0` with `aria-expanded`, `aria-controls`, `aria-activedescendant` and `aria-labelledby` (the label).
  - A `ul role="listbox"` with `li role="option"` items carrying `aria-selected` and `aria-disabled`.
- **Keyboard tests:**
  - `Down/Up/Enter/Space/Alt+Down open`.
  - `Up/Down move active option skipping disabled`.
  - `Home/End`.
  - `Enter or Space selects and closes`.
  - `Escape closes without changing value`.
  - `Tab selects active option and moves focus on`.
  - `typing characters jumps to matching option (typeahead, 500ms buffer)`.
- **Pointer and state tests:**
  - `clicking an option selects it`.
  - `clicking outside closes`.
  - `focus stays on combobox throughout`.
- **Edge-case tests:**
  - `empty options / all disabled / value not in options: shows placeholder, keys do not throw or loop` (Review Focus 2).
  - `two Selects have distinct ids` (Review Focus 1).
- **Implementation:** a pure keyboard-reducer function `nextActiveIndex(options, current, key): number` in `useListboxKeys.ts`, unit-tested on its own.

#### Task 9: CabDialog
- **Props:** `open: boolean` (`v-model:open`), `title: string`, `description?: string`, `closeLabel?: string` (`'Close'`).
- **Slots:** `default`, `footer`.
- **Implementation:**
  - Native `<dialog>` with `showModal()` and `close()`, labelled by `aria-labelledby` (title) and `aria-describedby` (description).
  - On open, it stores `document.activeElement` and focuses the first focusable element in the body, otherwise the close button.
  - On close, it restores focus if `isConnected`.
  - The native `cancel` event (Escape) emits `update:open` `false`.
  - Enter is the overlay duration plus fade and scale from 0.98. Exit uses `exit` timing. Reduced motion means fade only.
- **Tests:**
  - `opens as modal with role dialog and accessible name`.
  - `focus moves inside on open`.
  - `Tab is trapped (cycles within dialog)`.
  - `Escape emits update:open false`.
  - `close button closes`.
  - `focus returns to the trigger on close`.
  - `does not throw when the trigger was removed before close` (Review Focus 4).
  - `backdrop click closes`.
- **Docs:** state that the native dialog gives inert background for free.

#### Task 10: CabCard (folded in here; it has no interactive pattern)
- **Props:** `as?: 'article' | 'section' | 'div'` (`article`), `title?: string`, `headingLevel?: 2 | 3 | 4` (`3`).
- **Slots:** `media`, `default`, `footer`.
- **Look:** a white surface, radius `lg`, and `shadow.ledge`.
- **Tests:**
  - `renders heading at the requested level`.
  - `article is labelled by its title`.
  - `has no interactive role`.
- **Docs:** explain how to make a whole card clickable accessibly: put a link in the title and use the stretched-link pseudo-element. Add an example of it.
- **End of Day 1:** run `impeccable detect --json` over `packages/vue/src` and fix real findings. Check every docs page with `impeccable shot`, and fix them in one batch.

---

## Day 2: MCP + shipping

### Task 11: Registry generator

**Files:**
- Create: `scripts/build-registry.ts` (run with `tsx`), `packages/mcp/src/registry.types.ts`
- Generated: `packages/mcp/src/registry.json` (committed)
- Test: `scripts/build-registry.test.ts`

**Interfaces:**
- Consumes:
  - `vue-component-meta` `createChecker(packages/vue/tsconfig.json)`;
  - `parseDocsMd` (Task 3);
  - `packages/vue/src/components/*/examples/*.vue` (raw);
  - `packages/tokens/dist/tokens.json`.
- Produces in `registry.types.ts`:

```ts
export interface Registry { package: string; version: string; components: ComponentEntry[]; tokens: TokenEntry[] }
export interface ComponentEntry {
  name: string                // "CabButton"
  import: string              // "import { CabButton } from '@cabinet-ds/vue'"
  description: string         // component JSDoc
  props: { name: string; type: string; required: boolean; default?: string; description: string }[]
  events: { name: string; type: string; description: string }[]
  slots: { name: string; type: string; description: string }[]
  a11y: { summary: string; pattern: string; keyboard: string; focus: string; screenReader: string }
  examples: { name: string; description: string; code: string }[]
}
export type TokenEntry = { name: string; cssVar: string; value: string; type: string; description?: string }
```

- Produces the script `buildRegistry(): Registry`, plus a CLI: `pnpm registry` writes the file, and `pnpm registry:check` exits 1 with `registry.json is stale, run pnpm registry` on any diff.

- [ ] **Step 1: Write the failing tests**
  - `includes all 8 components sorted by name`.
  - `CabButton.props has variant with type "'primary' | 'secondary' | 'ghost'" and default "'primary'"`.
  - `CabTextField.events includes update:modelValue`.
  - `every component has >=1 example whose code imports from @cabinet-ds/vue`.
  - `every token has a --cab- cssVar`.
  - `fails loudly when a component lacks docs.md`.
- [ ] **Step 2: Run them.** → FAIL. Implement. → PASS. Run `pnpm registry` and commit `registry.json`.
- [ ] **Step 3: Commit.** `feat(mcp): generate component registry from source`

### Task 12: MCP server

**Files:**
- Create: `packages/mcp/package.json` (bin `cabinet-mcp` → `dist/stdio.js`; `files: ["dist"]`), `packages/mcp/src/server.ts`, `packages/mcp/src/lookup.ts`, `packages/mcp/src/stdio.ts`, `packages/mcp/tsup.config.ts`
- Test: `packages/mcp/test/server.test.ts`

**Interfaces:**
- Consumes `Registry` (Task 11), imported as JSON and bundled into `dist`.
- Produces `createServer(registry: Registry): McpServer`, with server name `cabinet-ds` and the package version. It registers these tools:

| Tool | Input (zod) | Returns (text content, JSON) |
|---|---|---|
| `list_components` | none | `[{ name, description, import }]` |
| `get_component` | `{ name: string }` | full `ComponentEntry` minus `examples[].code` (names and descriptions only) |
| `get_tokens` | `{ category?: 'color'\|'space'\|'radius'\|'font'\|'motion'\|'shadow'; query?: string }` | `TokenEntry[]` filtered by the first path segment and a case-insensitive substring of the name |
| `get_usage_example` | `{ name: string; example?: string }` | `{ component, example, code }` (default: the first example) |

- Each tool's description tells the model when to use it. For example, `list_components`: "Call first to see which Cabinet components exist; build UI only from these."
- Produces `resolveComponent(registry, name): ComponentEntry | { error: string }` in `lookup.ts`. It matches case-insensitively, with or without the `Cab` prefix.

- [ ] **Step 1: Write the failing tests.** Use the SDK `Client` with `InMemoryTransport.createLinkedPair()`.
  - `lists exactly 4 tools`.
  - `list_components returns 8 entries`.
  - `get_component resolves "button", "Button", "CabButton" identically` (Review Focus 5).
  - `get_component "Buton" returns isError listing valid names` (Review Focus 5).
  - `get_tokens category=color returns only color.* entries`.
  - `get_tokens query="primary" matches action.primary tokens`.
  - `get_usage_example defaults to first example and errors on unknown example name with the valid names`.
- [ ] **Step 2: Run them.** → FAIL. Implement `server.ts`, `lookup.ts`, and `stdio.ts` (`StdioServerTransport`, with a shebang). → PASS.
- [ ] **Step 3: Smoke test.** `pnpm --filter @cabinet-ds/mcp build && npx @modelcontextprotocol/inspector --cli node packages/mcp/dist/stdio.js --method tools/list` lists the 4 tools.
- [ ] **Step 4: Commit.** `feat(mcp): stdio MCP server with four tools`

### Task 13: CI

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/docs.yml`
- Modify: `eslint.config.js` (enable `vuejs-accessibility` recommended)

**Steps:**
- [ ] **`ci.yml`, on PRs and pushes to main.** It uses Node from `.nvmrc`, pnpm with caching, then runs in order:
  1. `pnpm install --frozen-lockfile`
  2. `pnpm lint`
  3. `pnpm typecheck`
  4. `pnpm --filter @cabinet-ds/tokens test` (contrast check)
  5. `pnpm exec playwright install --with-deps chromium`
  6. `pnpm test`
  7. `pnpm registry:check`
  8. `pnpm build`
  9. `pnpm --filter docs exec vitest run`
- [ ] **`docs.yml`, on pushes to main.** It builds Storybook and deploys it with `actions/deploy-pages`.
- [ ] **Verify locally:** run the same commands in order. They all pass, and lint passes with zero a11y rule violations.
- [ ] **Commit.** `ci: lint, typecheck, a11y, registry freshness, Storybook deploy`

### Task 14: Scope, Changesets, publish

**Needs from the user:** their npm username, an npm automation token added as the `NPM_TOKEN` repo secret, and the GitHub repo URL. Ask for these at the start of this task if they aren't given yet.

- [ ] **Swap the scope.** Replace `@cabinet-ds` with `@<username>` across the repo (`git grep -l @cabinet-ds | xargs sed -i '' …`). Then run `pnpm install && pnpm build && pnpm test`. Expected: green.
- [ ] **Configure the packages for publishing.**
  - Each `package.json` gets `publishConfig.access: public`, `repository`, `license: MIT`, `keywords` and `files`.
  - Add `LICENSE`.
  - The MCP `README` holds the Claude Code setup snippet: `claude mcp add cabinet -- npx -y @<username>/mcp`.
- [ ] **Set up the release.** Run `pnpm changeset init` and add a changeset at `0.1.0` for all three packages. `.github/workflows/release.yml` uses `changesets/action` with `publish: pnpm release` (`pnpm build && changeset publish`), `NPM_CONFIG_PROVENANCE: true` and `id-token: write`.
- [ ] **Verify the packages.**
  - `pnpm -r exec npm pack --dry-run`: each tarball contains only `dist` plus the README and LICENSE, and the vue one contains `style.css`.
  - In a temp dir, `npm i <tarballs>` imports `CabButton`, and `npx cabinet-mcp` starts.
- [ ] **Push and publish.** Push to GitHub; this is the first push, so confirm with the user before pushing. Merge the Changesets PR. Verify that `npm view @<username>/vue version` prints `0.1.0`.
- [ ] **Commit.** `chore: publish setup`

---

## Day 3: Proof

### Task 15: Demo harness

**Files:**
- Create the starter app: `demo/starter/` (Vite + Vue + TS, depending on the **published** `@<username>/vue` and `@<username>/tokens`). `demo/` is not in the workspace and has its own lockfile.
- Create the run inputs: `demo/PROMPT.md`, `demo/mcp.json`, `demo/run.sh`.
- Create the scorer and its test: `demo/score.ts`, `demo/score.test.ts`.

**Interfaces:**
- `demo/PROMPT.md` holds the fixed prompt:
  > "Build a sign-up page for a weekend game-design workshop in src/App.vue: a hero card, a form (name, email, experience level select, newsletter switch, terms checkbox), tabs for Schedule / Venue / FAQ, and a confirmation dialog on submit. Use only components from @<username>/vue and its design tokens. Do not write raw form controls or hard-coded colours."
- `demo/run.sh with|without`:
  1. Copies `starter` to `demo/runs/<mode>/` and runs `npm ci`.
  2. Runs `claude -p "$(cat ../../PROMPT.md)" --model <same pinned id> --output-format stream-json --verbose --permission-mode acceptEdits --allowedTools "Read,Edit,Write,Bash(npm run build)"`, adding `--mcp-config ../../mcp.json --strict-mcp-config` for `with`, and `--strict-mcp-config` with no config for `without`.
  3. Saves `transcript.jsonl`.
- `score(dir): Score`, where `Score = { onlyLibraryComponents: boolean; rawControls: number; unknownProps: string[]; hardcodedColors: number; buildOk: boolean; axeViolations: number }`:
  - **Raw controls:** counts `<button|input|select|textarea|dialog` in `src/**/*.vue`.
  - **Unknown props:** checks `Cab*` usages against the published registry's prop names.
  - **Hard-coded colours:** counts hex, `rgb(` and `hsl(` in `<style>` and inline styles.
  - **Build and axe:** runs `npm run build`, then loads `vite preview` in Playwright and runs axe.

- [ ] **Step 1: Write the failing test.** `score.test.ts` uses two fixture dirs: a clean one scoring `{rawControls:0, unknownProps:[], hardcodedColors:0}`, and a dirty one with `<button style="color:#f00">` plus `<CabButton tone="x">`, scoring `rawControls:1, hardcodedColors:1, unknownProps:['CabButton.tone']`.
- [ ] **Step 2: Run it.** → FAIL. Implement. → PASS.
- [ ] **Step 3: Commit.** `feat(demo): reproducible with/without-MCP harness and scorer`

### Task 16: Demo runs + README

- [ ] **Run the demo.** Run `demo/run.sh without`, then `demo/run.sh with`. If the Claude CLI can't run from this session, the user runs both. Commit `demo/runs/*/src`, `transcript.jsonl` and `score.json`.
- [ ] **Take screenshots.** Use `impeccable shot` on each built page, saving to `docs/media/demo-{without,with}.png`.
- [ ] **Record the GIFs.** This is the user's step: a short screen recording of each run, converted to `docs/media/demo-{without,with}.gif`. Keep them under 5MB each.
- [ ] **Write the root `README.md`.** It covers:
  - a one-line pitch;
  - side-by-side screenshots and the score table generated from both `score.json` files (no hand-edited numbers);
  - the GIFs;
  - install and usage;
  - the MCP setup;
  - links to Storybook and the npm packages;
  - an accessibility section linking the tests;
  - how the registry is generated.
- [ ] **Commit.** `docs: README with MCP demo`. If the "without" run scores as well as or better than "with", stop and report it to the user before publishing the README (anti-goal).

### Task 17: Figma round trip (user, about 30 minutes, guided)

- [ ] **Import the tokens into Figma.** The user duplicates SDS, installs the chosen import/export plugin, and imports `packages/tokens/src/*.tokens.json` into the file's variables.
- [ ] **Export and compare.** The user re-exports to `packages/tokens/figma/export.tokens.json`. A script (`scripts/compare-figma-export.ts`) normalises both files and checks there's no value diff. Expected: `0 differences`.
- [ ] **Document it.** `docs/figma.md`: the screenshot of the variables panel, then the Figma-first flow (edit in Figma, export, `pnpm --filter tokens build`, commit).
- [ ] **Commit.** `docs: Figma variables round trip`

---

## Stretch (only if time remains, in this order)

- **S1 · GSAP moment** (`apps/docs/src/Intro.mdx` plus `PowerOn.vue`):
  - Arcade buttons "power on" in a staggered glow, at most 800ms in total.
  - It uses `gsap.matchMedia()`: with `(prefers-reduced-motion: reduce)`, the buttons simply appear lit.
  - `gsap` is a dependency of `apps/docs` only.
  - Verify with `impeccable motion-capture` in normal and reduced-motion modes.
- **S2 · Dark theme:**
  - `semantic.dark.tokens.json` is emitted under `[data-theme="dark"]`.
  - Contrast pairs are run for both themes.
  - A Storybook toolbar toggle switches between them.
- **S3 · Hosted MCP:**
  - `packages/mcp/src/http.ts` exports `handle(req: Request): Promise<Response>`, using a stateless Streamable HTTP transport and the same `createServer`.
  - It's deployed to Vercel or Cloudflare Workers.
  - The README gets the URL, and the setup line `claude mcp add --transport http cabinet <url>`.
