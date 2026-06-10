# Groundster Monitor - Backend & Desktop App

Núcleo y API de Groundster Monitor. Este proyecto maneja la persistencia de datos (SQLite), provee la API para el frontend, y actúa como el envoltorio de la aplicación de escritorio usando Electron.

## Requisitos
- Node.js (v18 o superior)
- npm

## Instalación
```bash
npm install
```

## Scripts Principales
- `npm start`: Inicia el servidor web backend.
- `npm run init-db`: Inicializa o resetea la estructura de la base de datos local.
- `npm run electron:dev`: Inicia la aplicación de escritorio en modo desarrollo.
- `npm run build:desktop`: Empaqueta y compila la aplicación para su distribución. Genera el ejecutable `.exe` y los archivos necesarios para las actualizaciones automáticas.

## Sobre las Actualizaciones Automáticas
Este proyecto utiliza `electron-updater`. Cuando se genera un nuevo *build* cambiando la versión en el `package.json` y se publica en los *Releases* de GitHub, la aplicación lo detectará en segundo plano y notificará al usuario final para que se instale la actualización de forma silenciosa.
