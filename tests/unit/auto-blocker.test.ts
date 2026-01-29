import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScriptAutoBlocker } from '../../src/lib/auto-blocker';
import type { ConsentCategories } from '../../src/types';

describe('ScriptAutoBlocker', () => {
  let blocker: ScriptAutoBlocker;

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  afterEach(() => {
    if (blocker) {
      blocker.stop();
    }
  });

  describe('start and stop', () => {
    it('should start observing scripts', () => {
      blocker = new ScriptAutoBlocker([
        { pattern: 'analytics.js', category: 'analytics' },
      ]);

      expect(() => blocker.start()).not.toThrow();
      expect(() => blocker.stop()).not.toThrow();
    });

    it('should handle start when already started', () => {
      blocker = new ScriptAutoBlocker([]);

      blocker.start();
      expect(() => blocker.start()).not.toThrow();
    });

    it('should handle stop when already stopped', () => {
      blocker = new ScriptAutoBlocker([]);

      expect(() => blocker.stop()).not.toThrow();
    });
  });

  describe('updateConsent', () => {
    it('should handle consent updates', () => {
      blocker = new ScriptAutoBlocker([
        { pattern: 'analytics.js', category: 'analytics' },
      ]);

      blocker.start();

      const consent: ConsentCategories = {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: false,
      };

      expect(() => blocker.updateConsent(consent)).not.toThrow();
    });

    it('should handle all categories granted', () => {
      blocker = new ScriptAutoBlocker([
        { pattern: 'analytics.js', category: 'analytics' },
        { pattern: 'ads.js', category: 'marketing' },
      ]);

      blocker.start();

      const allGranted: ConsentCategories = {
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true,
      };

      expect(() => blocker.updateConsent(allGranted)).not.toThrow();
    });

    it('should handle all categories denied', () => {
      blocker = new ScriptAutoBlocker([
        { pattern: 'analytics.js', category: 'analytics' },
      ]);

      blocker.start();

      const allDenied: ConsentCategories = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      };

      expect(() => blocker.updateConsent(allDenied)).not.toThrow();
    });
  });

  describe('pattern matching', () => {
    it('should accept string patterns', () => {
      blocker = new ScriptAutoBlocker([
        { pattern: 'google-analytics.com', category: 'analytics' },
      ]);

      expect(() => blocker.start()).not.toThrow();
    });

    it('should accept regex patterns', () => {
      blocker = new ScriptAutoBlocker([
        { pattern: /google-analytics\.com/, category: 'analytics' },
      ]);

      expect(() => blocker.start()).not.toThrow();
    });

    it('should handle multiple patterns', () => {
      blocker = new ScriptAutoBlocker([
        { pattern: 'analytics.js', category: 'analytics' },
        { pattern: 'ads.js', category: 'marketing' },
        { pattern: /facebook\.net/, category: 'marketing' },
      ]);

      expect(() => blocker.start()).not.toThrow();
    });

    it('should handle empty patterns array', () => {
      blocker = new ScriptAutoBlocker([]);

      expect(() => blocker.start()).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should not throw on updateConsent before start', () => {
      blocker = new ScriptAutoBlocker([]);

      const consent: ConsentCategories = {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: false,
      };

      expect(() => blocker.updateConsent(consent)).not.toThrow();
    });

    it('should handle invalid category gracefully', () => {
      blocker = new ScriptAutoBlocker([
        { pattern: 'test.js', category: 'analytics' as any },
      ]);

      expect(() => blocker.start()).not.toThrow();
    });
  });

  describe('script blocking', () => {
    it('should block analytics script when consent not granted', async () => {
      const initialConsent: ConsentCategories = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      };

      blocker = new ScriptAutoBlocker(
        [{ pattern: 'google-analytics.com', category: 'analytics' }],
        initialConsent,
        true
      );

      blocker.start();

      // Add a script dynamically
      const script = document.createElement('script');
      script.src = 'https://www.google-analytics.com/analytics.js';
      document.head.appendChild(script);

      // Wait for MutationObserver
      await new Promise(resolve => setTimeout(resolve, 50));

      // Script should be blocked
      expect(script.type).toBe('text/plain');
      expect(script.hasAttribute('data-cookiepot-blocked')).toBe(true);
      expect(script.getAttribute('data-cookiepot-blocked')).toBe('analytics');
    });

    it('should not block script when consent is granted', async () => {
      const initialConsent: ConsentCategories = {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: false,
      };

      blocker = new ScriptAutoBlocker(
        [{ pattern: 'google-analytics.com', category: 'analytics' }],
        initialConsent,
        true
      );

      blocker.start();

      const script = document.createElement('script');
      script.src = 'https://www.google-analytics.com/analytics.js';
      document.head.appendChild(script);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(script.type).not.toBe('text/plain');
    });

    it('should skip already processed scripts', async () => {
      const initialConsent: ConsentCategories = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      };

      blocker = new ScriptAutoBlocker(
        [{ pattern: 'analytics', category: 'analytics' }],
        initialConsent,
        true
      );

      blocker.start();

      const script = document.createElement('script');
      script.src = 'https://example.com/analytics.js';
      script.setAttribute('data-cookiepot-processed', 'true');
      document.head.appendChild(script);

      await new Promise(resolve => setTimeout(resolve, 50));

      // Should not be blocked because it was already processed
      expect(script.type).not.toBe('text/plain');
    });

    it('should match inline script content', async () => {
      const initialConsent: ConsentCategories = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      };

      blocker = new ScriptAutoBlocker(
        [{ pattern: 'gtag', category: 'analytics' }],
        initialConsent,
        true
      );

      blocker.start();

      const script = document.createElement('script');
      script.textContent = 'window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);}';
      document.head.appendChild(script);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(script.type).toBe('text/plain');
      expect(script.getAttribute('data-cookiepot-blocked')).toBe('analytics');
    });

    it('should block marketing scripts', async () => {
      const initialConsent: ConsentCategories = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      };

      blocker = new ScriptAutoBlocker(
        [{ pattern: 'facebook.net', category: 'marketing' }],
        initialConsent,
        true
      );

      blocker.start();

      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      document.head.appendChild(script);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(script.getAttribute('data-cookiepot-blocked')).toBe('marketing');
    });
  });

  describe('script unblocking', () => {
    it('should unblock scripts when consent is granted', async () => {
      const initialConsent: ConsentCategories = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      };

      blocker = new ScriptAutoBlocker(
        [{ pattern: 'analytics', category: 'analytics' }],
        initialConsent,
        true
      );

      blocker.start();

      const script = document.createElement('script');
      script.src = 'https://example.com/analytics.js';
      document.head.appendChild(script);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(script.type).toBe('text/plain');

      // Now grant consent
      blocker.updateConsent({
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: false,
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      // Script should be replaced with unblocked version
      const unblockedScript = document.querySelector('script[data-cookiepot-unblocked="true"]');
      expect(unblockedScript).not.toBeNull();
    });

    it('should handle unblocking multiple categories', async () => {
      const initialConsent: ConsentCategories = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      };

      blocker = new ScriptAutoBlocker(
        [
          { pattern: 'analytics', category: 'analytics' },
          { pattern: 'facebook', category: 'marketing' },
        ],
        initialConsent,
        true
      );

      blocker.start();

      const analyticsScript = document.createElement('script');
      analyticsScript.src = 'https://example.com/analytics.js';
      document.head.appendChild(analyticsScript);

      const marketingScript = document.createElement('script');
      marketingScript.src = 'https://connect.facebook.net/sdk.js';
      document.head.appendChild(marketingScript);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(analyticsScript.type).toBe('text/plain');
      expect(marketingScript.type).toBe('text/plain');

      // Grant consent for both
      blocker.updateConsent({
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: false,
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      const unblockedScripts = document.querySelectorAll('script[data-cookiepot-unblocked="true"]');
      expect(unblockedScripts.length).toBe(2);
    });
  });

  describe('getBlockedScripts', () => {
    it('should return list of blocked scripts', async () => {
      const initialConsent: ConsentCategories = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      };

      blocker = new ScriptAutoBlocker(
        [{ pattern: 'analytics', category: 'analytics' }],
        initialConsent,
        true
      );

      blocker.start();

      const script = document.createElement('script');
      script.src = 'https://example.com/analytics.js';
      document.head.appendChild(script);

      await new Promise(resolve => setTimeout(resolve, 50));

      const blocked = blocker.getBlockedScripts();
      expect(blocked.length).toBe(1);
      expect(blocked[0].src).toBe('https://example.com/analytics.js');
      expect(blocked[0].category).toBe('analytics');
    });

    it('should return empty array when no scripts blocked', () => {
      blocker = new ScriptAutoBlocker([], {
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true,
      }, true);

      expect(blocker.getBlockedScripts()).toEqual([]);
    });
  });

  describe('enable/disable', () => {
    it('should enable auto-blocking', () => {
      blocker = new ScriptAutoBlocker([], {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      }, false);

      expect(blocker.isEnabled()).toBe(false);

      blocker.enable();
      expect(blocker.isEnabled()).toBe(true);
    });

    it('should disable auto-blocking', () => {
      blocker = new ScriptAutoBlocker([], {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      }, true);

      expect(blocker.isEnabled()).toBe(true);

      blocker.disable();
      expect(blocker.isEnabled()).toBe(false);
    });

    it('should not block scripts when disabled', async () => {
      blocker = new ScriptAutoBlocker(
        [{ pattern: 'analytics', category: 'analytics' }],
        {
          necessary: true,
          analytics: false,
          marketing: false,
          preferences: false,
        },
        false
      );

      blocker.start(); // Should do nothing since disabled

      const script = document.createElement('script');
      script.src = 'https://example.com/analytics.js';
      document.head.appendChild(script);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(script.type).not.toBe('text/plain');
    });
  });

  describe('createScriptAutoBlocker factory', () => {
    it('should create auto-blocker instance', async () => {
      const { createScriptAutoBlocker } = await import('../../src/lib/auto-blocker');

      const instance = createScriptAutoBlocker(
        [{ pattern: 'test', category: 'analytics' }],
        { necessary: true, analytics: false, marketing: false, preferences: false },
        true
      );

      expect(instance).toBeInstanceOf(ScriptAutoBlocker);
    });
  });

  describe('pattern matching edge cases', () => {
    it('should handle simple string fallback for invalid regex', async () => {
      const initialConsent: ConsentCategories = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      };

      blocker = new ScriptAutoBlocker(
        [{ pattern: '[invalid(regex', category: 'analytics' }],
        initialConsent,
        true
      );

      blocker.start();

      // Script containing the literal pattern should still match via string includes
      const script = document.createElement('script');
      script.textContent = 'console.log("[invalid(regex")';
      document.head.appendChild(script);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(script.type).toBe('text/plain');
    });

    it('should handle case-insensitive matching', async () => {
      const initialConsent: ConsentCategories = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      };

      blocker = new ScriptAutoBlocker(
        [{ pattern: 'ANALYTICS', category: 'analytics' }],
        initialConsent,
        true
      );

      blocker.start();

      const script = document.createElement('script');
      script.src = 'https://example.com/analytics.js';
      document.head.appendChild(script);

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(script.type).toBe('text/plain');
    });
  });
});
