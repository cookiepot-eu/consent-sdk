import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PreferencesModal, createPreferencesModal } from '../../src/lib/preferences-modal';
import type { BannerConfig, ConsentCategories } from '../../src/types';

describe('PreferencesModal', () => {
    let modal: PreferencesModal;
    const defaultConfig: BannerConfig = {
        position: 'bottom-center',
        theme: 'light',
        showRejectAll: true,
        primaryColor: '#3b82f6',
    };

    const defaultConsent: ConsentCategories = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
    };

    beforeEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });

    afterEach(() => {
        if (modal) {
            modal.destroy();
        }
    });

    describe('constructor', () => {
        it('should create a modal instance', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            expect(modal).toBeInstanceOf(PreferencesModal);
        });

        it('should accept callbacks', () => {
            const onSave = vi.fn();
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent, { onSave });
            expect(modal).toBeInstanceOf(PreferencesModal);
        });
    });

    describe('show', () => {
        it('should create and show modal', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();

            const modalElement = document.querySelector('[role="dialog"]');
            expect(modalElement).not.toBeNull();
        });

        it('should create overlay', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();

            const overlay = document.querySelector('.cookiepot-overlay');
            expect(overlay).not.toBeNull();
        });

        it('should reuse existing modal on second show', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();

            const firstModal = document.querySelector('[role="dialog"]');
            modal.hide();
            modal.show();

            const secondModal = document.querySelector('[role="dialog"]');
            expect(firstModal).toBe(secondModal);
        });

        it('should set aria attributes', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();

            const modalElement = document.querySelector('[role="dialog"]');
            expect(modalElement?.getAttribute('aria-modal')).toBe('true');
            expect(modalElement?.getAttribute('aria-labelledby')).toBe('cookiepot-modal-title');
        });
    });

    describe('hide', () => {
        it('should hide the modal', async () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();
            modal.hide();

            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 300));

            const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
            expect(modalElement?.style.display).toBe('none');
        });

        it('should handle hide when not shown', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            expect(() => modal.hide()).not.toThrow();
        });
    });

    describe('destroy', () => {
        it('should remove modal from DOM', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();
            modal.destroy();

            const modalElement = document.querySelector('[role="dialog"]');
            expect(modalElement).toBeNull();
        });

        it('should remove overlay from DOM', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();
            modal.destroy();

            const overlay = document.querySelector('.cookiepot-overlay');
            expect(overlay).toBeNull();
        });

        it('should handle destroy when not shown', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            expect(() => modal.destroy()).not.toThrow();
        });
    });

    describe('theme', () => {
        it('should apply light theme', () => {
            modal = new PreferencesModal({ ...defaultConfig, theme: 'light' }, 'en', defaultConsent);
            modal.show();

            const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
            expect(modalElement?.style.backgroundColor).toBe('#ffffff');
        });

        it('should apply dark theme', () => {
            modal = new PreferencesModal({ ...defaultConfig, theme: 'dark' }, 'en', defaultConsent);
            modal.show();

            const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
            expect(modalElement?.style.backgroundColor).toBe('#1f2937');
        });

        it('should handle auto theme', () => {
            // Mock matchMedia
            vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
                matches: false, // prefer light
                addEventListener: vi.fn(),
            }));

            modal = new PreferencesModal({ ...defaultConfig, theme: 'auto' }, 'en', defaultConsent);
            modal.show();

            const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
            expect(modalElement).not.toBeNull();

            vi.unstubAllGlobals();
        });

        it('should handle auto theme with dark preference', () => {
            vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
                matches: true, // prefer dark
                addEventListener: vi.fn(),
            }));

            modal = new PreferencesModal({ ...defaultConfig, theme: 'auto' }, 'en', defaultConsent);
            modal.show();

            const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
            expect(modalElement?.style.backgroundColor).toBe('#1f2937');

            vi.unstubAllGlobals();
        });
    });

    describe('categories', () => {
        it('should render all consent categories', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();

            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            expect(checkboxes.length).toBe(4); // necessary, analytics, marketing, preferences
        });

        it('should have necessary checkbox disabled', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();

            const necessaryCheckbox = document.querySelector('input[name="necessary"]') as HTMLInputElement;
            expect(necessaryCheckbox?.disabled).toBe(true);
        });

        it('should have necessary checkbox always checked', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();

            const necessaryCheckbox = document.querySelector('input[name="necessary"]') as HTMLInputElement;
            expect(necessaryCheckbox?.checked).toBe(true);
        });

        it('should reflect current consent in checkboxes', () => {
            const consentWithAnalytics: ConsentCategories = {
                necessary: true,
                analytics: true,
                marketing: false,
                preferences: true,
            };

            modal = new PreferencesModal(defaultConfig, 'en', consentWithAnalytics);
            modal.show();

            const analyticsCheckbox = document.querySelector('input[name="analytics"]') as HTMLInputElement;
            const preferencesCheckbox = document.querySelector('input[name="preferences"]') as HTMLInputElement;
            const marketingCheckbox = document.querySelector('input[name="marketing"]') as HTMLInputElement;

            expect(analyticsCheckbox?.checked).toBe(true);
            expect(preferencesCheckbox?.checked).toBe(true);
            expect(marketingCheckbox?.checked).toBe(false);
        });
    });

    describe('save functionality', () => {
        it('should call onSave with updated consent', async () => {
            const onSave = vi.fn();
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent, { onSave });
            modal.show();

            // Check analytics
            const analyticsCheckbox = document.querySelector('input[name="analytics"]') as HTMLInputElement;
            analyticsCheckbox.checked = true;

            // Click save
            const saveButton = document.querySelector('[data-action="save"]') as HTMLButtonElement;
            saveButton.click();

            expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
                necessary: true,
                analytics: true,
                marketing: false,
                preferences: false,
            }));
        });

        it('should hide modal after save', async () => {
            const onSave = vi.fn();
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent, { onSave });
            modal.show();

            const saveButton = document.querySelector('[data-action="save"]') as HTMLButtonElement;
            saveButton.click();

            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 300));

            const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
            expect(modalElement?.style.display).toBe('none');
        });
    });

    describe('close functionality', () => {
        it('should close modal on close button click', async () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();

            const closeButton = document.querySelector('[data-action="close"]') as HTMLButtonElement;
            closeButton.click();

            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 300));

            const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
            expect(modalElement?.style.display).toBe('none');
        });

        it('should close modal on overlay click', async () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();

            const overlay = document.querySelector('.cookiepot-overlay') as HTMLElement;
            overlay.click();

            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 300));

            const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
            expect(modalElement?.style.display).toBe('none');
        });

        it('should close modal on Escape key', async () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();

            const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            modalElement.dispatchEvent(escEvent);

            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 300));

            expect(modalElement?.style.display).toBe('none');
        });
    });

    describe('button hover effects', () => {
        it('should apply hover effect on save button', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();

            const saveButton = document.querySelector('[data-action="save"]') as HTMLButtonElement;

            const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true });
            saveButton.dispatchEvent(mouseEnterEvent);
            expect(saveButton.style.opacity).toBe('0.9');

            const mouseLeaveEvent = new MouseEvent('mouseleave', { bubbles: true });
            saveButton.dispatchEvent(mouseLeaveEvent);
            expect(saveButton.style.opacity).toBe('1');
        });
    });

    describe('i18n', () => {
        it('should use English translations by default', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();

            const title = document.querySelector('#cookiepot-modal-title');
            expect(title?.textContent?.trim()).toBe('Manage Preferences');
        });

        it('should use German translations', () => {
            modal = new PreferencesModal(defaultConfig, 'de', defaultConsent);
            modal.show();

            const title = document.querySelector('#cookiepot-modal-title');
            expect(title?.textContent?.trim()).toBe('Einstellungen verwalten');
        });

        it('should use Dutch translations', () => {
            modal = new PreferencesModal(defaultConfig, 'nl', defaultConsent);
            modal.show();

            const title = document.querySelector('#cookiepot-modal-title');
            expect(title?.textContent?.trim()).toBe('Voorkeuren beheren');
        });

        it('should use French translations', () => {
            modal = new PreferencesModal(defaultConfig, 'fr', defaultConsent);
            modal.show();

            const title = document.querySelector('#cookiepot-modal-title');
            expect(title?.textContent?.trim()).toBe('Gérer les préférences');
        });
    });

    describe('createPreferencesModal factory', () => {
        it('should create modal instance', () => {
            modal = createPreferencesModal(defaultConfig, 'en', defaultConsent);
            expect(modal).toBeInstanceOf(PreferencesModal);
        });

        it('should accept callbacks', () => {
            const onSave = vi.fn();
            modal = createPreferencesModal(defaultConfig, 'en', defaultConsent, { onSave });
            expect(modal).toBeInstanceOf(PreferencesModal);
        });
    });

    describe('animation', () => {
        it('should animate in on show', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();

            const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
            const overlay = document.querySelector('.cookiepot-overlay') as HTMLElement;

            expect(modalElement?.style.opacity).toBe('1');
            expect(overlay?.style.opacity).toBe('1');
        });

        it('should animate out on hide', async () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();
            modal.hide();

            const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
            const overlay = document.querySelector('.cookiepot-overlay') as HTMLElement;

            expect(modalElement?.style.opacity).toBe('0');
            expect(overlay?.style.opacity).toBe('0');
        });
    });

    describe('XSS prevention', () => {
        it('should escape HTML in translations', () => {
            modal = new PreferencesModal(defaultConfig, 'en', defaultConsent);
            modal.show();

            // The modal should render safe HTML
            const modalElement = document.querySelector('[role="dialog"]');
            expect(modalElement?.innerHTML).not.toContain('<script>');
        });
    });
});
