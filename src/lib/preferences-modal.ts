import type { ConsentCategories, BannerConfig } from '../types';
import { Z_INDEX, CSS_CLASSES, ANIMATION_DURATION, THEME_COLORS } from './constants';
import { getTranslation } from './i18n';

/**
 * Preferences Modal
 *
 * Displays a modal for granular consent management
 */

export class PreferencesModal {
  private config: BannerConfig;
  private language: string;
  private modalElement: HTMLElement | null = null;
  private overlayElement: HTMLElement | null = null;
  private currentConsent: ConsentCategories;
  private onSave?: (consent: ConsentCategories) => void;

  constructor(
    config: BannerConfig,
    language: string,
    currentConsent: ConsentCategories,
    callbacks: {
      onSave?: (consent: ConsentCategories) => void;
    } = {}
  ) {
    this.config = config;
    this.language = language;
    this.currentConsent = { ...currentConsent };
    this.onSave = callbacks.onSave;
  }

  /**
   * Show the preferences modal
   */
  show(): void {
    if (this.modalElement) {
      this.modalElement.style.display = 'block';
      this.overlayElement!.style.display = 'block';
      this.animateIn();
      return;
    }

    this.createOverlay();
    this.modalElement = this.createModal();
    document.body.appendChild(this.overlayElement!);
    document.body.appendChild(this.modalElement);
    this.animateIn();

    // Focus trap
    this.modalElement.focus();
  }

  /**
   * Hide the preferences modal
   */
  hide(): void {
    if (!this.modalElement || !this.overlayElement) return;

    this.animateOut(() => {
      if (this.modalElement && this.overlayElement) {
        this.modalElement.style.display = 'none';
        this.overlayElement.style.display = 'none';
      }
    });
  }

