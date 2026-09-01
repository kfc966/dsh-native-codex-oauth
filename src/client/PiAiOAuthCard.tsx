/** Provider-card presentation for one pi-ai authorization flow. */

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { PiAiOAuthPromptId, PiAiOAuthView } from 'dsh-native-codex-oauth/types'
import type { en } from './locales.ts'
import styles from './PiAiOAuthCard.module.css'

/** User actions exposed by the browser-side Remote binding. */
export interface PiAiOAuthCardActions {
  /** Start the selected flow method. */
  begin(method: string): void
  /** Answer the current prompt. */
  answer(promptId: PiAiOAuthPromptId, value: string): void
  /** Cancel the current attempt. */
  cancel(): void
  /** Delete the stored grant locally. */
  signOut(): void
}

/** Props of the pure provider-card presentation. */
export interface PiAiOAuthCardViewProps {
  /** Current value-free Host view. */
  view: PiAiOAuthView
  /** Bound Remote actions. */
  actions: PiAiOAuthCardActions
  /** Localized copy lookup. */
  t: (key: keyof typeof en) => string
}

/** Render one authorization flow without ever receiving its stored grant. */
export function PiAiOAuthCardView({ view, actions, t }: PiAiOAuthCardViewProps): ReactNode {
  const prompt = view.interaction?.prompt
  const [answer, setAnswer] = useState('')
  useEffect(() => { setAnswer('') }, [prompt?.id])

  if (view.credential.configured) {
    return (
      <div className={styles.row}>
        <span className={styles.status}>{t('signedIn')}</span>
        <button type="button" className={styles.secondary} onClick={() => { actions.signOut() }}>{t('signOut')}</button>
      </div>
    )
  }

  if (!view.inFlight) {
    return (
      <div className={styles.row}>
        {view.methods.map(method => (
          <button
            type="button"
            className={styles.primary}
            key={method.id}
            onClick={() => { actions.begin(method.id) }}
          >
            {method.label}
          </button>
        ))}
      </div>
    )
  }

  const submit = (): void => {
    if (prompt === undefined || answer.length === 0) return
    actions.answer(prompt.id, answer)
  }

  return (
    <div className={styles.attempt}>
      <div className={styles.row}>
        <span className={styles.status}>{t('signingIn')}</span>
        <button type="button" className={styles.secondary} onClick={() => { actions.cancel() }}>{t('cancel')}</button>
      </div>
      {view.interaction?.notice === undefined
        ? null
        : (
          <p className={styles.message}>
            {view.interaction.notice.message}
            {view.interaction.notice.url === undefined
              ? null
              : (
                <>{' '}<a href={view.interaction.notice.url} target="_blank" rel="noreferrer">{t('openPage')}</a></>
              )}
            {view.interaction.notice.code === undefined
              ? null
              : <code className={styles.code}>{view.interaction.notice.code}</code>}
          </p>
        )}
      {prompt === undefined
        ? null
        : (
          <div className={styles.prompt}>
            <label htmlFor={`oauth-${prompt.id}`}>{prompt.prompt.message}</label>
            {'options' in prompt.prompt
              ? (
                <select
                  id={`oauth-${prompt.id}`}
                  value={answer}
                  onChange={(event) => { setAnswer(event.target.value) }}
                >
                  <option value="" />
                  {prompt.prompt.options.map(option => (
                    <option value={option.id} key={option.id}>{option.label}</option>
                  ))}
                </select>
              )
              : (
                <input
                  id={`oauth-${prompt.id}`}
                  type={prompt.prompt.kind === 'secret' ? 'password' : 'text'}
                  autoComplete="off"
                  value={answer}
                  placeholder={prompt.prompt.placeholder ?? ''}
                  onChange={(event) => { setAnswer(event.target.value) }}
                  onKeyDown={(event) => { if (event.key === 'Enter') submit() }}
                />
              )}
            <button type="button" className={styles.primary} disabled={answer.length === 0} onClick={submit}>
              {t('continue')}
            </button>
          </div>
        )}
    </div>
  )
}
