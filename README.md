# UtilitiesPC

Repositorio principal para herramientas de perfiles de rendimiento en Windows.

Actualmente contiene un proyecto activo:

- CoreForge: aplicación desktop construida con Tauri + React para aplicar perfiles de uso (trabajo, desarrollo y gaming).

## Estructura del repositorio

```text
UtilitiesPC/
├── .github/
│   └── workflows/
│       └── coreforge-quality.yml
└── CoreForge/
    ├── backend/
    │   └── src-tauri/
    ├── frontend/
    └── README.md
```

## Flujo de ramas

- develop: rama de desarrollo e integración.
- master: rama de producción.

## CI

El workflow principal está en .github/workflows/coreforge-quality.yml y ejecuta validaciones en push a:

- develop
- master
- main (compatibilidad)

Validaciones actuales:

- frontend: lint, build, unit tests, i18n tests
- backend (tauri): cargo check

## Documentación

- Guía del proyecto: CoreForge/README.md
- Contribución: CONTRIBUTING.md
- Arquitectura: docs/ARCHITECTURE.md
- Releases y empaquetado: docs/RELEASE.md

## Inicio rápido

```bash
cd CoreForge/frontend
npm install
npm run tauri:dev
```

## Licencia

MIT