  /**
   * Destroy the modal
   */
  destroy(): void {
    if (this.modalElement) {
      this.modalElement.remove();
      this.modalElement = null;
    }
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }
  }

  /**
   * Create overlay element
   */
  private createOverlay(): void {
    const overlay = document.createElement('div');
    overlay.className = CSS_CLASSES.overlay;
    overlay.setAttribute('aria-hidden', 'true');

    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: String(Z_INDEX.overlay),
      opacity: '0',
      transition: `opacity ${ANIMATION_DURATION.fadeIn}ms ease-in-out`,
    });

    overlay.addEventListener('click', () => this.hide());

    this.overlayElement = overlay;
  }

  /**
   * Create modal element
   */
  private createModal(): HTMLElement {
    const modal = document.createElement('div');
    modal.className = CSS_CLASSES.modal;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'cookiepot-modal-title');
    modal.tabIndex = -1;

    this.applyBaseStyles(modal);

    const theme = this.getTheme();
    this.applyTheme(modal, theme);

    modal.innerHTML = this.createModalHTML();

    this.attachEventListeners(modal);

    return modal;
  }

  /**
   * Apply base styles to modal
   */
  private applyBaseStyles(modal: HTMLElement): void {
    Object.assign(modal.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: String(Z_INDEX.modal),
      maxWidth: '600px',
      width: 'calc(100% - 40px)',
      maxHeight: '80vh',
      overflowY: 'auto',
      padding: '32px',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5',
      opacity: '0',
      transition: `opacity ${ANIMATION_DURATION.fadeIn}ms ease-in-out`,
    });
  }

  /**
   * Get effective theme
   */
  private getTheme(): 'light' | 'dark' {
    if (this.config.theme === 'auto') {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    return this.config.theme ?? 'light';
  }

  /**
   * Apply theme colors
   */
  private applyTheme(modal: HTMLElement, theme: 'light' | 'dark'): void {
    const colors = THEME_COLORS[theme];

    modal.style.backgroundColor = colors.background;
    modal.style.color = colors.text;
    modal.style.border = `1px solid ${colors.border}`;

    modal.style.setProperty('--cp-primary-color', colors.primary);
    modal.style.setProperty('--cp-bg-color', colors.background);
    modal.style.setProperty('--cp-text-color', colors.text);
    modal.style.setProperty('--cp-border-color', colors.border);
    modal.style.setProperty('--cp-button-text-color', colors.buttonText);
  }

  /**
   * Create modal HTML content
   */
  private createModalHTML(): string {
    const t = getTranslation(this.language);

    const categories = [
      {
        id: 'necessary',
        name: t.necessary,
        description: t.necessaryDescription,
        required: true,
        checked: true,
      },
      {
        id: 'analytics',
        name: t.analytics,
        description: t.analyticsDescription,
        required: false,
        checked: this.currentConsent.analytics,
      },
      {
        id: 'marketing',
        name: t.marketing,
        description: t.marketingDescription,
        required: false,
        checked: this.currentConsent.marketing,
      },
      {
        id: 'preferences',
        name: t.preferences,
        description: t.preferencesDescription,
        required: false,
        checked: this.currentConsent.preferences,
      },
    ];

    const categoriesHTML = categories
      .map(
        (cat) => `
      <div style="
        padding: 16px;
        border: 1px solid var(--cp-border-color);
        border-radius: 8px;
        margin-bottom: 12px;
      ">
        <label style="display: flex; align-items: flex-start; cursor: ${cat.required ? 'not-allowed' : 'pointer'};">
          <input
            type="checkbox"
            name="${cat.id}"
            ${cat.checked ? 'checked' : ''}
            ${cat.required ? 'disabled' : ''}
            style="
              margin-right: 12px;
              margin-top: 2px;
              cursor: ${cat.required ? 'not-allowed' : 'pointer'};
              width: 18px;
              height: 18px;
            "
          />
          <div style="flex: 1;">
            <div style="font-weight: 600; margin-bottom: 4px;">
              ${this.escapeHTML(cat.name)}
              ${cat.required ? '<span style="color: #6b7280; font-size: 12px;">(Required)</span>' : ''}
            </div>
            <div style="font-size: 13px; opacity: 0.8;">
              ${this.escapeHTML(cat.description)}
            </div>
          </div>
        </label>
      </div>
    `
      )
      .join('');

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
          <h2 id="cookiepot-modal-title" style="margin: 0; font-size: 24px; font-weight: 700;">
            ${this.escapeHTML(t.managePreferences)}
          </h2>
          <button
            data-action="close"
            aria-label="Close"
            style="
              background: none;
              border: none;
              font-size: 24px;
              line-height: 1;
              cursor: pointer;
              padding: 0;
              color: var(--cp-text-color);
              opacity: 0.6;
            "
          >
            ×
          </button>
        </div>

        <div style="margin-bottom: 24px;">
          ${categoriesHTML}
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button
            data-action="save"
            style="
              background-color: var(--cp-primary-color);
              color: var(--cp-button-text-color);
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: opacity 0.2s;
            "
          >
            ${this.escapeHTML(t.savePreferences)}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(modal: HTMLElement): void {
    const closeButton = modal.querySelector('[data-action="close"]');
    const saveButton = modal.querySelector('[data-action="save"]');

    if (closeButton) {
      closeButton.addEventListener('click', () => this.hide());
    }

    if (saveButton) {
      saveButton.addEventListener('click', () => this.handleSave(modal));

      // Hover effect
      saveButton.addEventListener('mouseenter', (e) => {
        (e.target as HTMLElement).style.opacity = '0.9';
      });
      saveButton.addEventListener('mouseleave', (e) => {
        (e.target as HTMLElement).style.opacity = '1';
      });
    }

    // Keyboard navigation
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    });
  }

  /**
   * Handle save button click
   */
  private handleSave(modal: HTMLElement): void {
    const checkboxes = modal.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');

    const newConsent: ConsentCategories = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };

    checkboxes.forEach((checkbox) => {
      if (checkbox.name in newConsent && checkbox.checked) {
        newConsent[checkbox.name as keyof ConsentCategories] = true;
      }
    });

    this.currentConsent = newConsent;

    if (this.onSave) {
      this.onSave(newConsent);
    }

    this.hide();
  }

  /**
   * Animate modal in
   */
  private animateIn(): void {
    if (!this.modalElement || !this.overlayElement) return;

    // Trigger reflow
    void this.modalElement.offsetHeight;
    void this.overlayElement.offsetHeight;

    this.modalElement.style.opacity = '1';
    this.overlayElement.style.opacity = '1';
  }

  /**
   * Animate modal out
   */
  private animateOut(callback: () => void): void {
    if (!this.modalElement || !this.overlayElement) return;

    this.modalElement.style.opacity = '0';
    this.overlayElement.style.opacity = '0';

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
 * Create a preferences modal
 */
export function createPreferencesModal(
  config: BannerConfig,
  language: string,
  currentConsent: ConsentCategories,
  callbacks?: {
    onSave?: (consent: ConsentCategories) => void;
  }
): PreferencesModal {
  return new PreferencesModal(config, language, currentConsent, callbacks);
}
