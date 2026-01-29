import type { ConsentCategories } from '../types';

/**
 * Google Consent Mode v2 Integration
 *
 * Maps CookiePot consent categories to Google's consent types
 * and integrates with Google Analytics gtag.js
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Google consent types
 */
type GoogleConsentType =
  | 'ad_storage'
  | 'ad_user_data'
  | 'ad_personalization'
  | 'analytics_storage'
  | 'functionality_storage'
  | 'personalization_storage'
  | 'security_storage';

type ConsentValue = 'granted' | 'denied';

interface GoogleConsentState {
  ad_storage: ConsentValue;
  ad_user_data: ConsentValue;
  ad_personalization: ConsentValue;
  analytics_storage: ConsentValue;
  functionality_storage: ConsentValue;
  personalization_storage: ConsentValue;
  security_storage: ConsentValue;
}

/**
 * Google Consent Mode Manager
 */
export class GoogleConsentModeManager {
  private enabled: boolean;

  constructor(enabled: boolean = false) {
    this.enabled = enabled;
  }

  /**
   * Check if gtag is available
   */
  private isGtagAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.gtag === 'function';
  }

  /**
   * Initialize consent mode with default values (all denied)
   * This should be called before any gtag tracking
   */
  initializeDefaults(): void {
    if (!this.enabled || !this.isGtagAvailable()) {
      return;
    }

    try {
      window.gtag!('consent', 'default', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'granted', // Security always granted
        wait_for_update: 500, // Wait 500ms for consent before firing tags
      });

      console.log('[CookiePot] Google Consent Mode v2 defaults set');
    } catch (error) {
      console.error('[CookiePot] Error initializing Google Consent Mode:', error);
    }
  }

  /**
   * Map CookiePot consent categories to Google consent state
   */
  private mapConsentToGoogle(categories: ConsentCategories): GoogleConsentState {
    return {
      // Marketing → Ads
      ad_storage: categories.marketing ? 'granted' : 'denied',
      ad_user_data: categories.marketing ? 'granted' : 'denied',
      ad_personalization: categories.marketing ? 'granted' : 'denied',

      // Analytics → Analytics
      analytics_storage: categories.analytics ? 'granted' : 'denied',

      // Preferences → Functionality & Personalization
      functionality_storage: categories.preferences ? 'granted' : 'denied',
      personalization_storage: categories.preferences ? 'granted' : 'denied',

      // Security always granted (necessary cookies)
      security_storage: 'granted',
    };
  }

  /**
   * Update consent based on user's choices
   */
  updateConsent(categories: ConsentCategories): void {
    if (!this.enabled || !this.isGtagAvailable()) {
      return;
    }

    try {
      const googleConsent = this.mapConsentToGoogle(categories);

      window.gtag!('consent', 'update', googleConsent);

      console.log('[CookiePot] Google Consent Mode v2 updated:', googleConsent);
    } catch (error) {
      console.error('[CookiePot] Error updating Google Consent Mode:', error);
    }
  }

  /**
   * Enable Google Consent Mode
   */
  enable(): void {
    this.enabled = true;
    console.log('[CookiePot] Google Consent Mode v2 enabled');
  }

  /**
   * Disable Google Consent Mode
   */
  disable(): void {
    this.enabled = false;
    console.log('[CookiePot] Google Consent Mode v2 disabled');
  }

  /**
   * Check if Google Consent Mode is enabled and available
   */
  isActive(): boolean {
    return this.enabled && this.isGtagAvailable();
  }
}

/**
 * Create a Google Consent Mode manager instance
 */
export function createGoogleConsentModeManager(enabled: boolean): GoogleConsentModeManager {
  return new GoogleConsentModeManager(enabled);
}
