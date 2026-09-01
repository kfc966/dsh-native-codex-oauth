/** Optional Remote controller for pi-ai provider authorization flows. */

import { randomUUID } from 'node:crypto'
import { Context } from '@deepseek-ai/cordis'
import type { AuthorizationInteraction, AuthorizationPrompt } from '@deepseek-ai/dsh-authorization'
import { parseCredentialKey } from '@deepseek-ai/dsh-credentials'
import type { CredentialKey } from '@deepseek-ai/dsh-credentials'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type {
  PiAiOAuthInteractionView,
  PiAiOAuthOutcome,
  PiAiOAuthPromptId,
  PiAiOAuthView,
} from './types.ts'

export type * from './types.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Optional browser bridge for pi-ai authorization flows. */
    piAiOAuth: PiAiOAuthController
  }
}

/** Host owner of the optional `piAiOAuth` Remote namespace. */
export class PiAiOAuthController extends TypertRemoteService {
  static inject = ['authorization', 'credentials']

  private readonly interactions = new Map<CredentialKey, PiAiOAuthInteractionView>()
  private readonly prompts = new Map<CredentialKey, PendingPrompt>()
  private readonly versions = new Map<CredentialKey, number>()
  private readonly waiters = new Map<CredentialKey, Set<() => void>>()

  /** @param ctx - Host context carrying authorization and credential seams. */
  constructor(ctx: Context) {
    super(ctx, 'piAiOAuth', { namespace: 'piAiOAuth' })
    ctx.on('credentials/record-updated', (key) => { this.publish(key) })
    ctx.on('authorization/settled', (key) => { this.publish(key) })
  }

  /**
   * Describe one registered flow and its value-free stored-record state.
   * @param rawKey - `<scope>/<id>` credential key.
   * @returns the live view, or undefined when no flow claims the key.
   */
  @Remote
  async describe(rawKey: string): Promise<PiAiOAuthView | undefined> {
    const key = this.key(rawKey)
    const flow = this.ctx.authorization.describe(key)
    if (flow === undefined) return undefined
    const interaction = this.interactions.get(key)
    return {
      key,
      label: flow.label,
      methods: flow.methods,
      inFlight: flow.inFlight,
      credential: await this.ctx.credentials.describeRecord(key),
      ...interaction === undefined ? {} : { interaction },
    }
  }

  /**
   * Run one authorization attempt.
   * @param rawKey - flow credential key.
   * @param method - flow-owned method id.
   * @param signal - caller cancellation.
   * @returns authorized or cancelled outcome.
   */
  @Remote
  async begin(rawKey: string, method: string, signal: AbortSignal): Promise<PiAiOAuthOutcome> {
    const key = this.key(rawKey)
    const interaction: AuthorizationInteraction = {
      notify: (notice) => {
        this.interactions.set(key, { ...this.interactions.get(key), notice })
        this.publish(key)
      },
      prompt: prompt => this.ask(key, prompt),
    }
    try {
      return await this.ctx.authorization.begin({ key, method, interaction, signal })
    } catch (error: unknown) {
      throw new RemoteError(
        'gateway/internal',
        error instanceof Error ? error.message : String(error),
        {},
        { cause: error },
      )
    } finally {
      this.rejectPrompt(key, new Error('authorization attempt ended'))
      this.interactions.delete(key)
      this.publish(key)
    }
  }

  /**
   * Answer the exact prompt currently waiting for this key.
   * @param rawKey - flow credential key.
   * @param rawPromptId - opaque prompt identity returned by `follow`.
   * @param value - text or selected option id.
   */
  @Remote
  answer(rawKey: string, rawPromptId: string, value: string): void {
    const key = this.key(rawKey)
    const pending = this.prompts.get(key)
    if (pending === undefined || pending.id !== rawPromptId) {
      throw new RemoteError('gateway/bad-request', 'authorization prompt is absent or stale', {})
    }
    this.prompts.delete(key)
    this.interactions.set(key, withoutPrompt(this.interactions.get(key)))
    pending.cleanup()
    pending.resolve(value)
    this.publish(key)
  }

  /**
   * Cancel an attempt from any browser observing its key.
   * @param rawKey - flow credential key.
   */
  @Remote
  cancel(rawKey: string): void {
    this.ctx.authorization.cancel(this.key(rawKey))
  }

