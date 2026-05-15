import type { FullConfig } from '../types/config'

/**
 * Default app rules mirroring the Rust config_service::default_config().
 * Used in browser mode (no Tauri IPC) so the admin panel is previewable.
 * Paths that depend on %LOCALAPPDATA% use a generic placeholder.
 */
export const DEFAULT_CONFIG: FullConfig = {
  profiles: {
    gamer: {
      rules: [
        { id: 'g1', label: 'Docker Desktop',      action: 'close', processName: 'Docker Desktop' },
        { id: 'g2', label: 'Docker Backend',       action: 'close', processName: 'com.docker.backend' },
        { id: 'g3', label: 'Discord',              action: 'close', processName: 'Discord' },
        { id: 'g4', label: 'Spotify',              action: 'close', processName: 'Spotify' },
        { id: 'g5', label: 'Epic Games Launcher',  action: 'close', processName: 'EpicGamesLauncher' },
        { id: 'g6', label: 'Steam',                action: 'close', processName: 'Steam' },
        { id: 'g7', label: 'Overwolf',             action: 'close', processName: 'Overwolf' },
        { id: 'g8', label: 'Microsoft Edge',       action: 'close', processName: 'msedge' },
        { id: 'g9', label: 'Opera',                action: 'close', processName: 'opera' },
      ],
    },
    gamer_agresivo: {
      rules: [
        { id: 'ga1',  label: 'Docker Desktop',      action: 'close', processName: 'Docker Desktop' },
        { id: 'ga2',  label: 'Docker Backend',       action: 'close', processName: 'com.docker.backend' },
        { id: 'ga3',  label: 'Discord',              action: 'close', processName: 'Discord' },
        { id: 'ga4',  label: 'Spotify',              action: 'close', processName: 'Spotify' },
        { id: 'ga5',  label: 'Epic Games Launcher',  action: 'close', processName: 'EpicGamesLauncher' },
        { id: 'ga6',  label: 'Steam',                action: 'close', processName: 'Steam' },
        { id: 'ga7',  label: 'Overwolf',             action: 'close', processName: 'Overwolf' },
        { id: 'ga8',  label: 'Microsoft Edge',       action: 'close', processName: 'msedge' },
        { id: 'ga9',  label: 'Opera',                action: 'close', processName: 'opera' },
        { id: 'ga10', label: 'OneDrive',             action: 'close', processName: 'OneDrive' },
        { id: 'ga11', label: 'Teams',                action: 'close', processName: 'Teams' },
        { id: 'ga12', label: 'WhatsApp',             action: 'close', processName: 'WhatsApp' },
        { id: 'ga13', label: 'Telegram',             action: 'close', processName: 'Telegram' },
        { id: 'ga14', label: 'Adobe Acrobat',        action: 'close', processName: 'AdobeAcrobat' },
      ],
    },
    trabajo: {
      rules: [
        {
          id: 't1',
          label: 'Docker Desktop',
          action: 'open',
          executablePath: 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe',
          args: [],
        },
        {
          id: 't2',
          label: 'Discord',
          action: 'open',
          executablePath: '%LOCALAPPDATA%\\Discord\\Update.exe',
          args: ['--processStart', 'Discord.exe'],
        },
      ],
    },
    trabajo_dev: {
      rules: [
        {
          id: 'td1',
          label: 'Docker Desktop',
          action: 'open',
          executablePath: 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe',
          args: [],
        },
        {
          id: 'td2',
          label: 'Discord',
          action: 'open',
          executablePath: '%LOCALAPPDATA%\\Discord\\Update.exe',
          args: ['--processStart', 'Discord.exe'],
        },
        {
          id: 'td3',
          label: 'VS Code',
          action: 'open',
          executablePath: '%LOCALAPPDATA%\\Programs\\Microsoft VS Code\\Code.exe',
          args: [],
        },
        {
          id: 'td4',
          label: 'Windows Terminal',
          action: 'open',
          executablePath: 'wt',
          args: [],
        },
      ],
    },
  },
}
