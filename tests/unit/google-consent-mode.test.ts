import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GoogleConsentModeManager } from '../../src/lib/google-consent-mode';
import type { ConsentCategories } from '../../src/types';

describe('GoogleConsentModeManager', () => {
  let manager: GoogleConsentModeManager;

  beforeEach(() => {
    // Setup dataLayer
    window.dataLayer = [];
    window.gtag = function (...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    manager = new GoogleConsentModeManager();
  });

  afterEach(() => {
    delete window.gtag;
    delete window.dataLayer;
  });

  describe('enable and updateConsent', () => {
    it('should work when gtag is available', () => {
      manager.enable();
      expect(window.dataLayer).toBeDefined();
      expect(window.dataLayer!.length).toBeGreaterThan(0);

      const consent: ConsentCategories = {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: false,
      };

      manager.updateConsent(consent);
      expect(window.dataLayer!.length).toBeGreaterThan(1);
    });

    it('should not throw if gtag is not available', () => {
      delete window.gtag;

      expect(() => manager.enable()).not.toThrow();

      const consent: ConsentCategories = {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: false,
      };

      expect(() => manager.updateConsent(consent)).not.toThrow();
    });

    it('should handle all consent categories', () => {
      manager.enable();

      const allGranted: ConsentCategories = {
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true,
      };

      expect(() => manager.updateConsent(allGranted)).not.toThrow();

      const allDenied: ConsentCategories = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      };

      expect(() => manager.updateConsent(allDenied)).not.toThrow();
    });
  });

  describe('disable', () => {
    it('should stop updating consent after disable', () => {
      manager.enable();
      const initialLength = window.dataLayer!.length;

      manager.disable();

      const consent: ConsentCategories = {
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true,
      };

      manager.updateConsent(consent);

      // dataLayer should not grow after disable
      expect(window.dataLayer!.length).toBe(initialLength);
    });
  });
});
