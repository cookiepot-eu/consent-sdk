import type { BannerPosition } from '../types';

/**
 * Default API Configuration
 */
export const DEFAULT_API_BASE_URL = 'https://api.cookiepot.eu/v1';
export const DEFAULT_API_TIMEOUT = 5000;

/**
 * Default Cookie Configuration
 */
export const DEFAULT_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Theme Color Schemes
 */
export const THEME_COLORS = {
  light: {
    primary: '#2563eb',
    background: '#ffffff',
    text: '#1f2937',
    border: '#e5e7eb',
    buttonText: '#ffffff',
  },
  dark: {
    primary: '#3b82f6',
    background: '#1f2937',
    text: '#f9fafb',
    border: '#374151',
    buttonText: '#ffffff',
  },
} as const;

/**
 * Banner Position CSS Mappings
 */
export const POSITION_STYLES: Record<BannerPosition, Partial<CSSStyleDeclaration>> = {
  'top-left': {
    top: '20px',
    left: '20px',
    right: 'auto',
    bottom: 'auto',
  },
  'top-center': {
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    right: 'auto',
    bottom: 'auto',
  },
  'top-right': {
    top: '20px',
    right: '20px',
    left: 'auto',
    bottom: 'auto',
  },
  'bottom-left': {
    bottom: '20px',
    left: '20px',
    right: 'auto',
    top: 'auto',
  },
  'bottom-center': {
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    right: 'auto',
    top: 'auto',
  },
  'bottom-right': {
    bottom: '20px',
    right: '20px',
    left: 'auto',
    top: 'auto',
  },
};

/**
 * Default Banner Dimensions
 */
export const BANNER_DIMENSIONS = {
  maxWidth: '480px',
  padding: '24px',
  borderRadius: '12px',
  gap: '16px',
} as const;

/**
 * Animation Durations (ms)
 */
export const ANIMATION_DURATION = {
  fadeIn: 300,
  fadeOut: 200,
  slide: 300,
} as const;

/**
 * Z-Index Values
 */
export const Z_INDEX = {
  banner: 999999,
  modal: 1000000,
  overlay: 999998,
} as const;

/**
 * CSS Class Names
 */
export const CSS_CLASSES = {
  banner: 'cookiepot-banner',
  modal: 'cookiepot-modal',
  overlay: 'cookiepot-overlay',
  button: 'cookiepot-button',
  buttonPrimary: 'cookiepot-button-primary',
  buttonSecondary: 'cookiepot-button-secondary',
} as const;

/**
 * ARIA Labels
 */
export const ARIA_LABELS = {
  banner: 'Cookie consent banner',
  acceptAll: 'Accept all cookies',
  rejectAll: 'Reject all cookies',
  savePreferences: 'Save cookie preferences',
  closeModal: 'Close preferences modal',
} as const;
