# Cabinet design system + MCP server: design

Status: approved · 2026-11-27
On approval this file is saved as `docs/superpowers/specs/2026-11-27-cabinet-design-system-design.md`, together with a `PRODUCT.md` (impeccable's product brief). Implementation planning starts only after that.

## Context and why

This is a personal portfolio project meant to land on a resume. The main audience is **frontend hiring managers**, with **full-stack** roles second. The project has to do three things:

1. Show skills that are new to the resume: MCP, Style Dictionary, Storybook, Vitest, npm publishing, GitHub Actions, and GSAP.
2. Represent the author. Starting from Figma's Simple Design System (SDS) kit is fine, but the result must not read as an SDS port: **own colours, own type, and a fun, engaging personality.**
3. Put the author's **accessibility strength** front and centre. Every component documents its keyboard behaviour, focus states, screen-reader notes and ARIA pattern.

**Done when:** the packages are published on npm, and the README holds a short demo of Claude Code building the same page from only these components, once with the MCP server connected and once without.

## Goals

- A Vue 3 + TypeScript library of **8 components**: Button, TextField, Checkbox, Switch, Select, Tabs, Dialog, Card.
  - They were chosen to cover the hard accessibility patterns: a listbox (Select), roving focus (Tabs), a focus trap with focus returned on close (Dialog), and labelling and error messages (TextField). Card is there so the demo page has something to lay content out in.
- Design tokens that start as Figma variables and become CSS custom properties, TypeScript and JSON through Style Dictionary.
- Storybook docs. Every component's page has an Accessibility section: keyboard map, focus behaviour, screen-reader notes and the WAI-ARIA APG pattern it follows.
- A TypeScript MCP server with four tools: `list_components`, `get_component`, `get_tokens` and `get_usage_example`. It runs locally over stdio and is also deployed as a hosted HTTP endpoint (the full-stack piece).
- Accessibility is proven, not just claimed: axe checks in Vitest and in Storybook's accessibility add-on, keyboard-interaction tests, and a contrast check on every token pair, all running in CI.
- GitHub Actions for CI, publishing to npm, and deploying Storybook.

## Non-goals

- More than 8 components. Tooltip and Menu are out on purpose.
- A live Figma API sync. The Variables REST API needs a Figma Enterprise plan, so variables are exported to a JSON file committed to the repo.
- React or other framework ports.
- Supporting Vue 2.

## Anti-goals (failure even if it works)

- **Looks like an SDS port**, or like a generic component kit.
- **A "hacker terminal" costume.** No monospace dev-tool styling, no `//` comment labels, no neon-on-black. The user explicitly rejected this.
- **Motion that's loud, or that ignores `prefers-reduced-motion`.**
- **Accessibility claims the tests don't back up.**
- **A demo where the "without" run wins** because the setup was unfair.

## Visual world: "Arcade Cabinet" (chosen by the user from mockups)

The look is based on the physical arcade machine, not its screen.

- **Ground:** warm cream `#FFF6EC`, with white cards.
- **Ink:** `#24163F`.
- **Candy accents:**
  - pink `#FF3D8B` is the primary;
  - cyan `#2DD4E8` is the secondary;
  - purple `#6C2BD9` is used for focus and active states;
  - yellow `#FFE14D` is used for highlights and tags.
- **Signature:** glossy buttons with a coloured base underneath them. They press down into it, like real arcade buttons.
- **Shapes:** chunky rounded corners (10–20px), soft "ledge" shadows under cards, and pill-shaped tags.
- **Fonts:** Sora for headings and Outfit for the interface and body text. No monospace font in the system, except inside code blocks in the docs.
- **Themes:** light-first. A dark second theme is generated from the same token names, using Style Dictionary's multi-theme support.
- **Contrast is a hard rule:** every text and background pair passes WCAG AA, and CI checks it.
  - Known fix: white text on `#FF3D8B` fails at about 3.4:1. The primary button's pink gets darkened to around `#D6146A`, or uses dark ink instead. Mockup values are starting points, not final tokens.
- **Reference:** the chosen mockup is in `.superpowers/brainstorm/*/content/arcade-lighter.html`, option C.

## Motion (user: subtle, respects reduced motion)

- **Motion tokens:** `duration.instant` 120ms (presses), `duration.base` 200ms (tabs and switches), `duration.overlay` 300ms (Dialog opening; closing is faster), and one easing, `cubic-bezier(0.16, 1, 0.3, 1)`. No bounce or elastic curves.
- **Components animate with CSS only.** GSAP is not a dependency of the component package.
- **Hover:** a glow or shadow change. Nothing moves and nothing takes the pointer.
- **Press:** the button moves down 3–4px into its base.
- **Reduced motion:** movement is removed, and colour, opacity and state changes stay.
- **GSAP:** used for one standout moment on the docs or demo landing page (for example, arcade buttons "powering on"), gated with `gsap.matchMedia()` for reduced motion. The GSAP skills guide this work.

## Approaches considered (for where the MCP server's knowledge comes from)

- **A · Generated from the source (CHOSEN by the user).** A build step bundles each component's props, events and slots (from `vue-component-meta`), usage examples (from the Storybook stories), accessibility notes (from a per-component notes file), and the tokens (from Style Dictionary's JSON output) into `registry.json`, which ships inside the MCP package. It can't fall out of date with the code. It costs more tooling, and it's the strongest engineering story.
- **B · Hand-written registry.** Fast, but it drifts out of date and shows the least skill.
- **C · Read from the hosted Storybook at runtime.** It depends on the docs site staying up, and its type information is thin.

## Architecture (my calls unless marked)

