/** Package-owned invariant companion for the optional pi-ai OAuth bridge. */

import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = 'dsh-native-codex-oauth'

/** Cordis companion plugin name. */
export const name = 'experimental-llm-pi-ai-oauth-invariant'
/** Service required before the companion can reserve package ownership. */
export const inject = ['invariants']

// The authorization seam owns single-flight and commit invariants. This
// controller only projects that owned lifecycle onto an optional Remote.
const install: InvariantInstaller = () => {}

/** Register package ownership with the invariant registry. */
export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
