/**
 * CookiePot React Integration
 *
 * React hooks and components for easy integration of the CookiePot consent SDK.
 *
 * @example
 * ```tsx
 * import { CookiePotProvider, ConsentBanner, useConsent } from '@cookiepot/consent/react';
 *
 * function App() {
 *   return (
 *     <CookiePotProvider config={{ apiKey: 'your-key', domain: 'example.com' }}>
 *       <ConsentBanner />
 *       <YourApp />
 *     </CookiePotProvider>
 *   );
 * }
 *
 * function YourApp() {
 *   const consent = useConsent();
 *   return <div>Analytics: {consent.analytics ? 'On' : 'Off'}</div>;
 * }
 * ```
 */

// Provider
export { CookiePotProvider } from './provider';
export type { CookiePotProviderProps } from './provider';

// Hooks
export { useCookiePot, useConsent, useHasConsent } from './hooks';

// Components
export {
  ConsentBanner,
  PreferencesButton,
  AcceptAllButton,
  RejectAllButton,
} from './components';
export type {
  ConsentBannerProps,
  PreferencesButtonProps,
  AcceptAllButtonProps,
  RejectAllButtonProps,
} from './components';

// Re-export types from main package
export type {
  CookiePotConfig,
  ConsentCategories,
  ConsentCategory,
  BannerConfig,
  BannerPosition,
  BannerTheme,
  BannerText,
  BannerStyling,
} from '../types';
