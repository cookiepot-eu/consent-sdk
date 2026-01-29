import { useCookiePotContext } from './provider';
import type { CookiePot } from '../client';
import type { ConsentCategories, ConsentCategory } from '../types';

/**
 * Hook to access the CookiePot SDK instance
 *
 * @returns The CookiePot SDK instance
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const sdk = useCookiePot();
 *
 *   return (
 *     <button onClick={() => sdk.showBanner()}>
 *       Show Cookie Banner
 *     </button>
 *   );
 * }
 * ```
 */
export function useCookiePot(): CookiePot {
  const { sdk } = useCookiePotContext();
  return sdk;
}

/**
 * Hook to access the current consent state (reactive)
 *
 * @returns The current consent categories
 *
 * @example
 * ```tsx
 * function ConsentStatus() {
 *   const consent = useConsent();
 *
 *   return (
 *     <div>
 *       Analytics: {consent.analytics ? 'Enabled' : 'Disabled'}
 *       Marketing: {consent.marketing ? 'Enabled' : 'Disabled'}
 *     </div>
 *   );
 * }
 * ```
 */
export function useConsent(): ConsentCategories {
  const { consent } = useCookiePotContext();
  return consent;
}

/**
 * Hook to check if a specific consent category is enabled (reactive)
 *
 * @param category - The consent category to check
 * @returns True if the category has consent, false otherwise
 *
 * @example
 * ```tsx
 * function AnalyticsComponent() {
 *   const hasAnalyticsConsent = useHasConsent('analytics');
 *
 *   if (!hasAnalyticsConsent) {
 *     return null;
 *   }
 *
 *   return <AnalyticsScript />;
 * }
 * ```
 */
export function useHasConsent(category: ConsentCategory): boolean {
  const consent = useConsent();
  return consent[category] === true;
}
