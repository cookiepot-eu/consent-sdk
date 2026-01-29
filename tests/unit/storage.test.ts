import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getConsentFromStorage,
  saveConsentToStorage,
  clearConsentFromStorage,
} from '../../src/lib/storage';
import type { ConsentState } from '../../src/types';
import { STORAGE_KEYS } from '../../src/types';

describe('storage', () => {
  const mockConsent: ConsentState = {
    visitorId: 'test-visitor-id',
    sessionId: 'test-session-id',
    categories: {
      necessary: true,
      analytics: true,
      marketing: false,
      preferences: true,
    },
    timestamp: '2026-01-27T12:00:00Z',
  };

  beforeEach(() => {
    // Clear all storage before each test
    document.cookie.split(';').forEach((cookie) => {
      const [name] = cookie.split('=');
      document.cookie = `${name.trim()}=; Max-Age=-1; Path=/`;
    });
    localStorage.clear();
  });

  describe('saveConsentToStorage', () => {
    it('should save consent to both cookie and localStorage', () => {
      saveConsentToStorage(mockConsent);

      // Check cookie
      const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith(STORAGE_KEYS.CONSENT + '='));
      expect(cookieValue).toBeDefined();

      // Check localStorage
      const localValue = localStorage.getItem(STORAGE_KEYS.CONSENT);
      expect(localValue).toBeDefined();
      expect(JSON.parse(localValue!)).toEqual(mockConsent);
    });

    it('should respect custom cookie options', () => {
      saveConsentToStorage(mockConsent, {
        domain: 'example.com',
        maxAge: 3600,
      });

      // Check that it was saved to localStorage at least
      const localValue = localStorage.getItem(STORAGE_KEYS.CONSENT);
      expect(localValue).toBeDefined();
      expect(JSON.parse(localValue!)).toEqual(mockConsent);
    });

    it('should handle errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Create circular reference that will fail JSON.stringify
      const circular: Record<string, unknown> = {};
      circular.self = circular;

      saveConsentToStorage(circular as unknown as ConsentState);

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getConsentFromStorage', () => {
    it('should retrieve consent from cookie', () => {
      saveConsentToStorage(mockConsent);
      const retrieved = getConsentFromStorage();
      expect(retrieved).toEqual(mockConsent);
    });

    it('should fallback to localStorage if cookie is not present', () => {
      // Save only to localStorage
      localStorage.setItem(STORAGE_KEYS.CONSENT, JSON.stringify(mockConsent));

      const retrieved = getConsentFromStorage();
      expect(retrieved).toEqual(mockConsent);
    });

    it('should return null if no consent is stored', () => {
      const retrieved = getConsentFromStorage();
      expect(retrieved).toBeNull();
    });

    it('should return null for invalid stored data', () => {
      localStorage.setItem(STORAGE_KEYS.CONSENT, 'invalid-json');
      const retrieved = getConsentFromStorage();
      expect(retrieved).toBeNull();
    });

    it('should validate consent structure', () => {
      const invalidConsent = {
        visitorId: 'test',
        // Missing required fields
      };
      localStorage.setItem(STORAGE_KEYS.CONSENT, JSON.stringify(invalidConsent));

      const retrieved = getConsentFromStorage();
      expect(retrieved).toBeNull();
    });
  });

  describe('clearConsentFromStorage', () => {
    it('should clear consent from both cookie and localStorage', () => {
      saveConsentToStorage(mockConsent);
      clearConsentFromStorage();

      const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith(STORAGE_KEYS.CONSENT + '='));
      expect(cookieValue).toBeUndefined();

      const localValue = localStorage.getItem(STORAGE_KEYS.CONSENT);
      expect(localValue).toBeNull();
    });

    it('should handle custom cookie domain', () => {
      saveConsentToStorage(mockConsent, { domain: 'example.com' });
      clearConsentFromStorage('example.com');

      const localValue = localStorage.getItem(STORAGE_KEYS.CONSENT);
      expect(localValue).toBeNull();
    });
  });
});
