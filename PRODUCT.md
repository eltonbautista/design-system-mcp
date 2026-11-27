# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Set by the user:
- Vue 3 + TypeScript component library, with tokens from Figma variables built by Style Dictionary.
- Storybook docs and Vitest tests.
- A TypeScript MCP server (`@modelcontextprotocol/sdk`).
- Published to npm under the user's personal scope, with GitHub Actions CI.

Repo layout (delegated): a pnpm workspace monorepo with `packages/tokens`, `packages/vue`, `packages/mcp`, `apps/docs` and `apps/demo`.

## Users

- **Primary:** frontend hiring managers and engineers judging the author's portfolio. They open the repo, the Storybook and the npm page to judge craft, accessibility depth and engineering judgment.
- **Secondary:** full-stack hiring managers, who look at the MCP server and the tooling.
- **Practical users:**
  - Developers installing the Vue package.
  - AI coding assistants (such as Claude Code) that look up the components through the MCP server.

## Product Purpose

A small, finished design system (8 components) plus an MCP server that teaches AI assistants how to use it correctly. It counts as a success when:
- the packages are published on npm;
- the README demo shows Claude Code building the same page much better with the MCP server connected than without it.

## Positioning

- **The MCP server's knowledge is generated from the library's own source:** TypeScript types, stories, accessibility notes and tokens. It can't fall out of date with the code.
- **Every component carries a documented and tested accessibility contract:** a keyboard map, focus behaviour, screen-reader notes and the WAI-ARIA APG pattern it follows.

## Operating Context

- Reviewers browse the GitHub README, the Storybook on GitHub Pages and the npm pages.
- Developers run the MCP server locally with `npx` inside Claude Code.
- Tokens start as variables in the author's copy of Figma's Simple Design System, restyled by the author.

## Capabilities and Constraints

- **Components:** Button, TextField, Checkbox, Switch, Select, Tabs, Dialog, Card.
- **MCP tools:** `list_components`, `get_component`, `get_tokens`, `get_usage_example`.
- **Deadline:** 72 hours from 2026-11-27. The hosted HTTP endpoint, the dark theme and the GSAP moment are stretch goals.
- **Figma:** the Variables REST API is not available (it needs an Enterprise plan), so tokens move by plugin export and import.

## Brand Commitments

- **Visual world chosen by the user:** "Arcade Cabinet". It's light and warm, with candy accents and arcade-button presses, and is meant to feel fun and engaging.
- **Must not read as an SDS port.** Own colours, own type, own token names.
- **Rejected explicitly:** a "hacker terminal" or dev-tool costume (monospace interface type, `//` labels, neon on black).
- **Motion stays subtle** and always respects `prefers-reduced-motion`.

## Evidence on Hand

- None yet. No real users, testimonials or benchmarks exist.
- The demo's transcripts and scores will be the only evidence. Don't invent numbers.

## Product Principles

1. Accessibility is shown and tested, never only claimed.
2. One source of truth: the code generates the docs and the MCP data.
3. Personality lives in states and touch (press, focus, active), not decoration.
4. Small and finished beats broad and partial.

## Accessibility & Inclusion

- WCAG 2.1 AA at minimum. Every text and background token pair passes AA, and CI checks it.
- Everything works by keyboard, with visible focus.
- A reduced-motion path for all motion.
