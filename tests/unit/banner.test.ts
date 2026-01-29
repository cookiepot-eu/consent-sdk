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
      expect(bannerElement?.getAttribute('role')).toBe('dialog');
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

      const bannerHTML = document.body.innerHTML;
      expect(bannerHTML).toContain('Custom Title');
      expect(bannerHTML).toContain('Custom Description');
      expect(bannerHTML).toContain('Accept');
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
      // backgroundColor can be in hex or rgb format depending on browser
      const bgColor = bannerElement.style.backgroundColor;
      expect(bgColor === '#ffffff' || bgColor === 'rgb(255, 255, 255)').toBe(true);
    });

    it('should reshow existing banner when called multiple times', () => {
      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: true,
        },
        'en'
      );

      banner.show();
      const firstBanner = document.querySelector('.cookiepot-banner');

      banner.show();
      const secondBanner = document.querySelector('.cookiepot-banner');

      expect(firstBanner).toBe(secondBanner);
    });
  });

  describe('hide', () => {
    it('should hide banner with display none', async () => {
      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: true,
        },
        'en'
      );

      banner.show();
      const bannerElement = document.querySelector('.cookiepot-banner') as HTMLElement;
      expect(bannerElement).toBeTruthy();

      banner.hide();

      // Wait for animation to complete (animations are 300ms by default)
      await new Promise(resolve => setTimeout(resolve, 350));

      // Banner is hidden with display: none (not removed from DOM)
      const hiddenBanner = document.querySelector('.cookiepot-banner') as HTMLElement;
      expect(hiddenBanner).toBeTruthy();
      expect(hiddenBanner.style.display).toBe('none');
    });

    it('should not throw when hiding already hidden banner', () => {
      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: true,
        },
        'en'
      );

      expect(() => banner.hide()).not.toThrow();
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

    it('should handle multiple callbacks', () => {
      const onAcceptAll = vi.fn();
      const onRejectAll = vi.fn();

      banner = new Banner(
        {
          position: 'bottom-center',
          theme: 'light',
          showRejectAll: true,
        },
        'en',
        { onAcceptAll, onRejectAll }
      );

      banner.show();

      const acceptButton = document.querySelector('[data-action="accept-all"]') as HTMLButtonElement;
      const rejectButton = document.querySelector('[data-action="reject-all"]') as HTMLButtonElement;

      acceptButton?.click();
      expect(onAcceptAll).toHaveBeenCalledOnce();
      expect(onRejectAll).not.toHaveBeenCalled();

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

    it('should support all 8 languages', () => {
      const languages = ['en', 'nl', 'de', 'fr', 'es', 'it', 'pt', 'pl'];

      languages.forEach((lang) => {
        const testBanner = new Banner(
          {
            position: 'bottom-center',
            theme: 'light',
            showRejectAll: true,
          },
          lang
        );

        testBanner.show();
        const acceptButton = document.querySelector('[data-action="accept-all"]');
        expect(acceptButton).toBeTruthy();
        testBanner.hide();
      });
    });
  });

  describe('configuration', () => {
    it('should accept minimal configuration', () => {
      banner = new Banner({}, 'en');

      expect(() => banner.show()).not.toThrow();
      expect(document.querySelector('.cookiepot-banner')).toBeTruthy();
    });

    it('should handle all theme options', () => {
      const themes = ['light', 'dark', 'auto'] as const;

      themes.forEach((theme) => {
        const testBanner = new Banner({ theme }, 'en');
        expect(() => testBanner.show()).not.toThrow();
        testBanner.hide();
      });
    });

    it('should handle all position options', () => {
      const positions = [
        'top-left', 'top-center', 'top-right',
        'bottom-left', 'bottom-center', 'bottom-right'
      ] as const;

      positions.forEach((position) => {
        const testBanner = new Banner({ position }, 'en');
        expect(() => testBanner.show()).not.toThrow();
        testBanner.hide();
      });
    });
  });
});
