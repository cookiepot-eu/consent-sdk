import type { BannerConfig } from '../types';
import {
  THEME_COLORS,
  POSITION_STYLES,
  BANNER_DIMENSIONS,
  ANIMATION_DURATION,
  Z_INDEX,
  CSS_CLASSES,
  ARIA_LABELS,
} from './constants';
import { getBannerText } from './i18n';

/**
 * Banner Manager
 */
export class Banner {
  private config: Required<BannerConfig & { text: NonNullable<BannerConfig['text']> }>;
  private language: string;
  private element: HTMLElement | null = null;
  private onAcceptAll?: () => void;
  private onRejectAll?: () => void;

  constructor(
    config: BannerConfig,
    language: string,
    callbacks: {
      onAcceptAll?: () => void;
      onRejectAll?: () => void;
    } = {}
  ) {
    this.config = {
      position: config.position ?? 'bottom-center',
      theme: config.theme ?? 'light',
      showRejectAll: config.showRejectAll ?? true,
      text: config.text ?? {},
      styling: config.styling ?? {},
    };
    this.language = language;
    this.onAcceptAll = callbacks.onAcceptAll;
    this.onRejectAll = callbacks.onRejectAll;
  }

  /**
   * Show the banner
   */
  show(): void {
    if (this.element) {
      this.element.style.display = 'block';
      this.animateIn();
      return;
    }

    this.element = this.createBanner();
    document.body.appendChild(this.element);
    this.animateIn();
  }

  /**
   * Hide the banner
   */
  hide(): void {
    if (!this.element) return;

    this.animateOut(() => {
      if (this.element) {
        this.element.style.display = 'none';
      }
    });
  }