  /**
   * Forget one stored authorization grant locally.
   * @param rawKey - flow credential key.
   */
  @Remote
  async signOut(rawKey: string): Promise<void> {
    await this.ctx.credentials.deleteRecord(this.key(rawKey))
  }

  /**
   * Stream a complete baseline and every later interaction or credential change.
   * @param rawKey - flow credential key.
   * @param signal - stream lifetime.
   * @returns current value-free authorization view after each change.
   */
  @Remote({ mode: 'stream' })
  async * follow(rawKey: string, signal: AbortSignal): AsyncIterable<PiAiOAuthView | undefined> {
    const key = this.key(rawKey)
    let seen = -1
    while (true) {
      if (signal.aborted) return
      const version = this.versions.get(key) ?? 0
      if (version === seen) {
        await this.changed(key, signal)
        continue
      }
      seen = this.versions.get(key) ?? 0
      yield await this.describe(key)
    }
  }

  /** Hold one browser-answerable prompt until an exact answer or withdrawal. */
  private ask(key: CredentialKey, prompt: AuthorizationPrompt): Promise<string> {
    if (this.prompts.has(key)) {
      return Promise.reject(new Error(`authorization flow for "${key}" requested concurrent prompts`))
    }
    const id = randomUUID() as PiAiOAuthPromptId
    const projected = 'options' in prompt
      ? { kind: prompt.kind, message: prompt.message, options: prompt.options.map(option => ({ ...option })) }
      : {
        kind: prompt.kind,
        message: prompt.message,
        ...prompt.placeholder === undefined ? {} : { placeholder: prompt.placeholder },
      }
    const settled = Promise.withResolvers<string>()
    const withdrawn = (): void => {
      this.prompts.delete(key)
      this.interactions.set(key, withoutPrompt(this.interactions.get(key)))
      settled.reject(prompt.signal?.reason)
      this.publish(key)
    }
    prompt.signal?.addEventListener('abort', withdrawn, { once: true })
    const cleanup = (): void => { prompt.signal?.removeEventListener('abort', withdrawn) }
    this.prompts.set(key, { id, resolve: settled.resolve, reject: settled.reject, cleanup })
    this.interactions.set(key, {
      ...this.interactions.get(key),
      prompt: { id, prompt: projected },
    })
    this.publish(key)
    return settled.promise.finally(cleanup)
  }

  /** Reject and remove one pending prompt, when present. */
  private rejectPrompt(key: CredentialKey, reason: unknown): void {
    const pending = this.prompts.get(key)
    if (pending === undefined) return
    this.prompts.delete(key)
    pending.cleanup()
    pending.reject(reason)
  }

  /** Advance one key's revision and wake every stream waiting on it. */
  private publish(key: CredentialKey): void {
    this.versions.set(key, (this.versions.get(key) ?? 0) + 1)
    const waiters = this.waiters.get(key)
    this.waiters.delete(key)
    for (const wake of waiters ?? []) wake()
  }

  /** Wait until a key changes, without missing a change racing registration. */
  private changed(key: CredentialKey, signal: AbortSignal): Promise<void> {
    return new Promise<void>((resolve) => {
      const waiters = this.waiters.get(key) ?? new Set<() => void>()
      const finish = (): void => {
        signal.removeEventListener('abort', finish)
        waiters.delete(finish)
        if (waiters.size === 0) this.waiters.delete(key)
        resolve()
      }
      waiters.add(finish)
      this.waiters.set(key, waiters)
      signal.addEventListener('abort', finish, { once: true })
    })
  }

  /** Validate and brand one untrusted wire key. */
  private key(rawKey: string): CredentialKey {
    try {
      return parseCredentialKey(rawKey)
    } catch (error: unknown) {
      throw new RemoteError('gateway/bad-request', 'invalid pi-ai OAuth credential key', {}, { cause: error })
    }
  }
}

/** One prompt resolver owned by the currently running attempt. */
interface PendingPrompt {
  readonly id: PiAiOAuthPromptId
  readonly resolve: (value: string) => void
  readonly reject: (reason?: unknown) => void
  readonly cleanup: () => void
}

/** Remove the optional prompt without materializing an explicit undefined member. */
function withoutPrompt(interaction: PiAiOAuthInteractionView | undefined): PiAiOAuthInteractionView {
  if (interaction?.notice === undefined) return {}
  return { notice: interaction.notice }
}

export default PiAiOAuthController
