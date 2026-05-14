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
- **Ejecución de perfiles**: Orquestación nativa en Rust (sin scripts externos)

## Requisitos previos

- Node.js 18+
- Rust toolchain (para compilar Tauri)
- Windows 10/11

## Instalación y ejecución

### Modo desarrollo

```bash
# Instalar dependencias (desde frontend/)
cd frontend && npm install

# Ejecutar en modo desarrollo (desde backend/src-tauri/)
cd backend/src-tauri && cargo tauri dev
```

### Build para producción

```bash
# Desde frontend/
cd frontend && npm run build
# Desde backend/src-tauri/
cd backend/src-tauri && cargo tauri build
```

## Cómo funciona

1. La interfaz gráfica muestra 4 perfiles disponibles
2. Al seleccionar un perfil, el backend Rust ejecuta operaciones nativas de Windows
3. El backend automatiza tareas como:
   - Cerrar procesos innecesarios
   - Optimizar recursos del sistema
   - Configurar ajustes específicos del perfil

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
└── package.json
```

## Desarrollo

### Flujo de desarrollo

1. Editar `src/App.tsx` para cambios en UI
2. Editar `src-tauri/src/lib.rs` para comandos del backend
3. Los cambios se reflejan inmediatamente en modo dev

### Agregar un nuevo perfil

1. Agregar entrada en catálogo de perfiles backend
2. Implementar la lógica del nuevo perfil en el servicio de perfiles de Rust
3. La UI se actualiza automáticamente

## Troubleshooting

### Error al aplicar perfiles
Verifica que la app se ejecuta como administrador en Windows.

## Licencia

MIT
