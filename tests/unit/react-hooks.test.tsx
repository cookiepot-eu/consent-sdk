import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, renderHook, waitFor } from '@testing-library/react';
import { CookiePotProvider, useCookiePot, useConsent, useHasConsent } from '../../src/react';
import type { CookiePotConfig } from '../../src/types';

describe('React Hooks', () => {
  const mockConfig: CookiePotConfig = {
    apiKey: 'test-key',
    domain: 'test.com',
  };

  beforeEach(() => {
    // Clear any existing instances
    vi.clearAllMocks();
  });

  describe('CookiePotProvider', () => {
    it('should render children', () => {
      const { getByText } = render(
        <CookiePotProvider config={mockConfig}>
          <div>Test Content</div>
        </CookiePotProvider>
      );

      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should accept config prop', () => {
      expect(() => {
        render(
          <CookiePotProvider config={mockConfig}>
            <div>Test</div>
          </CookiePotProvider>
        );
      }).not.toThrow();
    });
  });

  describe('useCookiePot', () => {
    it('should return SDK instance', () => {
      const { result } = renderHook(() => useCookiePot(), {
        wrapper: ({ children }) => (
          <CookiePotProvider config={mockConfig}>{children}</CookiePotProvider>
        ),
      });

      expect(result.current).toBeTruthy();
      expect(result.current.getConsent).toBeDefined();
      expect(result.current.setConsent).toBeDefined();
    });

    it('should throw when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useCookiePot());
      }).toThrow('must be used within CookiePotProvider');

      console.error = originalError;
    });
  });

  describe('useConsent', () => {
    it('should return initial consent state', () => {
      const { result } = renderHook(() => useConsent(), {
        wrapper: ({ children }) => (
          <CookiePotProvider config={mockConfig}>{children}</CookiePotProvider>
        ),
      });

      expect(result.current).toBeDefined();
      expect(result.current.necessary).toBe(true);
      expect(result.current.analytics).toBeDefined();
      expect(result.current.marketing).toBeDefined();
      expect(result.current.preferences).toBeDefined();
    });

    it('should update when consent changes', async () => {
      const { result } = renderHook(
        () => ({
          sdk: useCookiePot(),
          consent: useConsent(),
        }),
        {
          wrapper: ({ children }) => (
            <CookiePotProvider config={mockConfig}>{children}</CookiePotProvider>
          ),
        }
      );

      const newConsent = {
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: false,
      };

      result.current.sdk.setConsent(newConsent);

      await waitFor(() => {
        expect(result.current.consent.analytics).toBe(true);
      });
    });
  });

  describe('useHasConsent', () => {
    it('should return consent for specific category', () => {
      const { result } = renderHook(() => useHasConsent('analytics'), {
        wrapper: ({ children }) => (
          <CookiePotProvider config={mockConfig}>{children}</CookiePotProvider>
        ),
      });

      expect(typeof result.current).toBe('boolean');
    });

    it('should update when category consent changes', async () => {
      const { result } = renderHook(
        () => ({
          sdk: useCookiePot(),
          hasAnalytics: useHasConsent('analytics'),
        }),
        {
          wrapper: ({ children }) => (
            <CookiePotProvider config={mockConfig}>{children}</CookiePotProvider>
          ),
        }
      );

      result.current.sdk.setConsent({
        necessary: true,
        analytics: true,
        marketing: false,
        preferences: false,
      });

      await waitFor(() => {
        expect(result.current.hasAnalytics).toBe(true);
      });
    });

    it('should handle all categories', () => {
      const categories = ['necessary', 'analytics', 'marketing', 'preferences'] as const;

      categories.forEach((category) => {
        const { result } = renderHook(() => useHasConsent(category), {
          wrapper: ({ children }) => (
            <CookiePotProvider config={mockConfig}>{children}</CookiePotProvider>
          ),
        });

        expect(typeof result.current).toBe('boolean');
      });
    });
  });
});
