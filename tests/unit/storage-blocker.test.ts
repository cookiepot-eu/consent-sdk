import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageBlocker, defaultStoragePatterns } from '../../src/lib/storage-blocker';
import type { StorageBlockingConfig } from '../../src/lib/storage-blocker';
import type { ConsentCategories } from '../../src/types';

describe('StorageBlocker', () => {
  let blocker: StorageBlocker;

  const defaultConsent: ConsentCategories = {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  };

  const allGranted: ConsentCategories = {
    necessary: true,
    analytics: true,
    marketing: true,
    preferences: true,
  };

  const defaultConfig: StorageBlockingConfig = {
    enabled: true,
  };

  afterEach(() => {
    if (blocker && blocker.isActive()) {
      blocker.stop();
    }
    // After stop(), clear and setItem should be restored
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('start and stop', () => {
    it('should start and stop without errors', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      expect(() => blocker.start()).not.toThrow();
      expect(blocker.isActive()).toBe(true);
      expect(() => blocker.stop()).not.toThrow();
      expect(blocker.isActive()).toBe(false);
    });

    it('should not start twice', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      blocker.start();
      blocker.start(); // should be no-op
      expect(blocker.isActive()).toBe(true);
    });

    it('should handle stop when not started', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      expect(() => blocker.stop()).not.toThrow();
    });
  });

  describe('blocking storage operations', () => {
    it('should block analytics localStorage writes without consent', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      blocker.start();

      localStorage.setItem('_ga_test', 'value');

      // Should be blocked - key not in storage
      expect(localStorage.getItem('_ga_test')).toBeNull();
    });

    it('should block marketing localStorage writes without consent', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      blocker.start();

      localStorage.setItem('_fbp_test', 'value');

      expect(localStorage.getItem('_fbp_test')).toBeNull();
    });

    it('should block sessionStorage writes without consent', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      blocker.start();

      sessionStorage.setItem('_ga_session', 'value');

      expect(sessionStorage.getItem('_ga_session')).toBeNull();
    });

    it('should allow writes when consent is granted', () => {
      blocker = new StorageBlocker(defaultConfig, allGranted);
      blocker.start();

      localStorage.setItem('_ga_test', 'value');

      expect(localStorage.getItem('_ga_test')).toBe('value');
    });

    it('should always allow cookiepot_ prefixed keys', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      blocker.start();

      localStorage.setItem('cookiepot_consent', 'data');

      expect(localStorage.getItem('cookiepot_consent')).toBe('data');
    });

    it('should always allow custom allowedKeys', () => {
      const config: StorageBlockingConfig = {
        enabled: true,
        allowedKeys: ['my_app_key', /^safe_/],
      };

      blocker = new StorageBlocker(config, defaultConsent);
      blocker.start();

      localStorage.setItem('my_app_key', 'value1');
      localStorage.setItem('safe_data', 'value2');

      expect(localStorage.getItem('my_app_key')).toBe('value1');
      expect(localStorage.getItem('safe_data')).toBe('value2');
    });

    it('should block unknown keys as marketing (strictest)', () => {
      blocker = new StorageBlocker(defaultConfig, {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: true,
      });
      blocker.start();

      localStorage.setItem('unknown_tracker_xyz', 'value');

      expect(localStorage.getItem('unknown_tracker_xyz')).toBeNull();
    });

    it('should block removeItem without consent', () => {
      // Set value before blocking starts
      localStorage.setItem('_ga_remove', 'value');

      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      blocker.start();

      localStorage.removeItem('_ga_remove');

      // Should still be there since removeItem was blocked
      expect(localStorage.getItem('_ga_remove')).toBe('value');
    });

    it('should block clear() without marketing consent', () => {
      localStorage.setItem('test_key', 'value');

      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      blocker.start();

      localStorage.clear();

      // Should still be there since clear was blocked
      expect(localStorage.getItem('test_key')).toBe('value');
    });
  });

  describe('queue operations', () => {
    it('should queue blocked operations by default', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      blocker.start();

      localStorage.setItem('_ga_queued', 'queued_value');

      const queue = blocker.getQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].type).toBe('setItem');
      expect(queue[0].key).toBe('_ga_queued');
      expect(queue[0].value).toBe('queued_value');
      expect(queue[0].category).toBe('analytics');
    });

    it('should process queue when consent is granted', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      blocker.start();

      localStorage.setItem('_ga_deferred', 'deferred_value');

      expect(localStorage.getItem('_ga_deferred')).toBeNull();
      expect(blocker.getQueue().length).toBe(1);

      // Grant analytics consent
      blocker.updateConsent({
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: false,
      });

      // Queue should be processed
      expect(blocker.getQueue().length).toBe(0);
      expect(localStorage.getItem('_ga_deferred')).toBe('deferred_value');
    });

    it('should not queue when queueOperations is false', () => {
      const config: StorageBlockingConfig = {
        enabled: true,
        queueOperations: false,
      };

      blocker = new StorageBlocker(config, defaultConsent);
      blocker.start();

      localStorage.setItem('_ga_dropped', 'value');

      expect(blocker.getQueue().length).toBe(0);
    });

    it('should respect maxQueueSize', () => {
      const config: StorageBlockingConfig = {
        enabled: true,
        maxQueueSize: 2,
      };

      blocker = new StorageBlocker(config, defaultConsent);
      blocker.start();

      localStorage.setItem('_ga_1', 'v1');
      localStorage.setItem('_ga_2', 'v2');
      localStorage.setItem('_ga_3', 'v3');

      const queue = blocker.getQueue();
      expect(queue.length).toBe(2);
      // Oldest should be dropped
      expect(queue[0].key).toBe('_ga_2');
      expect(queue[1].key).toBe('_ga_3');
    });
  });

  describe('categorizeKey', () => {
    it('should categorize Google Analytics keys', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      expect(blocker.categorizeKey('_ga')).toBe('analytics');
      expect(blocker.categorizeKey('_ga_ABC123')).toBe('analytics');
      expect(blocker.categorizeKey('_gid')).toBe('analytics');
    });

    it('should categorize Facebook Pixel keys', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      expect(blocker.categorizeKey('_fbp')).toBe('marketing');
      expect(blocker.categorizeKey('_fbc')).toBe('marketing');
    });

    it('should categorize preference keys', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      expect(blocker.categorizeKey('theme')).toBe('preferences');
      expect(blocker.categorizeKey('theme_dark')).toBe('preferences');
      expect(blocker.categorizeKey('lang')).toBe('preferences');
    });

    it('should default unknown keys to marketing', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      expect(blocker.categorizeKey('random_unknown_key')).toBe('marketing');
    });

    it('should use custom patterns', () => {
      const config: StorageBlockingConfig = {
        enabled: true,
        patterns: [
          { pattern: 'myapp_analytics_', category: 'analytics' },
          { pattern: /^custom_mkt_/, category: 'marketing' },
        ],
      };

      blocker = new StorageBlocker(config, defaultConsent);
      expect(blocker.categorizeKey('myapp_analytics_v1')).toBe('analytics');
      expect(blocker.categorizeKey('custom_mkt_id')).toBe('marketing');
    });
  });

  describe('updateConsent', () => {
    it('should allow previously blocked operations after consent update', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      blocker.start();

      // Should be blocked
      localStorage.setItem('_ga_later', 'value');
      expect(localStorage.getItem('_ga_later')).toBeNull();

      // Grant analytics consent
      blocker.updateConsent({
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: false,
      });

      // Now direct writes should work
      localStorage.setItem('_ga_now', 'works');
      expect(localStorage.getItem('_ga_now')).toBe('works');
    });
  });

  describe('scan', () => {
    it('should scan and categorize storage items', () => {
      // Set values before blocker is created
      localStorage.setItem('_ga_test', 'ga_value');
      localStorage.setItem('_fbp_test', 'fb_value');
      localStorage.setItem('cookiepot_consent', 'cp_value');
      sessionStorage.setItem('amplitude_session', 'amp_value');

      blocker = new StorageBlocker(defaultConfig, defaultConsent);

      const result = blocker.scan();

      expect(result.localStorage.length).toBe(3);
      expect(result.sessionStorage.length).toBe(1);
      expect(result.scannedAt).toBeTruthy();

      const gaItem = result.localStorage.find((i) => i.key === '_ga_test');
      expect(gaItem?.category).toBe('analytics');
      expect(gaItem?.description).toBe('Google Analytics');

      const fbItem = result.localStorage.find((i) => i.key === '_fbp_test');
      expect(fbItem?.category).toBe('marketing');

      const cpItem = result.localStorage.find((i) => i.key === 'cookiepot_consent');
      expect(cpItem?.category).toBe('necessary');

      const ampItem = result.sessionStorage.find((i) => i.key === 'amplitude_session');
      expect(ampItem?.category).toBe('analytics');
    });

    it('should return empty results for empty storage', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      const result = blocker.scan();

      expect(result.localStorage).toEqual([]);
      expect(result.sessionStorage).toEqual([]);
    });
  });

  describe('restore on stop', () => {
    it('should restore original storage behavior after stop', () => {
      blocker = new StorageBlocker(defaultConfig, defaultConsent);
      blocker.start();

      // Blocked
      localStorage.setItem('_ga_blocked', 'val');
      expect(localStorage.getItem('_ga_blocked')).toBeNull();

      blocker.stop();

      // Restored - should work now
      localStorage.setItem('_ga_restored', 'val');
      expect(localStorage.getItem('_ga_restored')).toBe('val');
    });
  });

  describe('defaultStoragePatterns', () => {
    it('should have patterns for analytics services', () => {
      const analyticsPatterns = defaultStoragePatterns.filter((p) => p.category === 'analytics');
      expect(analyticsPatterns.length).toBeGreaterThanOrEqual(5);
    });

    it('should have patterns for marketing services', () => {
      const marketingPatterns = defaultStoragePatterns.filter((p) => p.category === 'marketing');
      expect(marketingPatterns.length).toBeGreaterThanOrEqual(4);
    });

    it('should have patterns for preference keys', () => {
      const prefPatterns = defaultStoragePatterns.filter((p) => p.category === 'preferences');
      expect(prefPatterns.length).toBeGreaterThanOrEqual(3);
    });
  });
});
