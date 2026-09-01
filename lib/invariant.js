//#region lib/types/invariant.js
/** Package-owned invariant companion for the optional pi-ai OAuth bridge. */
const PACKAGE_NAME = "dsh-native-codex-oauth";
/** Cordis companion plugin name. */
const name = "experimental-llm-pi-ai-oauth-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
const install = () => {};
/** Register package ownership with the invariant registry. */
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
