import type { ConsentState } from '../types';
import { ConsentStateSchema, STORAGE_KEYS } from '../types';

/**
 * Cookie options for storing consent
 */
export interface CookieOptions {
  domain?: string;
  maxAge?: number; // in seconds
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
}

/**
 * Get consent from storage (cookie first, then localStorage fallback)
 */
export function getConsentFromStorage(): ConsentState | null {
  try {
    // Try cookie first
    const cookieValue = getCookie(STORAGE_KEYS.CONSENT);
    if (cookieValue) {
      const parsed = JSON.parse(cookieValue);
      const validated = ConsentStateSchema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      }
    }

    // Fallback to localStorage
    if (typeof localStorage !== 'undefined') {
      const localValue = localStorage.getItem(STORAGE_KEYS.CONSENT);
      if (localValue) {
        const parsed = JSON.parse(localValue);
        const validated = ConsentStateSchema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
      }
    }
  } catch (error) {
    console.error('[CookiePot] Error reading consent from storage:', error);
  }

  return null;
}

/**
 * Save consent to storage (both cookie and localStorage)
 */
export function saveConsentToStorage(
  consent: ConsentState,
  options: CookieOptions = {}
): void {
  try {
    const value = JSON.stringify(consent);

    // Save to cookie
    setCookie(STORAGE_KEYS.CONSENT, value, {
      domain: options.domain,
      maxAge: options.maxAge ?? 365 * 24 * 60 * 60, // 1 year default
      sameSite: options.sameSite ?? 'Lax',
      secure: options.secure ?? true,
    });

    // Save to localStorage as backup
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CONSENT, value);
    }
  } catch (error) {
    console.error('[CookiePot] Error saving consent to storage:', error);
  }
}

/**
 * Clear consent from storage
 */
export function clearConsentFromStorage(cookieDomain?: string): void {
  try {
    // Clear cookie
    setCookie(STORAGE_KEYS.CONSENT, '', {
      domain: cookieDomain,
      maxAge: -1,
    });

    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CONSENT);
    }
  } catch (error) {
    console.error('[CookiePot] Error clearing consent from storage:', error);
  }
}

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    if (!cookie) continue;

    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * Set a cookie
 */
function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') {
    return;
  }

  let cookie = `${name}=${encodeURIComponent(value)}`;

  if (options.maxAge !== undefined) {
    cookie += `; Max-Age=${options.maxAge}`;
  }

  if (options.domain) {
    cookie += `; Domain=${options.domain}`;
  }

  cookie += `; Path=/`;

  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }

  if (options.secure) {
    cookie += `; Secure`;
  }

  document.cookie = cookie;
}
