import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminPanel } from '../hooks/useAdminPanel'
import type { AppAction, AppRule } from '../types/config'
import type { Profile } from '../types/profiles'
import './AdminPanel.css'

interface Props {
  profiles: Profile[]
  onClose: () => void
}

function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

export function AdminPanel({ profiles, onClose }: Props) {
  const { t } = useTranslation()
  const { config, saving, saveError, saved, dirty, addRule, removeRule, save } = useAdminPanel()

  const [activeProfileId, setActiveProfileId] = useState<string>(profiles[0]?.id ?? '')
  const [newAction, setNewAction] = useState<AppAction>('close')
  const [newLabel, setNewLabel] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newArgs, setNewArgs] = useState('')

  if (!config) {
    return (
      <div className="adm-overlay">
        <div className="adm-panel">
          <p className="adm-loading">{t('admin.loading')}</p>
        </div>
      </div>
    )
  }

  const activeRules = config.profiles[activeProfileId]?.rules ?? []

  function handleAddRule() {
    const label = newLabel.trim()
    const value = newValue.trim()
    if (!label || !value) return

    const rule: AppRule = {
      id: generateId(),
      label,
      action: newAction,
      processName: newAction === 'close' ? value : undefined,
      executablePath: newAction === 'open' ? value : undefined,
      args:
        newAction === 'open' && newArgs.trim()
          ? newArgs.trim().split(/\s+/)
          : [],
    }

    addRule(activeProfileId, rule)
    setNewLabel('')
    setNewValue('')
    setNewArgs('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAddRule()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="adm-overlay" role="dialog" aria-modal="true" aria-label={t('admin.title')}>
      <div className="adm-panel" onKeyDown={handleKeyDown}>
        {/* Header */}
        <header className="adm-header">
          <h2 className="adm-title">⚙ {t('admin.title')}</h2>
          <button className="adm-close" onClick={onClose} aria-label={t('admin.close')}>
            ✕
          </button>
        </header>

        {/* Profile tabs */}
        <nav className="adm-tabs" aria-label={t('admin.profileSelector')}>
          {profiles.map((p) => (
            <button
              key={p.id}
              className={`adm-tab${activeProfileId === p.id ? ' adm-tab--active' : ''}`}
              onClick={() => setActiveProfileId(p.id)}
            >
              {t(`profile.names.${p.id}`, { defaultValue: p.name })}
            </button>
          ))}
        </nav>

        {/* Rules list */}
        <div className="adm-body">
          {activeRules.length === 0 ? (
            <p className="adm-empty">{t('admin.noRules')}</p>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>{t('admin.colAction')}</th>
                  <th>{t('admin.colLabel')}</th>
                  <th>{t('admin.colValue')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {activeRules.map((rule) => (
                  <tr key={rule.id} className={`adm-row adm-row--${rule.action}`}>
                    <td>
                      <span className={`adm-badge adm-badge--${rule.action}`}>
                        {t(`admin.action.${rule.action}`)}
                      </span>
                    </td>
                    <td className="adm-cell-label">{rule.label}</td>
                    <td className="adm-cell-value">
                      {rule.action === 'close' ? rule.processName : rule.executablePath}
                      {rule.args && rule.args.length > 0 && (
                        <span className="adm-args"> {rule.args.join(' ')}</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="adm-btn adm-btn--remove"
                        onClick={() => removeRule(activeProfileId, rule.id)}
                        aria-label={t('admin.removeRule')}
                        title={t('admin.removeRule')}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Add rule form */}
          <div className="adm-add">
            <h3 className="adm-add-title">{t('admin.addRuleTitle')}</h3>
            <div className="adm-add-form">
              <select
                value={newAction}
                onChange={(e) => setNewAction(e.target.value as AppAction)}
                className="adm-select"
                aria-label={t('admin.colAction')}
              >
                <option value="close">{t('admin.action.close')}</option>
                <option value="open">{t('admin.action.open')}</option>
              </select>

              <input
                type="text"
                placeholder={t('admin.labelPlaceholder')}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="adm-input"
                aria-label={t('admin.colLabel')}
              />

              <input
                type="text"
                placeholder={
                  newAction === 'close'
                    ? t('admin.processNamePlaceholder')
                    : t('admin.executablePathPlaceholder')
                }
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="adm-input adm-input--wide"
                aria-label={t('admin.colValue')}
              />

              {newAction === 'open' && (
                <input
                  type="text"
                  placeholder={t('admin.argsPlaceholder')}
                  value={newArgs}
                  onChange={(e) => setNewArgs(e.target.value)}
                  className="adm-input"
                  aria-label={t('admin.argsPlaceholder')}
                />
              )}

              <button
                className="adm-btn adm-btn--add"
                onClick={handleAddRule}
                disabled={!newLabel.trim() || !newValue.trim()}
              >
                + {t('admin.addRule')}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="adm-footer">
          <div className="adm-footer-status">
            {saveError && <span className="adm-status adm-status--error">{saveError}</span>}
            {saved && <span className="adm-status adm-status--saved">✓ {t('admin.saved')}</span>}
            {dirty && !saved && (
              <span className="adm-status adm-status--dirty">{t('admin.unsaved')}</span>
            )}
          </div>
          <button
            className="adm-btn adm-btn--save"
            onClick={() => void save()}
            disabled={saving || !dirty}
          >
            {saving ? t('admin.saving') : t('admin.save')}
          </button>
        </footer>
      </div>
    </div>
  )
}
