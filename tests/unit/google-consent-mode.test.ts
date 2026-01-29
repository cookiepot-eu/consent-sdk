import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GoogleConsentModeManager } from '../../src/lib/google-consent-mode';
import type { ConsentCategories } from '../../src/types';

describe('GoogleConsentModeManager', () => {
  let manager: GoogleConsentModeManager;
  let gtagCalls: any[] = [];

  beforeEach(() => {
    gtagCalls = [];
    // Setup dataLayer and gtag before creating manager
    window.dataLayer = [];
    window.gtag = function gtag() {
      window.dataLayer!.push(arguments);
      gtagCalls.push(Array.from(arguments));
    } as any;
  });

  afterEach(() => {
    delete window.gtag;
    delete window.dataLayer;
    gtagCalls = [];
  });

  describe('enable and updateConsent', () => {
    it('should initialize consent mode when gtag is available', () => {
      manager = new GoogleConsentModeManager();
      manager.enable();
      manager.initializeDefaults();

      expect(gtagCalls.length).toBeGreaterThan(0);
      expect(gtagCalls[0][0]).toBe('consent');
      expect(gtagCalls[0][1]).toBe('default');
    });

    it('should update consent when analytics is granted', () => {
      manager = new GoogleConsentModeManager();
      manager.enable();
      const initialCallCount = gtagCalls.length;

      const consent: ConsentCategories = {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: false,
      };

      manager.updateConsent(consent);

      expect(gtagCalls.length).toBeGreaterThan(initialCallCount);
      const updateCall = gtagCalls[gtagCalls.length - 1];
      expect(updateCall[0]).toBe('consent');
      expect(updateCall[1]).toBe('update');
    });

    it('should not throw if gtag is not available', () => {
      delete window.gtag;
      manager = new GoogleConsentModeManager();

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
      manager = new GoogleConsentModeManager();
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
      manager = new GoogleConsentModeManager();
      manager.enable();
      const initialCallCount = gtagCalls.length;

      manager.disable();

      const consent: ConsentCategories = {
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true,
      };

      manager.updateConsent(consent);

      // Should not make additional gtag calls after disable
      expect(gtagCalls.length).toBe(initialCallCount);
    });

    it('should not throw when calling disable multiple times', () => {
      manager = new GoogleConsentModeManager();
      manager.enable();
      manager.disable();

      expect(() => manager.disable()).not.toThrow();
    });
  });
});
