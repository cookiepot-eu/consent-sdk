/**
 * CookiePot Browser Bundle
 *
 * Auto-initializing version for script tag usage.
 * Reads configuration from data attributes on the script tag.
 *
 * @example
 * ```html
 * <script
 *   src="https://unpkg.com/@cookiepot-eu/consent/dist/consent.min.global.js"
 *   data-domain="example.com"
 *   data-api-key="your-api-key"
 *   data-position="bottom-right"
 *   data-theme="auto"
 *   data-language="en"
 * ></script>
 * ```
 */

import { CookiePot } from './client';
import type { BannerPosition, BannerTheme } from './types';

// Export CookiePot class for manual usage
export { CookiePot };

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
  CookiePotEvent,
} from './types';

/**
 * Get the current script element
 */
function getCurrentScript(): HTMLScriptElement | null {
  // Try document.currentScript first (modern browsers)
  if (document.currentScript) {
    return document.currentScript as HTMLScriptElement;
  }

  // Fallback: find script by src
  const scripts = document.getElementsByTagName('script');
  for (let i = scripts.length - 1; i >= 0; i--) {
    const script = scripts[i];
    if (script && script.src && script.src.includes('cookiepot')) {
      return script;
    }
  }

  return null;
}

/**
 * Parse data attributes from script tag
 */
function parseDataAttributes(script: HTMLScriptElement): Record<string, string> {
  const attrs: Record<string, string> = {};

  for (const attr of Array.from(script.attributes)) {
    if (attr.name.startsWith('data-')) {
      // Convert data-domain-id to domainId
      const key = attr.name
        .slice(5) // Remove 'data-'
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      attrs[key] = attr.value;
    }
  }

  return attrs;
}

/**
 * Auto-initialize from script data attributes
 */
function autoInit(): void {
  const script = getCurrentScript();

  if (!script) {
    console.warn('[CookiePot] Could not find script element for auto-initialization');
    return;
  }

  const attrs = parseDataAttributes(script);

  // Check required attributes
  if (!attrs.domain) {
    console.warn('[CookiePot] Missing required data-domain attribute');
    return;
  }

  if (!attrs.apiKey) {
    console.warn('[CookiePot] Missing required data-api-key attribute');
    return;
  }

  // Initialize CookiePot
  const instance = CookiePot.init({
    domain: attrs.domain,
    apiKey: attrs.apiKey,
    apiBaseUrl: attrs.apiBaseUrl,
    language: attrs.language || 'en',
    banner: {
      position: (attrs.position as BannerPosition) || 'bottom-right',
      theme: (attrs.theme as BannerTheme) || 'auto',
    },
  });

  // Expose instance globally
  (window as any).CookiePotInstance = instance;

  console.log('[CookiePot] Initialized successfully');
}

// Expose CookiePot class globally
(window as any).CookiePot = CookiePot;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit);
} else {
  // DOM already loaded, init immediately
  autoInit();
}
