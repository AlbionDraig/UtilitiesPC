# Gestor de Perfiles PC

Herramienta de escritorio Tauri para seleccionar y aplicar perfiles de sistema operativo optimizados para diferentes casos de uso.

## Características

- 🎮 **Perfil Gamer** - Optimizado para juegos
- 💼 **Perfil Trabajo** - Configuración productiva estándar
- 🚀 **Perfil Gamer Agresivo** - Máximo rendimiento para gaming extremo
- 🛠️ **Perfil Trabajo Dev** - Optimizado para desarrollo

## Stack tecnológico

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Tauri 2 + Rust
- **Scripts**: PowerShell 5.1

## Requisitos previos

- Node.js 18+
- Rust toolchain (para compilar Tauri)
- Windows 10/11

## Instalación y ejecución

### Modo desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run tauri dev
```

### Build para producción

```bash
npm run build
npm run tauri build
```

## Cómo funciona

1. La interfaz gráfica muestra 4 perfiles disponibles
2. Al seleccionar un perfil, se ejecuta el script PowerShell correspondiente
3. Los scripts automatizan tareas como:
   - Cerrar procesos innecesarios
   - Optimizar recursos del sistema
   - Configurar ajustes específicos del perfil

## Scripts disponibles

- `scripts/profiles/perfil_gamer.ps1` - Cierra aplicaciones pesadas para gaming
- `scripts/profiles/perfil_trabajo.ps1` - Configuración para trabajo general
- `scripts/profiles/perfil_gamer_agresivo.ps1` - Máxima optimización para juegos
- `scripts/profiles/perfil_trabajo_dev.ps1` - Ambiente para desarrollo
- `scripts/profiles/profile_core.ps1` - Núcleo compartido con lógica reutilizable para aplicar perfiles

## Estructura del proyecto

```
PerfilesPC/
├── src/                      # Frontend React
│   ├── App.tsx              # Componente principal
│   ├── App.css              # Estilos
│   └── main.tsx             # Punto de entrada
├── src-tauri/               # Backend Rust
│   ├── src/
│   │   ├── lib.rs           # Comandos Tauri
│   │   └── main.rs          # Punto de entrada
│   └── Cargo.toml
├── scripts/profiles/        # Scripts PowerShell
└── package.json
```

## Desarrollo

### Flujo de desarrollo

1. Editar `src/App.tsx` para cambios en UI
2. Editar `src-tauri/src/lib.rs` para comandos del backend
3. Los cambios se reflejan inmediatamente en modo dev

### Agregar un nuevo perfil

1. Crear nuevo script en `scripts/profiles/perfil_nuevo.ps1`
2. Agregar entrada en `get_profiles()` en `src-tauri/src/lib.rs`
3. La UI se actualiza automáticamente

## Troubleshooting

### Error: "Script not found"
Asegurate que los scripts PowerShell están en `scripts/profiles/`

### Error al ejecutar scripts
Verifica que PowerShell ejecutable policy permite ejecutar scripts:
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

## Licencia

MIT
