/** Browser-safe views for the optional pi-ai authorization surface. */

import type {
  AuthorizationMethod,
  AuthorizationNotice,
  AuthorizationOutcome,
  AuthorizationPrompt,
} from '@deepseek-ai/dsh-authorization/types'
import type { CredentialKey, CredentialRecordInfo } from '@deepseek-ai/dsh-credentials'
import type { Branded } from '@deepseek-ai/dsh-brand'

/** Distributively remove the process-local signal from each prompt variant. */
type WirePrompt<Prompt> = Prompt extends unknown ? Omit<Prompt, 'signal'> : never

/** Opaque identity of one browser-answerable authorization prompt. */
export type PiAiOAuthPromptId = Branded<'PiAiOAuthPromptId'>

/** A prompt currently waiting for a browser answer. */
export interface PiAiOAuthPromptView {
  /** Opaque prompt identity required by `answer`. */
  readonly id: PiAiOAuthPromptId
  /** Prompt presentation with its process-local AbortSignal removed. */
  readonly prompt: WirePrompt<AuthorizationPrompt>
}

/** Live interaction state of one authorization attempt. */
export interface PiAiOAuthInteractionView {
  /** Most recent progress notice, when the flow emitted one. */
  readonly notice?: AuthorizationNotice
  /** Question currently waiting for an answer. */
  readonly prompt?: PiAiOAuthPromptView
}

/** One authorization flow and its value-free credential state. */
export interface PiAiOAuthView {
  /** Credential record claimed by the flow. */
  readonly key: CredentialKey
  /** Provider-facing label. */
  readonly label: string
  /** Methods the flow offers. */
  readonly methods: readonly AuthorizationMethod[]
  /** Whether the authorization seam currently owns an attempt for this key. */
  readonly inFlight: boolean
  /** Stored-record presence and kind, never its value. */
  readonly credential: CredentialRecordInfo
  /** Browser interaction state while an attempt is running. */
  readonly interaction?: PiAiOAuthInteractionView
}

/** Result returned when an attempt ends normally. */
export type PiAiOAuthOutcome = AuthorizationOutcome
