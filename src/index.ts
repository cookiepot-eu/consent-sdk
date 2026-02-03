/**
 * CookiePot Consent SDK
 *
 * A lightweight, type-safe consent management SDK for web applications.
 *
 * @example
 * ```typescript
 * import { CookiePot } from '@cookiepot/consent';
 *
 * const sdk = CookiePot.init({
 *   apiKey: 'your-api-key',
 *   domain: 'example.com',
 * });
 *
 * // Listen for consent changes
 * sdk.on('consent:change', (consent) => {
 *   console.log('Consent updated:', consent);
 * });
 *
 * // Accept all cookies
 * await sdk.acceptAll();
 * ```
 */

export { CookiePot } from './client';

// Export types
export type {
  CookiePotConfig,
  ConsentCategories,
  ConsentCategory,
  ConsentMetadata,
  ConsentState,
  BannerConfig,
  BannerPosition,
  BannerTheme,
  BannerText,
  BannerStyling,
  AutoBlockConfig,
  ScriptPattern,
  StorageBlockingConfig,
  CookiePotEvent,
  SubmitConsentRequest,
  SubmitConsentResponse,
  ConsentHistoryItem,
  GetConsentResponse,
  APIError,
} from './types';

// Export storage blocker types
export type {
  StoragePattern,
  QueuedStorageOperation,
  StorageScanResult,
  StorageItem,
} from './lib/storage-blocker';

// Export API client for advanced usage
export { CookiePotAPIError } from './lib/api';
export type { APIClient, APIClientConfig } from './lib/api';
