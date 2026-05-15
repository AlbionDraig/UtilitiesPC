# Contributing

Gracias por contribuir a UtilitiesPC.

## Alcance

Este repositorio usa un flujo centrado en CoreForge.

## Requisitos

- Node.js 20+
- Rust toolchain estable
- Git
- Windows 10/11 para pruebas funcionales de perfiles

## Flujo de trabajo

1. Crea una rama desde develop.
2. Implementa un cambio enfocado.
3. Ejecuta validaciones locales.
4. Abre PR hacia develop o master segun el flujo acordado.

## Convenciones de ramas

- feature/<descripcion-corta>
- fix/<descripcion-corta>
- chore/<descripcion-corta>
- docs/<descripcion-corta>

## Convenciones de commits

Usar Conventional Commits en ingles:

```text
<type>(<scope>): <descripcion imperativa>
```

Tipos sugeridos: feat, fix, refactor, chore, docs, test, ci, perf, revert.

## Validaciones locales

Desde CoreForge/frontend:

```bash
npm ci
npm run lint
npm run build
npm run test
npm run test:i18n
```

Desde CoreForge/backend/src-tauri:

```bash
cargo check
```

Build de instalador (opcional para verificar empaquetado):

```bash
cd CoreForge/frontend
npm run build
cd ../backend/src-tauri
..\..\frontend\node_modules\.bin\tauri build
```

## Pull Requests

Incluye en la descripcion:

- Problema
- Solucion
- Riesgos
- Evidencia de pruebas

Mantener PRs pequenos y orientados a un solo objetivo.

## Seguridad

- No subir secretos, tokens o credenciales.
- No hardcodear claves en frontend/backend.
- Validar entradas externas en fronteras del sistema.
