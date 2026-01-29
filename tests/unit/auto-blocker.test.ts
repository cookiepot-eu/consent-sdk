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
});
