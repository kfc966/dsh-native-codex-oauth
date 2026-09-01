/** Package-owned invariant companion for the optional pi-ai OAuth bridge. */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis companion plugin name. */
export declare const name = "experimental-llm-pi-ai-oauth-invariant";
/** Service required before the companion can reserve package ownership. */
export declare const inject: string[];
/** Register package ownership with the invariant registry. */
export declare const apply: (ctx: Context) => Promise<() => void>;
