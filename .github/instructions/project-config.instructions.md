---
description: "Use when editing project configuration files: tauri.conf.json, Cargo.toml (src-tauri), vite.config.ts, tailwind.config.js, tsconfig.json, or CI workflow files. Covers naming conventions, environment variable handling, and cross-platform consistency."
applyTo: "{tauri.conf.json,src-tauri/**,vite.config.ts,tailwind.config.js,tsconfig*.json,eslint.config.js,.github/workflows/**}"
---

# Project Configuration Guidelines (Tauri Desktop)

## Tauri configuration (`tauri.conf.json`, `src-tauri/Cargo.toml`)
- `tauri.conf.json`: window properties (width, height, resizable), permissions, security settings — keep in sync with actual codebase.
- `Cargo.toml`: pin dependencies with exact versions (`=`) for stability; use workspace dependencies where possible.
- Never enable `allowlist.shell.open` for untrusted URLs — only allow known/internal commands.
- Permissions: default-deny; only grant `fs`, `process`, `http` if explicitly needed for the feature.

## Environment variables (Tauri)
- Frontend: use `import.meta.env.VITE_*` for build-time variables (not secrets).
- Backend (Rust): read from `std::env` at runtime; use `.env` locally (excluded from git).
- Never expose API keys, tokens, or secrets in build-time vars — they'd be visible in the binary.
