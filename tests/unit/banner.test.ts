import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Banner } from '../../src/lib/banner';

describe('Banner', () => {
  let banner: Banner;

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    if (banner) {
      banner.hide();
    }
  });

  describe('show', () => {
    it('should create and display banner', () => {
      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: true,
        },
        'en'
      );

      banner.show();

      const bannerElement = document.querySelector('.cookiepot-banner');
      expect(bannerElement).toBeTruthy();
      expect(bannerElement?.getAttribute('data-position')).toBe('bottom-center');
      expect(bannerElement?.getAttribute('data-theme')).toBe('light');
    });

    it('should show accept all button', () => {
      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: false,
        },
        'en'
      );

      banner.show();

      const acceptButton = document.querySelector('[data-action="accept-all"]');
      expect(acceptButton).toBeTruthy();
      expect(acceptButton?.textContent).toContain('Accept All');
    });

    it('should show reject all button when enabled', () => {
      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: true,
        },
        'en'
      );

      banner.show();

      const rejectButton = document.querySelector('[data-action="reject-all"]');
      expect(rejectButton).toBeTruthy();
    });

    it('should not show reject all button when disabled', () => {
      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: false,
        },
        'en'
      );

      banner.show();

      const rejectButton = document.querySelector('[data-action="reject-all"]');
      expect(rejectButton).toBeFalsy();
    });

    it('should use custom text', () => {
      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: true,
          text: {
            title: 'Custom Title',
            description: 'Custom Description',
            acceptAll: 'Accept',
            rejectAll: 'Decline',
          },
        },
        'en'
      );

      banner.show();

      const title = document.querySelector('h3');
      const description = document.querySelector('p');
      const acceptButton = document.querySelector('[data-action="accept-all"]');

      expect(title?.textContent).toBe('Custom Title');
      expect(description?.textContent).toBe('Custom Description');
      expect(acceptButton?.textContent).toContain('Accept');
    });

    it('should apply custom styling', () => {
      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: true,
          styling: {
            primaryColor: '#ff0000',
            backgroundColor: '#ffffff',
          },
        },
        'en'
      );

      banner.show();

      const bannerElement = document.querySelector('.cookiepot-banner') as HTMLElement;
      expect(bannerElement).toBeTruthy();
    });

    it('should support different positions', () => {
      const positions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'] as const;

      positions.forEach((position) => {
        banner = new Banner(
          {
            position,
            theme: 'light',
            showRejectAll: true,
          },
          'en'
        );

        banner.show();

        const bannerElement = document.querySelector('.cookiepot-banner');
        expect(bannerElement?.getAttribute('data-position')).toBe(position);

        banner.hide();
      });
    });

    it('should support different themes', () => {
      const themes = ['light', 'dark', 'auto'] as const;

      themes.forEach((theme) => {
        banner = new Banner(
          {
            position: 'bottom-center',
            theme,
            showRejectAll: true,
          },
          'en'
        );

        banner.show();

        const bannerElement = document.querySelector('.cookiepot-banner');
        expect(bannerElement?.getAttribute('data-theme')).toBe(theme);

        banner.hide();
      });
    });
  });

  describe('hide', () => {
    it('should remove banner from DOM', () => {
      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: true,
        },
        'en'
      );

      banner.show();
      expect(document.querySelector('.cookiepot-banner')).toBeTruthy();

      banner.hide();
      expect(document.querySelector('.cookiepot-banner')).toBeFalsy();
    });
  });

  describe('event handlers', () => {
    it('should call onAcceptAll when accept button is clicked', () => {
      const onAcceptAll = vi.fn();

      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: true,
        },
        'en',
        { onAcceptAll }
      );

      banner.show();

      const acceptButton = document.querySelector('[data-action="accept-all"]') as HTMLButtonElement;
      acceptButton?.click();

      expect(onAcceptAll).toHaveBeenCalledOnce();
    });

    it('should call onRejectAll when reject button is clicked', () => {
      const onRejectAll = vi.fn();

      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: true,
        },
        'en',
        { onRejectAll }
      );

      banner.show();

      const rejectButton = document.querySelector('[data-action="reject-all"]') as HTMLButtonElement;
      rejectButton?.click();

      expect(onRejectAll).toHaveBeenCalledOnce();
    });
  });

  describe('language support', () => {
    it('should display Dutch text', () => {
      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: true,
        },
        'nl'
      );

      banner.show();

      const acceptButton = document.querySelector('[data-action="accept-all"]');
      expect(acceptButton?.textContent).toContain('Alles accepteren');
    });

    it('should display German text', () => {
      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: true,
        },
        'de'
      );

      banner.show();

      const acceptButton = document.querySelector('[data-action="accept-all"]');
      expect(acceptButton?.textContent).toContain('Alle akzeptieren');
    });

    it('should fallback to English for unsupported language', () => {
      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: true,
        },
        'xx'
      );

      banner.show();

      const acceptButton = document.querySelector('[data-action="accept-all"]');
      expect(acceptButton?.textContent).toContain('Accept All');
    });
  });
});
