/** Browser entry for the optional pi-ai OAuth Models-page extension. */
import type { ReactNode } from 'react';
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { ProviderCardExtrasOwnerProps } from '@deepseek-ai/dsh-client-ui-settings-models/client';
import { en, type PiAiOAuthKey } from './locales.ts';
export type { PiAiOAuthCardActions, PiAiOAuthCardViewProps } from './PiAiOAuthCard.tsx';
export { PiAiOAuthCardView } from './PiAiOAuthCard.tsx';
export type { PiAiOAuthKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Optional pi-ai provider authorization copy. */
        'llm-pi-ai-oauth': PiAiOAuthKey;
    }
}
/** Services required by the browser plugin after its Remote contribution mounts. */
export declare const inject: string[];
/** Injected root dependencies of one provider-card occurrence. */
interface CardInjected {
    remote: ClientContext['remote'];
    t: (key: keyof typeof en) => string;
}
/** Props delivered by the provider-card slot. */
type CardProps = ProviderCardExtrasOwnerProps & CardInjected;
/**
 * Follow one provider's flow and bind its Remote actions.
 * @param props - Provider row, credential state, Remote client, and localized copy.
 * @returns the current authorization controls, failure notice, or no content while loading or withheld.
 */
export declare function PiAiOAuthCard(props: CardProps): ReactNode;
/** Mount the generated Remote contribution before registering its UI consumer. */
export declare function apply(ctx: ClientContext): Promise<() => Promise<void>>;
