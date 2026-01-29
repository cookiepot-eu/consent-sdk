import { z } from 'zod';

/**
 * Consent Categories
 */
export interface ConsentCategories {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export type ConsentCategory = keyof ConsentCategories;

export const ConsentCategoriesSchema = z.object({
  necessary: z.literal(true),
  analytics: z.boolean(),
  marketing: z.boolean(),
  preferences: z.boolean(),
});

/**
 * Consent Metadata
 */
export interface ConsentMetadata {
  bannerVersion: string;
  interactionType: 'accept_all' | 'reject_all' | 'accept_selected' | 'save_preferences';
  language: string;
}

export const ConsentMetadataSchema = z.object({
  bannerVersion: z.string().max(32),
  interactionType: z.enum(['accept_all', 'reject_all', 'accept_selected', 'save_preferences']),
  language: z.string().length(2),
}).optional();

/**
 * API Request/Response Types
 */
export interface SubmitConsentRequest {
  visitorId: string;
  sessionId: string;
  categories: ConsentCategories;
  metadata?: ConsentMetadata;
}

export interface SubmitConsentResponse {
  consentId: string;
  timestamp: string;
  categories: ConsentCategories;
}

export interface ConsentHistoryItem {
  consentId: string;
  timestamp: string;
  categories: ConsentCategories;
}

export interface GetConsentResponse {
  visitorId: string;
  latestConsent: ConsentHistoryItem | null;
  consentHistory: ConsentHistoryItem[];
}

/**
 * Banner Configuration
 */
export type BannerPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type BannerTheme = 'light' | 'dark' | 'auto';

export interface BannerText {
  title?: string;
  description?: string;
  acceptAll?: string;
  rejectAll?: string;
  savePreferences?: string;
  managePreferences?: string;
}

export interface BannerStyling {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  fontFamily?: string;
}

export interface BannerConfig {
  position?: BannerPosition;
  theme?: BannerTheme;
  text?: BannerText;
  styling?: BannerStyling;
  showRejectAll?: boolean;
}

/**
 * Auto-blocking Configuration
 */
export interface ScriptPattern {
  pattern: string | RegExp;
  category: ConsentCategory;
}

export interface AutoBlockConfig {
  enabled: boolean;
  scripts: ScriptPattern[];
}

/**
 * SDK Configuration
 */
export interface CookiePotConfig {
  apiKey: string;
  domain: string;
  apiBaseUrl?: string;
  banner?: BannerConfig;
  autoBlock?: AutoBlockConfig;
  language?: string;
  enableGoogleConsentMode?: boolean;
  cookieDomain?: string;
  cookieMaxAge?: number;
  onConsentChange?: (categories: ConsentCategories) => void;
}

export const CookiePotConfigSchema = z.object({
  apiKey: z.string().min(1),
  domain: z.string().min(1),
  apiBaseUrl: z.string().url().optional(),
  banner: z.object({
    position: z.enum(['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']).optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    text: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      acceptAll: z.string().optional(),
      rejectAll: z.string().optional(),
      savePreferences: z.string().optional(),
      managePreferences: z.string().optional(),
    }).optional(),
    styling: z.object({
      primaryColor: z.string().optional(),
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
      borderRadius: z.string().optional(),
      fontFamily: z.string().optional(),
    }).optional(),
    showRejectAll: z.boolean().optional(),
  }).optional(),
  autoBlock: z.object({
    enabled: z.boolean(),
    scripts: z.array(z.object({
      pattern: z.union([z.string(), z.instanceof(RegExp)]),
      category: z.enum(['necessary', 'analytics', 'marketing', 'preferences']),
    })),
  }).optional(),
  language: z.string().length(2).optional(),
  enableGoogleConsentMode: z.boolean().optional(),
  cookieDomain: z.string().optional(),
  cookieMaxAge: z.number().positive().optional(),
  onConsentChange: z.function().optional(),
});

/**
 * Internal State
 */
export interface ConsentState {
  visitorId: string;
  sessionId: string;
  categories: ConsentCategories;
  timestamp?: string;
}

export const ConsentStateSchema = z.object({
  visitorId: z.string().min(1).max(128),
  sessionId: z.string().min(1).max(128),
  categories: ConsentCategoriesSchema,
  timestamp: z.string().optional(),
});

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  CONSENT: 'cookiepot_consent',
  VISITOR_ID: 'cookiepot_visitor_id',
  SESSION_ID: 'cookiepot_session_id',
} as const;

/**
 * Events
 */
export type CookiePotEvent =
  | 'consent:change'
  | 'banner:show'
  | 'banner:hide'
  | 'banner:accept_all'
  | 'banner:reject_all'
  | 'banner:save_preferences';

/**
 * API Error Response
 */
export interface APIError {
  error: {
    code: string;
    message: string;
  };
}
