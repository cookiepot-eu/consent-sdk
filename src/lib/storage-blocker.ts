import type { ConsentCategories, ConsentCategory } from '../types';

/**
 * Storage pattern for categorizing storage keys
 */
export interface StoragePattern {
  pattern: string | RegExp;
  category: ConsentCategory;
  description?: string;
}

/**
 * Storage blocking configuration
 */
export interface StorageBlockingConfig {
  enabled: boolean;
  patterns?: StoragePattern[];
  allowedKeys?: (string | RegExp)[];
  queueOperations?: boolean;
  maxQueueSize?: number;
  debug?: boolean;
}

/**
 * Queued storage operation
 */
export interface QueuedStorageOperation {
  type: 'setItem' | 'removeItem' | 'clear';
  storageType: 'localStorage' | 'sessionStorage';
  key?: string;
  value?: string;
  category: ConsentCategory;
  timestamp: number;
}

/**
 * Storage scan result
 */
export interface StorageScanResult {
  localStorage: StorageItem[];
  sessionStorage: StorageItem[];
  scannedAt: string;
}

/**
 * Individual storage item from a scan
 */
export interface StorageItem {
  key: string;
  size: number;
  category: ConsentCategory | 'unknown';
  description?: string;
}

/**
 * Built-in storage key patterns for known third-party services
 */
export const defaultStoragePatterns: StoragePattern[] = [
  // Analytics
  { pattern: /^_ga/, category: 'analytics', description: 'Google Analytics' },
  { pattern: /^_gid/, category: 'analytics', description: 'Google Analytics' },
  { pattern: /^amplitude/, category: 'analytics', description: 'Amplitude' },
  { pattern: /^mixpanel/, category: 'analytics', description: 'Mixpanel' },
  { pattern: /^mp_/, category: 'analytics', description: 'Mixpanel' },
  { pattern: /^ajs_/, category: 'analytics', description: 'Segment' },
  { pattern: /^heap/, category: 'analytics', description: 'Heap Analytics' },
  { pattern: /^ph_/, category: 'analytics', description: 'PostHog' },
  { pattern: /^plausible/, category: 'analytics', description: 'Plausible' },

  // Marketing
  { pattern: /^_fbp/, category: 'marketing', description: 'Facebook Pixel' },
  { pattern: /^_fbc/, category: 'marketing', description: 'Facebook Click ID' },
  { pattern: /^hubspot/, category: 'marketing', description: 'HubSpot' },
  { pattern: /^intercom/, category: 'marketing', description: 'Intercom' },
  { pattern: /^drift/, category: 'marketing', description: 'Drift' },
  { pattern: /^_gcl/, category: 'marketing', description: 'Google Ads' },
  { pattern: /^_ttp/, category: 'marketing', description: 'TikTok Pixel' },

  // Preferences
  { pattern: /^theme/, category: 'preferences', description: 'Theme preference' },
  { pattern: /^lang/, category: 'preferences', description: 'Language preference' },
  { pattern: /^i18n/, category: 'preferences', description: 'Internationalization' },
];

/**
 * Storage Blocker
 *
 * Intercepts localStorage and sessionStorage write operations
 * and blocks them until appropriate consent is given.
 */
/**
 * Saved original methods for a single storage instance
 */
interface SavedMethods {
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

export class StorageBlocker {
  private queue: QueuedStorageOperation[] = [];
  private patterns: StoragePattern[];
  private allowedKeys: (string | RegExp)[];
  private consent: ConsentCategories;
  private config: StorageBlockingConfig;
  private active: boolean = false;

  // Store original methods per storage instance
  private origLocal: SavedMethods | null = null;
  private origSession: SavedMethods | null = null;

  constructor(config: StorageBlockingConfig, initialConsent: ConsentCategories) {
    this.config = config;
    this.patterns = [...defaultStoragePatterns, ...(config.patterns || [])];
    this.allowedKeys = [
      /^cookiepot_/,
      ...(config.allowedKeys || []),
    ];
    this.consent = { ...initialConsent };
  }

  /**
   * Start intercepting storage operations
   */
  start(): void {
    if (this.active || typeof window === 'undefined') {
      return;
    }

    this.origLocal = this.wrapStorage(localStorage, 'localStorage');
    this.origSession = this.wrapStorage(sessionStorage, 'sessionStorage');
    this.active = true;

    if (this.config.debug) {
      console.log('[CookiePot] Storage blocker started');
    }
  }

  /**
   * Stop intercepting and restore original behavior
   */
  stop(): void {
    if (!this.active) {
      return;
    }

    if (this.origLocal) this.restoreStorage(localStorage, this.origLocal);
    if (this.origSession) this.restoreStorage(sessionStorage, this.origSession);
    this.origLocal = null;
    this.origSession = null;
    this.active = false;

    if (this.config.debug) {
      console.log('[CookiePot] Storage blocker stopped');
    }
  }

  /**
   * Update consent state and process queued operations
   */
  updateConsent(consent: ConsentCategories): void {
    this.consent = { ...consent };
    this.processQueue();
  }

  /**
   * Get queued operations
   */
  getQueue(): QueuedStorageOperation[] {
    return [...this.queue];
  }

  /**
   * Scan current storage and return categorized report
   */
  scan(): StorageScanResult {
    return {
      localStorage: this.scanStorage(localStorage),
      sessionStorage: this.scanStorage(sessionStorage),
      scannedAt: new Date().toISOString(),
    };
  }

