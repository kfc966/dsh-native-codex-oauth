/** Copy for the optional pi-ai OAuth provider-card extension. */

export const en = {
  signedIn: 'Signed in',
  signOut: 'Sign out',
  signingIn: 'Signing in…',
  cancel: 'Cancel sign-in',
  openPage: 'Open authorization page',
  continue: 'Continue',
  failed: 'Sign-in failed. Please try again.',
}

/** Stable keys in the pi-ai OAuth browser dictionary. */
export type PiAiOAuthKey = keyof typeof en

/** Simplified Chinese pi-ai OAuth browser copy. */
export const zh: { [Key in PiAiOAuthKey]: string } = {
  signedIn: '已登录',
  signOut: '退出登录',
  signingIn: '登录中…',
  cancel: '取消登录',
  openPage: '打开授权页面',
  continue: '继续',
  failed: '登录失败，请重试。',
}
