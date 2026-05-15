# Release y empaquetado

## Objetivo

Publicar instaladores de CoreForge para Windows con validaciones minimas de calidad.

## Pre-checks recomendados

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

## Generacion de iconos Windows

Si hubo cambios de branding/iconos:

```bash
cd CoreForge/frontend
npm run tauri:icon:windows
```

## Build de instaladores

```bash
cd CoreForge/frontend
npm run build
cd ../backend/src-tauri
..\..\frontend\node_modules\.bin\tauri build
```

Artefactos esperados:

- target/release/bundle/nsis/CoreForge_0.1.0_x64-setup.exe
- target/release/bundle/msi/CoreForge_0.1.0_x64_en-US.msi

## Estrategia de ramas

- develop: integracion
- master: produccion

Se recomienda mergear a master solo con checks requeridos en verde.

## Checklist de release

- Version y metadata revisadas en tauri.conf.json
- QA funcional basica en Windows
- Instalacion/actualizacion y desinstalacion verificadas
- Notas de cambio resumidas en PR
