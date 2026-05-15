# Arquitectura

## Vista general

CoreForge es una aplicacion de escritorio con arquitectura por capas:

- Presentacion: React (CoreForge/frontend)
- Aplicacion/entrypoints: comandos Tauri (CoreForge/backend/src-tauri/src/commands)
- Dominio y reglas: modelos/servicios Rust (CoreForge/backend/src-tauri/src/models.rs y services)
- Infraestructura: sistema operativo Windows (powercfg, taskkill, wsl), filesystem de configuracion

## Frontend

Tecnologias:

- React 19
- TypeScript
- Vite
- i18next

Responsabilidades:

- Renderizar perfiles y estado runtime
- Invocar comandos Tauri mediante @tauri-apps/api
- Gestionar panel administrativo de reglas por perfil

## Backend (Tauri + Rust)

Responsabilidades:

- Exponer comandos IPC seguros hacia frontend
- Aplicar perfiles del sistema
- Administrar configuracion persistida de reglas de apps
- Entregar errores estructurados al frontend

Componentes clave:

- src/commands/profile_commands.rs
- src/services/profile_service.rs
- src/services/config_service.rs
- src/error.rs

## Perfilado de sistema

Al aplicar un perfil se pueden ejecutar acciones como:

- Cerrar procesos configurados
- Abrir aplicaciones configuradas
- Ajustar plan de energia con powercfg
- Cerrar WSL cuando aplica

Nota de permisos:

- La app no bloquea globalmente por no ser admin.
- Algunas operaciones pueden requerir elevacion segun politicas del SO/equipo.

## Configuracion

La configuracion editable por el panel administrativo se persiste fuera del frontend en el backend.

## CI

Workflow principal:

- .github/workflows/coreforge-quality.yml

Ejecucion:

- Push a develop/master/main

Checks:

- Frontend quality
- Tauri cargo check