  /**
   * Remove the banner from DOM
   */
  destroy(): void {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  /**
   * Create the banner element
   */
  private createBanner(): HTMLElement {
    const banner = document.createElement('div');
    banner.className = CSS_CLASSES.banner;
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', ARIA_LABELS.banner);
    banner.setAttribute('aria-modal', 'false');

    // Apply base styles
    this.applyBaseStyles(banner);

    // Apply theme
    const theme = this.getTheme();
    this.applyTheme(banner, theme);

    // Apply position
    this.applyPosition(banner);

    // Apply custom styling
    this.applyCustomStyling(banner);

    // Create content
    banner.innerHTML = this.createBannerHTML();

    // Attach event listeners
    this.attachEventListeners(banner);

    return banner;
  }

  /**
   * Apply base styles to banner
   */
  private applyBaseStyles(banner: HTMLElement): void {
    Object.assign(banner.style, {
      position: 'fixed',
      zIndex: String(Z_INDEX.banner),
      maxWidth: BANNER_DIMENSIONS.maxWidth,
      width: 'calc(100% - 40px)',
      padding: BANNER_DIMENSIONS.padding,
      borderRadius: BANNER_DIMENSIONS.borderRadius,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5',
      opacity: '0',
      transition: `opacity ${ANIMATION_DURATION.fadeIn}ms ease-in-out`,
    });
  }

  /**
   * Get effective theme (resolve 'auto')
   */
  private getTheme(): 'light' | 'dark' {
    if (this.config.theme === 'auto') {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return this.config.theme;
  }

  /**
   * Apply theme colors
   */
  private applyTheme(banner: HTMLElement, theme: 'light' | 'dark'): void {
    const colors = THEME_COLORS[theme];

    banner.style.backgroundColor = colors.background;
    banner.style.color = colors.text;
    banner.style.border = `1px solid ${colors.border}`;

    // Set CSS custom properties for buttons
    banner.style.setProperty('--cp-primary-color', colors.primary);
    banner.style.setProperty('--cp-bg-color', colors.background);
    banner.style.setProperty('--cp-text-color', colors.text);
    banner.style.setProperty('--cp-border-color', colors.border);
    banner.style.setProperty('--cp-button-text-color', colors.buttonText);
  }

  /**
   * Apply position styles
   */
  private applyPosition(banner: HTMLElement): void {
    const position = POSITION_STYLES[this.config.position];
    Object.assign(banner.style, position);
  }

  /**
   * Apply custom styling from config
   */
  private applyCustomStyling(banner: HTMLElement): void {
    const { styling } = this.config;

    if (styling.primaryColor) {
      banner.style.setProperty('--cp-primary-color', styling.primaryColor);
    }
    if (styling.backgroundColor) {
      banner.style.backgroundColor = styling.backgroundColor;
    }
    if (styling.textColor) {
      banner.style.color = styling.textColor;
    }
    if (styling.borderRadius) {
      banner.style.borderRadius = styling.borderRadius;
    }
    if (styling.fontFamily) {
      banner.style.fontFamily = styling.fontFamily;
    }
  }

  /**
   * Create banner HTML content
   */
  private createBannerHTML(): string {
    const text = getBannerText(this.language, this.config.text);

    const acceptButton = `
      <button
        class="${CSS_CLASSES.button} ${CSS_CLASSES.buttonPrimary}"
        data-action="accept-all"
        aria-label="${ARIA_LABELS.acceptAll}"
        style="
          background-color: var(--cp-primary-color);
          color: var(--cp-button-text-color);
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        "
      >
        ${this.escapeHTML(text.acceptAll)}
      </button>
    `;

    const rejectButton = this.config.showRejectAll
      ? `
      <button
        class="${CSS_CLASSES.button} ${CSS_CLASSES.buttonSecondary}"
        data-action="reject-all"
        aria-label="${ARIA_LABELS.rejectAll}"
        style="
          background-color: transparent;
          color: var(--cp-text-color);
          border: 1px solid var(--cp-border-color);
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        "
      >
        ${this.escapeHTML(text.rejectAll)}
      </button>
    `
      : '';

    return `
      <div style="margin-bottom: ${BANNER_DIMENSIONS.gap};">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
          ${this.escapeHTML(text.title)}
        </h3>
        <p style="margin: 0; opacity: 0.9;">
          ${this.escapeHTML(text.description)}
        </p>
      </div>
      <div style="
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      ">
        ${acceptButton}
        ${rejectButton}
      </div>
    `;
  }

  /**
   * Attach event listeners to buttons
   */
  private attachEventListeners(banner: HTMLElement): void {
    const acceptButton = banner.querySelector('[data-action="accept-all"]');
    const rejectButton = banner.querySelector('[data-action="reject-all"]');

    if (acceptButton) {
      acceptButton.addEventListener('click', () => {
        this.onAcceptAll?.();
      });

      // Hover effect
      acceptButton.addEventListener('mouseenter', (e) => {
        (e.target as HTMLElement).style.opacity = '0.9';
      });
      acceptButton.addEventListener('mouseleave', (e) => {
        (e.target as HTMLElement).style.opacity = '1';
      });
    }

    if (rejectButton) {
      rejectButton.addEventListener('click', () => {
        this.onRejectAll?.();
      });

      // Hover effect
      rejectButton.addEventListener('mouseenter', (e) => {
        const target = e.target as HTMLElement;
        target.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
      });
      rejectButton.addEventListener('mouseleave', (e) => {
        const target = e.target as HTMLElement;
        target.style.backgroundColor = 'transparent';
      });
    }

    // Keyboard navigation
    banner.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    });
  }

  /**
   * Animate banner in
   */
  private animateIn(): void {
    if (!this.element) return;

    // Trigger reflow
    void this.element.offsetHeight;

    this.element.style.opacity = '1';
  }

  /**
   * Animate banner out
   */
  private animateOut(callback: () => void): void {
    if (!this.element) return;

    this.element.style.opacity = '0';

    setTimeout(callback, ANIMATION_DURATION.fadeOut);
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHTML(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

/**
 * Create and show a consent banner
 */
export function createBanner(
  config: BannerConfig,
  language: string,
  callbacks?: {
    onAcceptAll?: () => void;
    onRejectAll?: () => void;
  }
): Banner {
  return new Banner(config, language, callbacks);
}
