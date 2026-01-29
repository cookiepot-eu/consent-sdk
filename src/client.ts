import type {
  CookiePotConfig,
  ConsentCategories,
  ConsentCategory,
  ConsentState,
  CookiePotEvent,
  BannerPosition,
  BannerTheme,
  BannerText,
  BannerStyling,
  ScriptPattern,
} from './types';
import { CookiePotConfigSchema } from './types';
import { EventEmitter } from './lib/event-emitter';
import { getOrCreateVisitorId, getOrCreateSessionId } from './lib/visitor-id';
import {
  getConsentFromStorage,
  saveConsentToStorage,
  clearConsentFromStorage,
} from './lib/storage';
import { createAPIClient } from './lib/api';
import type { APIClient } from './lib/api';
import { Banner } from './lib/banner';
import { GoogleConsentModeManager } from './lib/google-consent-mode';
import { ScriptAutoBlocker } from './lib/auto-blocker';
import { PreferencesModal } from './lib/preferences-modal';

/**
 * CookiePot SDK Client
 */
export class CookiePot {
  private static instance: CookiePot | null = null;

  private config: CookiePotConfig & {
    apiBaseUrl: string;
    banner: {
      position: BannerPosition;
      theme: BannerTheme;
      showRejectAll: boolean;
      text?: BannerText;
      styling?: BannerStyling;
    };
    autoBlock: {
      enabled: boolean;
      scripts: ScriptPattern[];
    };
    language: string;
    enableGoogleConsentMode: boolean;
    cookieMaxAge: number;
  };
  private eventEmitter: EventEmitter;
  private apiClient: APIClient;
  private visitorId: string;
  private sessionId: string;
  private consentState: ConsentCategories;
  private initialized: boolean = false;
  private banner: Banner | null = null;
  private preferencesModal: PreferencesModal | null = null;
  private googleConsentMode: GoogleConsentModeManager | null = null;
  private scriptAutoBlocker: ScriptAutoBlocker | null = null;

  private constructor(config: CookiePotConfig) {
    // Validate config
    const validated = CookiePotConfigSchema.parse(config);

    // Set defaults
    this.config = {
      ...validated,
      apiBaseUrl: validated.apiBaseUrl ?? 'https://api.cookiepot.eu',
      banner: {
        position: validated.banner?.position ?? 'bottom-center',
        theme: validated.banner?.theme ?? 'light',
        showRejectAll: validated.banner?.showRejectAll ?? true,
        text: validated.banner?.text,
        styling: validated.banner?.styling,
      },
      autoBlock: validated.autoBlock ?? {
        enabled: false,
        scripts: [],
      },
      language: validated.language ?? this.detectLanguage(),
      enableGoogleConsentMode: validated.enableGoogleConsentMode ?? false,
      cookieMaxAge: validated.cookieMaxAge ?? 365 * 24 * 60 * 60, // 1 year
    };

    // Initialize components
    this.eventEmitter = new EventEmitter();
    this.apiClient = createAPIClient({
      apiKey: this.config.apiKey,
      baseUrl: this.config.apiBaseUrl,
    });

    // Get or create visitor/session IDs
    this.visitorId = getOrCreateVisitorId();
    this.sessionId = getOrCreateSessionId();

    // Load existing consent or use defaults
    const storedConsent = getConsentFromStorage();
    if (storedConsent) {
      this.consentState = storedConsent.categories;
    } else {
      // Default: only necessary cookies
      this.consentState = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      };
    }

    this.initialized = true;

    // Initialize Google Consent Mode
    if (this.config.enableGoogleConsentMode) {
      this.googleConsentMode = new GoogleConsentModeManager(true);
      this.googleConsentMode.initializeDefaults();
      this.googleConsentMode.updateConsent(this.consentState);
    }

    // Initialize Script Auto-Blocker
    if (this.config.autoBlock.enabled) {
      this.scriptAutoBlocker = new ScriptAutoBlocker(
        this.config.autoBlock.scripts,
        this.consentState,
        true
      );
      this.scriptAutoBlocker.start();
    }