  /**
   * Check if the blocker is active
   */
  isActive(): boolean {
    return this.active;
  }

  private wrapStorage(storage: Storage, type: 'localStorage' | 'sessionStorage'): SavedMethods {
    // Capture original methods (bound to storage instance)
    const origSetItem = storage.setItem.bind(storage);
    const origRemoveItem = storage.removeItem.bind(storage);
    const origClear = storage.clear.bind(storage);
    const saved: SavedMethods = { setItem: origSetItem, removeItem: origRemoveItem, clear: origClear };

    // Override setItem via defineProperty (works with Proxy-based storage)
    Object.defineProperty(storage, 'setItem', {
      value: (key: string, value: string) => {
        if (this.isAllowed(key)) {
          return origSetItem(key, value);
        }

        const category = this.categorizeKey(key);

        if (this.hasConsent(category)) {
          return origSetItem(key, value);
        }

        // Block and optionally queue
        if (this.config.queueOperations !== false) {
          this.queueOperation({
            type: 'setItem',
            storageType: type,
            key,
            value,
            category,
            timestamp: Date.now(),
          });
        }

        if (this.config.debug) {
          console.log(`[CookiePot] Blocked ${type}.setItem("${key}") - requires ${category} consent`);
        }
      },
      writable: true,
      configurable: true,
    });

    // Override removeItem
    Object.defineProperty(storage, 'removeItem', {
      value: (key: string) => {
        if (this.isAllowed(key)) {
          return origRemoveItem(key);
        }

        const category = this.categorizeKey(key);

        if (this.hasConsent(category)) {
          return origRemoveItem(key);
        }

        if (this.config.queueOperations !== false) {
          this.queueOperation({
            type: 'removeItem',
            storageType: type,
            key,
            category,
            timestamp: Date.now(),
          });
        }

        if (this.config.debug) {
          console.log(`[CookiePot] Blocked ${type}.removeItem("${key}") - requires ${category} consent`);
        }
      },
      writable: true,
      configurable: true,
    });

    // Override clear
    Object.defineProperty(storage, 'clear', {
      value: () => {
        // clear() is drastic - default to marketing category (strictest)
        if (this.hasConsent('marketing')) {
          return origClear();
        }

        if (this.config.queueOperations !== false) {
          this.queueOperation({
            type: 'clear',
            storageType: type,
            category: 'marketing',
            timestamp: Date.now(),
          });
        }

        if (this.config.debug) {
          console.log(`[CookiePot] Blocked ${type}.clear() - requires marketing consent`);
        }
      },
      writable: true,
      configurable: true,
    });

    return saved;
  }

  private restoreStorage(storage: Storage, saved: SavedMethods): void {
    Object.defineProperty(storage, 'setItem', {
      value: saved.setItem,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(storage, 'removeItem', {
      value: saved.removeItem,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(storage, 'clear', {
      value: saved.clear,
      writable: true,
      configurable: true,
    });
  }

  private isAllowed(key: string): boolean {
    return this.allowedKeys.some((pattern) => {
      if (typeof pattern === 'string') {
        return key === pattern;
      }
      return pattern.test(key);
    });
  }

  categorizeKey(key: string): ConsentCategory {
    for (const { pattern, category } of this.patterns) {
      if (typeof pattern === 'string') {
        if (key === pattern || key.startsWith(pattern)) {
          return category;
        }
      } else if (pattern.test(key)) {
        return category;
      }
    }
    // Default to marketing (strictest) for unknown keys
    return 'marketing';
  }

  private hasConsent(category: ConsentCategory): boolean {
    if (category === 'necessary') return true;
    return this.consent[category] === true;
  }

  private queueOperation(op: QueuedStorageOperation): void {
    const maxSize = this.config.maxQueueSize ?? 100;
    if (this.queue.length >= maxSize) {
      // Drop oldest
      this.queue.shift();
    }
    this.queue.push(op);
  }

  private processQueue(): void {
    const remaining: QueuedStorageOperation[] = [];

    for (const op of this.queue) {
      if (this.hasConsent(op.category)) {
        this.executeOperation(op);
      } else {
        remaining.push(op);
      }
    }

    this.queue = remaining;

    if (this.config.debug && remaining.length < this.queue.length) {
      console.log(`[CookiePot] Processed ${this.queue.length - remaining.length} queued storage operations`);
    }
  }

  private executeOperation(op: QueuedStorageOperation): void {
    const saved = op.storageType === 'localStorage' ? this.origLocal : this.origSession;
    if (!saved) return;

    switch (op.type) {
      case 'setItem':
        if (op.key != null && op.value != null) {
          saved.setItem(op.key, op.value);
        }
        break;
      case 'removeItem':
        if (op.key != null) {
          saved.removeItem(op.key);
        }
        break;
      case 'clear':
        saved.clear();
        break;
    }
  }

  private scanStorage(storage: Storage): StorageItem[] {
    const items: StorageItem[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key === null) continue;

      const value = storage.getItem(key) || '';
      const category = this.isAllowed(key) ? 'necessary' : this.categorizeKey(key);
      const patternMatch = this.patterns.find((p) => {
        if (typeof p.pattern === 'string') {
          return key === p.pattern || key.startsWith(p.pattern);
        }
        return p.pattern.test(key);
      });

      items.push({
        key,
        size: new Blob([value]).size,
        category: category as ConsentCategory | 'unknown',
        description: patternMatch?.description,
      });
    }

    return items;
  }
}
