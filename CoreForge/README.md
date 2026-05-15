# CoreForge

Aplicación de escritorio (Tauri + React) para aplicar perfiles de uso en Windows y automatizar ajustes del sistema según contexto.

## Características

- 🎮 Perfil Gamer
- 🚀 Perfil Gamer Agresivo
- 💼 Perfil Trabajo
- 🛠️ Perfil Trabajo Dev
- ⚙️ Panel administrativo para reglas de apps (abrir/cerrar por perfil)
- 🦀 Ejecución nativa en Rust (sin scripts externos para aplicar perfiles)

## Stack tecnológico

- Frontend: React 19 + TypeScript + Vite
- Backend: Tauri 2 + Rust
- CI: GitHub Actions

## Documentación relacionada

- README del repositorio: ../README.md
- Contribución: ../CONTRIBUTING.md
- Arquitectura: ../docs/ARCHITECTURE.md
- Release y empaquetado: ../docs/RELEASE.md

## Requisitos

- Node.js 20+
- Rust toolchain
- Windows 10/11 para uso de perfiles

## Desarrollo local

```bash
# 1) Instalar dependencias
cd frontend
npm install

# 2) Ejecutar app de escritorio en modo dev
npm run tauri:dev
```

## Build de producción

```bash
# 1) Build frontend
cd frontend
npm run build

# 2) Build instaladores Tauri (NSIS/MSI)
npm run tauri:build
```

## Estructura del proyecto

```text
CoreForge/
├── frontend/                 # React + TypeScript
│   ├── src/
│   ├── public/
│   └── package.json
└── backend/
   └── src-tauri/            # Tauri + Rust
      ├── src/
      │   ├── commands/
      │   ├── services/
      │   └── models.rs
      └── tauri.conf.json
```

## Permisos y comportamiento

- La app ya no bloquea globalmente la aplicación de perfiles por no tener permisos de administrador.
- El estado de administrador se muestra como información de runtime.
- Algunas operaciones del sistema pueden seguir requiriendo elevación según la política del equipo o del sistema operativo.

## Iconos

Para regenerar iconos de Windows y limpiar assets no-Windows:

```bash
cd frontend
npm run tauri:icon:windows
```

## CI/CD

- El workflow principal se ejecuta en push a ramas de desarrollo/producción para evitar ejecuciones duplicadas por push + pull_request.

## Licencia

MIT