    // Setup event listener for config callback
    if (validated.onConsentChange) {
      this.on('consent:change', (data) => {
        validated.onConsentChange!(data as ConsentCategories);
      });
    }
  }

  /**
   * Initialize the CookiePot SDK (singleton pattern)
   */
  static init(config: CookiePotConfig): CookiePot {
    if (CookiePot.instance) {
      console.warn('[CookiePot] SDK already initialized. Returning existing instance.');
      return CookiePot.instance;
    }

    CookiePot.instance = new CookiePot(config);
    return CookiePot.instance;
  }

  /**
   * Get the current consent state
   */
  getConsent(): ConsentCategories {
    return { ...this.consentState };
  }

  /**
   * Check if a specific category has consent
   */
  hasConsent(category: ConsentCategory): boolean {
    return this.consentState[category] === true;
  }

  /**
   * Set consent preferences and sync to backend
   */
  async setConsent(
    categories: Partial<ConsentCategories>,
    interactionType: 'accept_all' | 'reject_all' | 'accept_selected' | 'save_preferences' = 'accept_selected'
  ): Promise<void> {
    // Update local state (necessary is always true)
    this.consentState = {
      necessary: true,
      analytics: categories.analytics ?? this.consentState.analytics,
      marketing: categories.marketing ?? this.consentState.marketing,
      preferences: categories.preferences ?? this.consentState.preferences,
    };

    // Save to storage
    const state: ConsentState = {
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      categories: this.consentState,
      timestamp: new Date().toISOString(),
    };

    saveConsentToStorage(state, {
      domain: this.config.cookieDomain,
      maxAge: this.config.cookieMaxAge,
    });

    // Update Google Consent Mode
    if (this.googleConsentMode) {
      this.googleConsentMode.updateConsent(this.consentState);
    }

    // Update Script Auto-Blocker
    if (this.scriptAutoBlocker) {
      this.scriptAutoBlocker.updateConsent(this.consentState);
    }

    // Emit event
    this.emit('consent:change', this.consentState);

    // Sync to backend (async, don't block)
    try {
      await this.apiClient.submitConsent({
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        categories: this.consentState,
        metadata: {
          bannerVersion: '1.0.0',
          interactionType,
          language: this.config.language,
        },
      });
    } catch (error) {
      console.error('[CookiePot] Failed to sync consent to backend:', error);
      // Don't throw - consent is already saved locally
    }
  }

  /**
   * Accept all consent categories
   */
  async acceptAll(): Promise<void> {
    await this.setConsent(
      {
        analytics: true,
        marketing: true,
        preferences: true,
      },
      'accept_all'
    );
    this.emit('banner:accept_all', this.consentState);
  }

  /**
   * Reject all non-necessary consent categories
   */
  async rejectAll(): Promise<void> {
    await this.setConsent(
      {
        analytics: false,
        marketing: false,
        preferences: false,
      },
      'reject_all'
    );
    this.emit('banner:reject_all', this.consentState);
  }

  /**
   * Reset consent (clear all stored data)
   */
  async resetConsent(): Promise<void> {
    clearConsentFromStorage(this.config.cookieDomain);

    this.consentState = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };

    this.emit('consent:change', this.consentState);
  }

  /**
   * Get the visitor ID
   */
  getVisitorId(): string {
    return this.visitorId;
  }

  /**
   * Get the session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Show the consent banner
   */
  showBanner(): void {
    if (!this.banner) {
      this.banner = new Banner(this.config.banner, this.config.language, {
        onAcceptAll: () => {
          this.acceptAll();
          this.hideBanner();
        },
        onRejectAll: () => {
          this.rejectAll();
          this.hideBanner();
        },
      });
    }

    this.banner.show();
    this.emit('banner:show', null);
  }

  /**
   * Hide the consent banner
   */
  hideBanner(): void {
    if (this.banner) {
      this.banner.hide();
    }
    this.emit('banner:hide', null);
  }

  /**
   * Show preferences modal
   */
  showPreferences(): void {
    if (!this.preferencesModal) {
      this.preferencesModal = new PreferencesModal(
        this.config.banner,
        this.config.language,
        this.consentState,
        {
          onSave: async (consent) => {
            await this.setConsent(consent, 'save_preferences');
            this.emit('banner:save_preferences', consent);
          },
        }
      );
    }

    this.preferencesModal.show();
  }

  /**
   * Register an event listener
   */
  on(event: CookiePotEvent, handler: (data: unknown) => void): void {
    this.eventEmitter.on(event, handler);
  }

  /**
   * Unregister an event listener
   */
  off(event: CookiePotEvent, handler: (data: unknown) => void): void {
    this.eventEmitter.off(event, handler);
  }

  /**
   * Emit an event (internal use)
   */
  private emit(event: CookiePotEvent, data: unknown): void {
    this.eventEmitter.emit(event, data);
  }

  /**
   * Detect browser language
   */
  private detectLanguage(): string {
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language.substring(0, 2).toLowerCase();
    }
    return 'en';
  }

  /**
   * Check if SDK is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}
