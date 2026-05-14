---
description: "Use when implementing or reviewing authentication, authorization, IPC security, input validation, secrets handling, or any security-sensitive code in Tauri. Covers OWASP Top 10 applied to desktop apps."
applyTo: "**"
---

# Security Guidelines (Tauri Desktop)

## IPC Security (Tauri commands) — OWASP A01 / A07
- All sensitive operations (system commands, file access) must be behind Tauri commands with explicit `#[tauri::command]`.
- Never expose raw system calls or process execution to the frontend without validation.
- Tauri's `allowlist` in `tauri.conf.json` is the first line of defense — default-deny; only grant permissions for actual features.
- Commands must validate all input before executing; never pass frontend data directly to shell/file operations.

## Input validation (OWASP A03)
- **Rust (backend)**: validate all command arguments; reject unexpected types, lengths, or formats immediately.
- **React (frontend)**: validate form inputs client-side for UX; never trust user input for critical operations.
- For PowerShell commands, sanitize script arguments to prevent injection; use parameter binding (`$using:` variables).
- Never construct command strings by concatenation — use arrays/vectors with parameterized execution.

## Secrets & configuration (OWASP A02 / A05)
- No secrets, tokens, or credentials in source code or `.env` files committed to git.
- Load secrets at runtime from environment variables; document required keys in `example.env` (without real values).
- Sensitive data (passwords, API keys, session tokens) must never be logged or exposed in error messages.

## Frontend security (React) — OWASP A05 / A07
- Never render user-supplied content with `dangerouslySetInnerHTML`.
- Validate and sanitize any data used to build URLs, file paths, or system command arguments.
- Never store sensitive data in `localStorage`/`sessionStorage` — keep in memory only, cleared on app exit.
- Do not hardcode API keys or secrets in environment variables visible to the browser (use `VITE_` prefix only for non-sensitive values).

## Process & file operations — OWASP A10 (Command Injection)
- When executing PowerShell scripts, use `tauri::api::process::Command` with arguments array, never shell concatenation.
- Validate file paths before access; reject absolute paths outside the app's allowed directories.
- Restrict file operations to user-writable dirs (`%APPDATA%`, `%TEMP%`) unless explicitly needed elsewhere.

## Error handling & logging (OWASP A09 — Information Exposure)
- Never expose stack traces, file paths, or internal implementation details in error messages shown to users.
- Log errors with context useful for debugging, but sanitize sensitive fields (passwords, tokens, PII).
- Use structured logging; include correlation IDs for tracing across Rust/React boundaries.

## Dependency hygiene (OWASP A06)
- Keep `Cargo.toml` dependencies pinned to exact versions for stability; use `cargo audit` before releases.
- Keep `package.json` dependencies reasonably up-to-date; run `npm audit` regularly.
- Review Dependabot alerts and security advisories promptly.

## Tauri-specific permissions
- `fs`: grant only if app needs file access; restrict scope to specific directories if possible.
- `process`: use sparingly; prefer calling Tauri commands with pre-defined operations over raw shell execution.
- `shell`: disabled by default — only enable if scripting is core to the app; validate all arguments.
- `http`: disabled by default — only enable if app makes outbound requests; restrict to allowlisted domains.

## Testing for security
- Include tests that verify input validation rejects malicious/malformed data.
- Test permission checks: ensure unauthorized operations fail gracefully.
- Scan dependencies: `cargo audit`, `npm audit` before every release.

