/** Optional Remote controller for pi-ai provider authorization flows. */
import { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { PiAiOAuthOutcome, PiAiOAuthView } from './types.ts';
export type * from './types.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        /** Optional browser bridge for pi-ai authorization flows. */
        piAiOAuth: PiAiOAuthController;
    }
}
/** Host owner of the optional `piAiOAuth` Remote namespace. */
export declare class PiAiOAuthController extends TypertRemoteService {
    static inject: string[];
    private readonly interactions;
    private readonly prompts;
    private readonly versions;
    private readonly waiters;
    /** @param ctx - Host context carrying authorization and credential seams. */
    constructor(ctx: Context);
    /**
     * Describe one registered flow and its value-free stored-record state.
     * @param rawKey - `<scope>/<id>` credential key.
     * @returns the live view, or undefined when no flow claims the key.
     */
    describe(rawKey: string): Promise<PiAiOAuthView | undefined>;
    /**
     * Run one authorization attempt.
     * @param rawKey - flow credential key.
     * @param method - flow-owned method id.
     * @param signal - caller cancellation.
     * @returns authorized or cancelled outcome.
     */
    begin(rawKey: string, method: string, signal: AbortSignal): Promise<PiAiOAuthOutcome>;
    /**
     * Answer the exact prompt currently waiting for this key.
     * @param rawKey - flow credential key.
     * @param rawPromptId - opaque prompt identity returned by `follow`.
     * @param value - text or selected option id.
     */
    answer(rawKey: string, rawPromptId: string, value: string): void;
    /**
     * Cancel an attempt from any browser observing its key.
     * @param rawKey - flow credential key.
     */
    cancel(rawKey: string): void;
    /**
     * Forget one stored authorization grant locally.
     * @param rawKey - flow credential key.
     */
    signOut(rawKey: string): Promise<void>;
    /**
     * Stream a complete baseline and every later interaction or credential change.
     * @param rawKey - flow credential key.
     * @param signal - stream lifetime.
     * @returns current value-free authorization view after each change.
     */
    follow(rawKey: string, signal: AbortSignal): AsyncIterable<PiAiOAuthView | undefined>;
    /** Hold one browser-answerable prompt until an exact answer or withdrawal. */
    private ask;
    /** Reject and remove one pending prompt, when present. */
    private rejectPrompt;
    /** Advance one key's revision and wake every stream waiting on it. */
    private publish;
    /** Wait until a key changes, without missing a change racing registration. */
    private changed;
    /** Validate and brand one untrusted wire key. */
    private key;
}
export default PiAiOAuthController;
