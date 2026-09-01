/** Browser entry for the optional pi-ai OAuth Models-page extension. */

import { createElement, Fragment, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import piAiOAuthRemote from '../remote.ts'
import type { PiAiOAuthView } from '../types.ts'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { ProviderCardExtrasOwnerProps } from '@deepseek-ai/dsh-client-ui-settings-models/client'
import { PiAiOAuthCardView, type PiAiOAuthCardActions } from './PiAiOAuthCard.tsx'
import { en, zh, type PiAiOAuthKey } from './locales.ts'

export type { PiAiOAuthCardActions, PiAiOAuthCardViewProps } from './PiAiOAuthCard.tsx'
export { PiAiOAuthCardView } from './PiAiOAuthCard.tsx'
export type { PiAiOAuthKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Optional pi-ai provider authorization copy. */
    'llm-pi-ai-oauth': PiAiOAuthKey
  }
}

const NS = 'llm-pi-ai-oauth'

/** Services required by the browser plugin after its Remote contribution mounts. */
export const inject = ['remote', 'slots', 'locale']

/** Injected root dependencies of one provider-card occurrence. */
interface CardInjected {
  remote: ClientContext['remote']
  t: (key: keyof typeof en) => string
}

/** Props delivered by the provider-card slot. */
type CardProps = ProviderCardExtrasOwnerProps & CardInjected

/**
 * Follow one provider's flow and bind its Remote actions.
 * @param props - Provider row, credential state, Remote client, and localized copy.
 * @returns the current authorization controls, failure notice, or no content while loading or withheld.
 */
export function PiAiOAuthCard(props: CardProps): ReactNode {
  const { provider, keyConfigured, remote, t } = props
  const [view, setView] = useState<PiAiOAuthView | undefined>()
  const [failed, setFailed] = useState(false)
  const key = `llm-pi-ai/${provider.provider}`

  useEffect(() => {
    if (keyConfigured) return
    const lifetime = new AbortController()
    void (async () => {
      try {
        for await (const next of remote.piAiOAuth.follow(key, lifetime.signal)) setView(next)
      } catch {
        if (!lifetime.signal.aborted) setFailed(true)
      }
    })()
    return () => { lifetime.abort() }
  }, [key, keyConfigured, remote])

  const actions = useMemo<PiAiOAuthCardActions>(() => ({
    begin(method) {
      setFailed(false)
      void remote.piAiOAuth.begin(key, method, new AbortController().signal).then((result) => {
        if (!result.ok) setFailed(true)
      })
    },
    answer(promptId, value) {
      setFailed(false)
      void remote.piAiOAuth.answer(key, promptId, value).then((result) => {
        if (!result.ok) setFailed(true)
      })
    },
    cancel() {
      void remote.piAiOAuth.cancel(key).then((result) => {
        if (!result.ok) setFailed(true)
      })
    },
    signOut() {
      setFailed(false)
      void remote.piAiOAuth.signOut(key).then((result) => {
        if (!result.ok) setFailed(true)
      })
    },
  }), [key, remote])

  if (keyConfigured) return null
  if (view === undefined) return failed ? createElement('p', { role: 'alert' }, t('failed')) : null
  return createElement(
    Fragment,
    null,
    createElement(PiAiOAuthCardView, { view, actions, t }),
    failed ? createElement('p', { role: 'alert' }, t('failed')) : null,
  )
}

/** Register copy and the keyed pi-ai provider-card extension. */
function registerUi(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'client-ui-llm-pi-ai-oauth: dictionaries')
  const t = ctx.locale.bind(NS) as CardInjected['t']
  ctx.slots.inject('settings.models.provider-card', () => ctx.slots.register({
    name: 'settings.models.provider-card',
    key: 'llm-pi-ai',
    locale: NS,
    inject: (): CardInjected => ({ remote: ctx.remote, t }),
  }, PiAiOAuthCard))
}

/** Mount the generated Remote contribution before registering its UI consumer. */
export async function apply(ctx: ClientContext): Promise<() => Promise<void>> {
  const disposeRemote = await ctx.remote.$mount(piAiOAuthRemote)
  const ui = ctx.inject(['remote.piAiOAuth', 'slots', 'locale'], registerUi)
  try {
    await ui
  } catch (error) {
    await ui.dispose()
    await disposeRemote()
    throw error
  }
  return async () => {
    await ui.dispose()
    await disposeRemote()
  }
}
