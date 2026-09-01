/** Provider-card presentation for one pi-ai authorization flow. */
import type { ReactNode } from 'react';
import type { PiAiOAuthPromptId, PiAiOAuthView } from 'dsh-native-codex-oauth/types';
import type { en } from './locales.ts';
/** User actions exposed by the browser-side Remote binding. */
export interface PiAiOAuthCardActions {
    /** Start the selected flow method. */
    begin(method: string): void;
    /** Answer the current prompt. */
    answer(promptId: PiAiOAuthPromptId, value: string): void;
    /** Cancel the current attempt. */
    cancel(): void;
    /** Delete the stored grant locally. */
    signOut(): void;
}
/** Props of the pure provider-card presentation. */
export interface PiAiOAuthCardViewProps {
    /** Current value-free Host view. */
    view: PiAiOAuthView;
    /** Bound Remote actions. */
    actions: PiAiOAuthCardActions;
    /** Localized copy lookup. */
    t: (key: keyof typeof en) => string;
}
/** Render one authorization flow without ever receiving its stored grant. */
export declare function PiAiOAuthCardView({ view, actions, t }: PiAiOAuthCardViewProps): ReactNode;
