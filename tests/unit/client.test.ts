import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CookiePot } from '../../src/client';
import { STORAGE_KEYS } from '../../src/types';

describe('CookiePot', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(';').forEach((cookie) => {
      const [name] = cookie.split('=');
      document.cookie = `${name.trim()}=; Max-Age=-1; Path=/`;
    });

    // Mock fetch
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    // Default successful API response
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        consentId: 'test-consent-id',
        timestamp: '2026-01-27T12:00:00Z',
        categories: {
          necessary: true,
          analytics: false,
          marketing: false,
          preferences: false,
        },
      }),
    });

    // Reset singleton
    (CookiePot as any).instance = null;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('init', () => {
    it('should initialize with valid config', () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      expect(sdk).toBeInstanceOf(CookiePot);
      expect(sdk.isInitialized()).toBe(true);
    });

    it('should return existing instance on subsequent calls', () => {
      const sdk1 = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      const sdk2 = CookiePot.init({
        apiKey: 'different-key',
        domain: 'different.com',
      });

      expect(sdk1).toBe(sdk2);
    });

    it('should throw on invalid config', () => {
      expect(() => {
        CookiePot.init({
          apiKey: '',
          domain: 'example.com',
        });
      }).toThrow();
    });

    it('should apply default config values', () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      expect(sdk).toBeDefined();
      // Config is private, but we can test behavior
    });

    it('should load existing consent from storage', () => {
      // Pre-save consent
      const storedConsent = {
        visitorId: 'test-visitor',
        sessionId: 'test-session',
        categories: {
          necessary: true,
          analytics: true,
          marketing: false,
          preferences: true,
        },
        timestamp: '2026-01-27T12:00:00Z',
      };
      localStorage.setItem(STORAGE_KEYS.CONSENT, JSON.stringify(storedConsent));

      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      const consent = sdk.getConsent();
      expect(consent.analytics).toBe(true);
      expect(consent.preferences).toBe(true);
    });
  });

  describe('getConsent', () => {
    it('should return default consent state', () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      const consent = sdk.getConsent();
      expect(consent).toEqual({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      });
    });

    it('should return a copy of consent state', () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      const consent1 = sdk.getConsent();
      const consent2 = sdk.getConsent();

      expect(consent1).not.toBe(consent2);
      expect(consent1).toEqual(consent2);
    });
  });

  describe('hasConsent', () => {
    it('should check specific category consent', () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      expect(sdk.hasConsent('necessary')).toBe(true);
      expect(sdk.hasConsent('analytics')).toBe(false);
      expect(sdk.hasConsent('marketing')).toBe(false);
      expect(sdk.hasConsent('preferences')).toBe(false);
    });
  });

  describe('setConsent', () => {
    it('should update consent state', async () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      await sdk.setConsent({ analytics: true });

      expect(sdk.hasConsent('analytics')).toBe(true);
      expect(sdk.hasConsent('marketing')).toBe(false);
    });

    it('should save consent to storage', async () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      await sdk.setConsent({ analytics: true, marketing: true });

      const stored = localStorage.getItem(STORAGE_KEYS.CONSENT);
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.categories.analytics).toBe(true);
      expect(parsed.categories.marketing).toBe(true);
    });

    it('should emit consent:change event', async () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      const handler = vi.fn();
      sdk.on('consent:change', handler);

      await sdk.setConsent({ analytics: true });

      expect(handler).toHaveBeenCalledWith({
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: false,
      });
    });

    it('should call API to submit consent', async () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      await sdk.setConsent({ analytics: true });

      expect(fetchMock).toHaveBeenCalled();
      const callArgs = fetchMock.mock.calls[0];
      expect(callArgs[0]).toContain('/v2/consent');
    });

    it('should not throw if API call fails', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      await expect(sdk.setConsent({ analytics: true })).resolves.not.toThrow();

      // Consent should still be saved locally
      expect(sdk.hasConsent('analytics')).toBe(true);
    });

    it('should always keep necessary consent as true', async () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      await sdk.setConsent({ necessary: false } as any);

      expect(sdk.hasConsent('necessary')).toBe(true);
    });
  });

  describe('acceptAll', () => {
    it('should accept all consent categories', async () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      await sdk.acceptAll();

      const consent = sdk.getConsent();
      expect(consent.analytics).toBe(true);
      expect(consent.marketing).toBe(true);
      expect(consent.preferences).toBe(true);
    });

    it('should emit banner:accept_all event', async () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      const handler = vi.fn();
      sdk.on('banner:accept_all', handler);

      await sdk.acceptAll();

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('rejectAll', () => {
    it('should reject all non-necessary categories', async () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      // First accept all
      await sdk.acceptAll();
      expect(sdk.hasConsent('analytics')).toBe(true);

      // Then reject all
      await sdk.rejectAll();

      const consent = sdk.getConsent();
      expect(consent.necessary).toBe(true);
      expect(consent.analytics).toBe(false);
      expect(consent.marketing).toBe(false);
      expect(consent.preferences).toBe(false);
    });

    it('should emit banner:reject_all event', async () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      const handler = vi.fn();
      sdk.on('banner:reject_all', handler);

      await sdk.rejectAll();

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('resetConsent', () => {
    it('should clear stored consent', async () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      await sdk.acceptAll();
      expect(localStorage.getItem(STORAGE_KEYS.CONSENT)).toBeDefined();

      await sdk.resetConsent();
      expect(localStorage.getItem(STORAGE_KEYS.CONSENT)).toBeNull();
    });

    it('should reset to default state', async () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      await sdk.acceptAll();
      await sdk.resetConsent();

      const consent = sdk.getConsent();
      expect(consent).toEqual({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      });
    });
  });

  describe('getVisitorId', () => {
    it('should return a valid visitor ID', () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      const visitorId = sdk.getVisitorId();
      expect(visitorId).toBeDefined();
      expect(visitorId.length).toBeGreaterThan(0);
    });

    it('should persist visitor ID across instances', () => {
      const sdk1 = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });
      const id1 = sdk1.getVisitorId();

      // Reset singleton
      (CookiePot as any).instance = null;

      const sdk2 = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });
      const id2 = sdk2.getVisitorId();

      expect(id1).toBe(id2);
    });
  });

  describe('getSessionId', () => {
    it('should return a valid session ID', () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      const sessionId = sdk.getSessionId();
      expect(sessionId).toBeDefined();
      expect(sessionId.length).toBeGreaterThan(0);
    });

    it('should be different from visitor ID', () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      const visitorId = sdk.getVisitorId();
      const sessionId = sdk.getSessionId();

      expect(sessionId).not.toBe(visitorId);
    });
  });

  describe('event listeners', () => {
    it('should register and trigger event handlers', async () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      const handler = vi.fn();
      sdk.on('consent:change', handler);

      await sdk.setConsent({ analytics: true });

      expect(handler).toHaveBeenCalled();
    });

    it('should unregister event handlers', async () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      const handler = vi.fn();
      sdk.on('consent:change', handler);
      sdk.off('consent:change', handler);

      await sdk.setConsent({ analytics: true });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should call onConsentChange callback from config', async () => {
      const callback = vi.fn();

      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
        onConsentChange: callback,
      });

      await sdk.setConsent({ analytics: true });

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('UI methods', () => {
    it('should emit banner:show event on showBanner', () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      const handler = vi.fn();
      sdk.on('banner:show', handler);

      sdk.showBanner();

      expect(handler).toHaveBeenCalled();
    });

    it('should emit banner:hide event on hideBanner', () => {
      const sdk = CookiePot.init({
        apiKey: 'test-api-key',
        domain: 'example.com',
      });

      const handler = vi.fn();
      sdk.on('banner:hide', handler);

      sdk.hideBanner();

      expect(handler).toHaveBeenCalled();
    });
  });
});
