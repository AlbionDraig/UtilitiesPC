---
description: "Use when writing React components, TypeScript hooks, pages, or Tailwind CSS styles in the frontend. Covers component architecture, IPC patterns with Tauri, design system tokens, and accessibility rules."
applyTo: "src/**/*.{ts,tsx}"
---

# Frontend (React / TypeScript / Tauri IPC) Guidelines

## Architecture layers
- `src/pages/` — Layout and composition; delegate Tauri commands to custom hooks.
- `src/components/` — Reusable presentational components; no business logic or IPC calls.
- `src/hooks/` — Tauri command wrappers with loading/error/success states.
- `src/store/` — Global client state only (UI state, settings); never cache remote data here without strategy.
- `src/api/` — Typed Tauri command clients (invoke wrappers); use `@tauri-apps/api/core` for all backend communication.

## Component rules
- Props typed with explicit `interface` or `type`.
- Always implement loading / error / empty states for data-driven views.
- Extract repeated UI into sub-components.
- No Tauri invocations, store writes, or business logic in presentational components.

## Data fetching (Tauri IPC)
- Use custom hooks that wrap `invoke()` calls.
- Manage state in hook: loading, error, success.
- On user actions (buttons), call the hook's mutation function; never invoke directly in render.
- Handle errors gracefully: show user-friendly messages, never log raw error to console without context.

## Design system (Tailwind tokens — `tailwind.config.js`)
- Brand: `bg-brand`, `text-brand`, `bg-brand-hover`, `bg-brand-light`, `text-brand-text`
- Success: `text-success`, `bg-success-bg`, `text-success-text`
- Warning: `text-warning`, `bg-warning-bg`, `text-warning-text`
- Neutrals: `neutral-900`, `neutral-700`, `neutral-400`, `neutral-100`, `neutral-50`
- Typography: only `font-normal` and `font-medium` — never `font-bold` or `font-semibold`.
- Never use default Tailwind color scales (`red-500`, `green-600`, etc.).

## Internationalisation (i18n)
- All user-visible strings must go through `useTranslation` — never hardcode text in JSX.
- Add keys to **both** `src/i18n/locales/es.json` and `src/i18n/locales/en.json` simultaneously.
- Key naming: `section.component.description` in camelCase, e.g. `budgets.form.titleLabel`.
- Never use interpolation with raw HTML — use `Trans` component when markup is needed inside a translation.
- Do not store locale in component state — the global `i18n` instance manages it via `localStorage` key `atlas-lang`.

## Accessibility
- Use semantic HTML elements (`button`, `nav`, `main`, `section`).
- Interactive elements must be keyboard-reachable with visible focus.
- Form inputs require associated `<label>` or `aria-label`.

## Docstrings & comments
- JSDoc/TSDoc on exported functions, hooks, and components: **English**.
- Inline comments explaining business logic or non-obvious behavior: **Spanish or English**, consistent with the file's prevailing language.
- Never mix languages within the same JSDoc block or comment.

## Tests
- Runner: `pnpm vitest run --coverage`
- E2E: `pnpm playwright test` (located in `e2e/`)
