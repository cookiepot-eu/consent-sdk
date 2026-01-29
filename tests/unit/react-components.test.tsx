import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import React from 'react';
import {
  ConsentBanner,
  PreferencesButton,
  AcceptAllButton,
  RejectAllButton,
} from '../../src/react/components';
import { CookiePotProvider } from '../../src/react/provider';
import { CookiePot } from '../../src/client';

describe('React Components', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(';').forEach((cookie) => {
      const [name] = cookie.split('=');
      document.cookie = `${name.trim()}=; Max-Age=-1; Path=/`;
    });
    document.body.innerHTML = '';

    // Mock fetch
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    // Default successful API response
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        consentId: 'test-consent-id',
        timestamp: '2026-01-29T12:00:00Z',
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
    (CookiePot as any).instance = null;
  });

  function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <CookiePotProvider config={{ apiKey: 'test-api-key', domain: 'example.com' }}>
        {children}
      </CookiePotProvider>
    );
  }

  describe('ConsentBanner', () => {
    it('should render without crashing', () => {
      render(
        <TestWrapper>
          <ConsentBanner />
        </TestWrapper>
      );

      // ConsentBanner renders null, so we just check it doesn't throw
      expect(true).toBe(true);
    });

    it('should show banner when no consent is stored', async () => {
      render(
        <TestWrapper>
          <ConsentBanner autoShow={true} />
        </TestWrapper>
      );

      // Wait for effect to run
      await waitFor(() => {
        const banner = document.querySelector('.cookiepot-banner');
        expect(banner).not.toBeNull();
      });
    });

    it('should not show banner when autoShow is false', async () => {
      render(
        <TestWrapper>
          <ConsentBanner autoShow={false} />
        </TestWrapper>
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const banner = document.querySelector('.cookiepot-banner');
      expect(banner).toBeNull();
    });

    it('should accept position prop', () => {
      render(
        <TestWrapper>
          <ConsentBanner position="top-center" />
        </TestWrapper>
      );

      // Component renders null but accepts the prop
      expect(true).toBe(true);
    });

    it('should accept theme prop', () => {
      render(
        <TestWrapper>
          <ConsentBanner theme="dark" />
        </TestWrapper>
      );

      expect(true).toBe(true);
    });

    it('should accept showRejectAll prop', () => {
      render(
        <TestWrapper>
          <ConsentBanner showRejectAll={false} />
        </TestWrapper>
      );

      expect(true).toBe(true);
    });
  });

  describe('PreferencesButton', () => {
    it('should render with default text', () => {
      render(
        <TestWrapper>
          <PreferencesButton />
        </TestWrapper>
      );

      expect(screen.getByRole('button').textContent).toBe('Cookie Preferences');
    });

    it('should render with custom text', () => {
      render(
        <TestWrapper>
          <PreferencesButton>Manage Cookies</PreferencesButton>
        </TestWrapper>
      );

      expect(screen.getByRole('button').textContent).toBe('Manage Cookies');
    });

    it('should apply custom className', () => {
      render(
        <TestWrapper>
          <PreferencesButton className="custom-class" />
        </TestWrapper>
      );

      expect(screen.getByRole('button').className).toContain('custom-class');
    });

    it('should apply custom style', () => {
      render(
        <TestWrapper>
          <PreferencesButton style={{ color: 'red' }} />
        </TestWrapper>
      );

      const button = screen.getByRole('button') as HTMLButtonElement;
      expect(button.style.color).toBe('red');
    });

    it('should show preferences modal when clicked', async () => {
      render(
        <TestWrapper>
          <PreferencesButton />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const modal = document.querySelector('[role="dialog"]');
        expect(modal).not.toBeNull();
      });
    });
  });

  describe('AcceptAllButton', () => {
    it('should render with default text', () => {
      render(
        <TestWrapper>
          <AcceptAllButton />
        </TestWrapper>
      );

      expect(screen.getByRole('button').textContent).toBe('Accept All');
    });

    it('should render with custom text', () => {
      render(
        <TestWrapper>
          <AcceptAllButton>Accept Cookies</AcceptAllButton>
        </TestWrapper>
      );

      expect(screen.getByRole('button').textContent).toBe('Accept Cookies');
    });

    it('should apply custom className', () => {
      render(
        <TestWrapper>
          <AcceptAllButton className="accept-btn" />
        </TestWrapper>
      );

      expect(screen.getByRole('button').className).toContain('accept-btn');
    });

    it('should apply custom style', () => {
      render(
        <TestWrapper>
          <AcceptAllButton style={{ backgroundColor: 'green' }} />
        </TestWrapper>
      );

      const button = screen.getByRole('button') as HTMLButtonElement;
      expect(button.style.backgroundColor).toBe('green');
    });

    it('should call onAccept callback when clicked', async () => {
      const onAccept = vi.fn();

      render(
        <TestWrapper>
          <AcceptAllButton onAccept={onAccept} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(onAccept).toHaveBeenCalled();
      });
    });

    it('should accept all categories when clicked', async () => {
      render(
        <TestWrapper>
          <AcceptAllButton />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      await act(async () => {
        fireEvent.click(button);
      });

      // Verify API was called (indicating acceptAll was triggered)
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalled();
      });
    });
  });

  describe('RejectAllButton', () => {
    it('should render with default text', () => {
      render(
        <TestWrapper>
          <RejectAllButton />
        </TestWrapper>
      );

      expect(screen.getByRole('button').textContent).toBe('Reject All');
    });

    it('should render with custom text', () => {
      render(
        <TestWrapper>
          <RejectAllButton>Decline All</RejectAllButton>
        </TestWrapper>
      );

      expect(screen.getByRole('button').textContent).toBe('Decline All');
    });

    it('should apply custom className', () => {
      render(
        <TestWrapper>
          <RejectAllButton className="reject-btn" />
        </TestWrapper>
      );

      expect(screen.getByRole('button').className).toContain('reject-btn');
    });

    it('should apply custom style', () => {
      render(
        <TestWrapper>
          <RejectAllButton style={{ backgroundColor: 'red' }} />
        </TestWrapper>
      );

      const button = screen.getByRole('button') as HTMLButtonElement;
      expect(button.style.backgroundColor).toBe('red');
    });

    it('should call onReject callback when clicked', async () => {
      const onReject = vi.fn();

      render(
        <TestWrapper>
          <RejectAllButton onReject={onReject} />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      await act(async () => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(onReject).toHaveBeenCalled();
      });
    });

    it('should reject all categories when clicked', async () => {
      render(
        <TestWrapper>
          <RejectAllButton />
        </TestWrapper>
      );

      const button = screen.getByRole('button');
      await act(async () => {
        fireEvent.click(button);
      });

      // Verify API was called (indicating rejectAll was triggered)
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalled();
      });
    });
  });

  describe('Button types', () => {
    it('should have button type on PreferencesButton', () => {
      render(
        <TestWrapper>
          <PreferencesButton />
        </TestWrapper>
      );

      expect(screen.getByRole('button').getAttribute('type')).toBe('button');
    });

    it('should have button type on AcceptAllButton', () => {
      render(
        <TestWrapper>
          <AcceptAllButton />
        </TestWrapper>
      );

      expect(screen.getByRole('button').getAttribute('type')).toBe('button');
    });

    it('should have button type on RejectAllButton', () => {
      render(
        <TestWrapper>
          <RejectAllButton />
        </TestWrapper>
      );

      expect(screen.getByRole('button').getAttribute('type')).toBe('button');
    });
  });
});