- **pnpm workspace monorepo**, versioned and published with Changesets:
  - `packages/tokens`: the Figma variables export (DTCG JSON) goes in, and Style Dictionary produces CSS variables (light and dark), a TS module and JSON.
  - `packages/vue`: the 8 components, built with Vite in library mode, with types and per-component imports.
  - `packages/mcp`: the MCP server, built on the official `@modelcontextprotocol/sdk`. It reads the bundled `registry.json`, can run over stdio with `npx`, and also exports an HTTP handler.
  - `apps/docs`: Storybook (Vue 3 + Vite), with the accessibility add-on, the docs landing page and the GSAP moment.
  - `apps/demo`: the Vite app used for the before-and-after demo.
  - `scripts/build-registry`: generates `registry.json`. It runs in CI, and CI fails if the committed copy is out of date.
- **Accessibility built in-house rather than with a headless library** (my call, because accessibility is the skill being shown). Each component follows its WAI-ARIA APG pattern. Native elements are used where they're enough: `<button>`, `<input>`, and `<dialog>` with a managed focus return. Select uses the "select-only combobox" pattern.
- **Per-component accessibility notes file** (for example `Button.a11y.md`, with a fixed set of headings). Storybook docs and the MCP server's `get_component` both read it, so there's one source.
- **Tests:**
  - Vitest with `@vue/test-utils` for behaviour and keyboard maps.
  - Axe checks on every component.
  - Storybook stories run as tests.
  - A token contrast check.
- **CI (GitHub Actions):** lint, typecheck, tests, the token contrast check, the registry freshness check and a build on every PR. Changesets publishes to npm on main. Storybook deploys to GitHub Pages.
- **Hosted MCP server:** a Streamable HTTP endpoint on a free-tier host. The builder picks the host (Cloudflare Workers or Vercel). It's read-only, needs no authentication and serves public data only.

## Figma workflow (my calls, after the builder check)

1. **Pick one plugin that can both export and import** DTCG JSON (for example "Variables Import Export"), and use it in both directions.
2. **Start from a committed stand-in token file.** The build starts from a hand-written DTCG file in that plugin's export shape, so the user isn't on the critical path.
   - It holds the Cabinet values plus a dark mode. I pick the dark-mode values and keep them AA-checked.
   - Collections and tokens use **our own names** (`color.action.primary`, `space.3` and so on), not SDS names. The shipped CSS variables then don't read as SDS.
3. **The JSON in the repo is the working source while building.** CI's contrast check runs against it, so contrast fixes don't wait on Figma.
4. **Sync back to Figma once the tokens settle.** The user imports the JSON into their duplicated SDS file, re-exports, and confirms the round trip shows no diff.
   - From then on the documented flow is Figma first: edit in Figma, export, then commit.
   - `docs/figma.md` records this, with a screenshot of the variables in Figma.

## Demo (Done-when)

- **Setup:** `apps/demo` starts as a fresh Vite + Vue app with the published package installed. One fixed prompt, for example "Build a workshop sign-up page using only @scope/vue components", is run in Claude Code twice:
  1. **without** the MCP server: the package is still installed, so Claude can read `node_modules`. That keeps the comparison fair.
  2. **with** the MCP server connected.
- **Scored on:** whether it used only library components, whether the props it used exist, whether it used tokens instead of hard-coded colours, the axe violation count, and whether it built and ran first time.
- **README:** side-by-side screenshots, the score table and a short screen recording or GIF of each run. The transcripts are committed as evidence.

## Deadline: 72 hours (user), phased so each phase stands on its own

Packages are published under the user's personal npm scope: `@<npm-username>/tokens`, `@<npm-username>/vue` and `@<npm-username>/mcp`. Until the username is known, a placeholder is used. It's swapped in before the first publish.

- **Day 1: library**
  - Monorepo, tokens (stand-in DTCG file, light theme, contrast check).
  - The 8 components, with their accessibility behaviour and Vitest and axe tests.
  - Storybook with an Accessibility section on every component page.
- **Day 2: MCP and shipping**
  - The registry generator and the MCP server over stdio, with the 4 tools and their tests.
  - GitHub Actions CI, Changesets, the **npm publish**, and Storybook on GitHub Pages.
- **Day 3: proof**
  - The two demo runs, the scoring, the README with screenshots, a GIF and the transcripts.
  - The Figma round trip (the user's task, about 30 minutes), so that "tokens taken from Figma variables" is true.
  - Buffer time.
- **Stretch, cut first, in this order:** GSAP landing moment, dark theme, hosted HTTP endpoint.
  - These are no longer goals for the 72 hours. They're done only if day 3 has time left.
  - The resume can still list GSAP only if the GSAP moment ships.

**What the user needs to provide:**
- Their npm username, an npm account with an automation token (stored as the `NPM_TOKEN` secret), and a GitHub repo.
- These are needed by the start of day 2.

## Calls I made (check these while reading)

- **Accessibility built in-house rather than with a headless library.** It's the skill on show.
- **Light-first theme;** dark is a stretch goal.
- **Stand-in token JSON first, synced back to Figma on day 3.** Token names are our own, not SDS's.
- **GSAP stays out of the component package.**
- **Demo fairness:** the package is installed in both runs, and the only difference is whether the MCP server is connected.

## After approval

1. Save this file as `docs/superpowers/specs/2026-11-27-cabinet-design-system-design.md` and write `PRODUCT.md`.
2. `git init` and commit both.
3. Invoke `superpowers:writing-plans` to produce the day-by-day implementation plan.

## Left to the builder

- Exact versions (Storybook, Style Dictionary, MCP SDK), the hosting provider, and the Figma export plugin.
- Final token values within the Cabinet palette, as long as AA passes.
- Internal component API details beyond what the APG patterns require.
