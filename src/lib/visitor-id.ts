import { STORAGE_KEYS } from '../types';

/**
 * Generate a UUID v4
 */
export function generateVisitorId(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback to manual UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create a persistent visitor ID
 * Priority: localStorage → cookie fallback
 */
export function getOrCreateVisitorId(): string {
  try {
    // Try localStorage first
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
      if (stored && isValidUUID(stored)) {
        // Also save to cookie for cross-tab consistency
        saveToCookie(stored);
        return stored;
      }
    }

    // Try cookie fallback
    const cookieValue = getCookie(STORAGE_KEYS.VISITOR_ID);
    if (cookieValue && isValidUUID(cookieValue)) {
      // Also save to localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.VISITOR_ID, cookieValue);
      }
      return cookieValue;
    }

    // Generate new visitor ID
    const newId = generateVisitorId();

    // Save to both localStorage and cookie
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.VISITOR_ID, newId);
    }
    saveToCookie(newId);

    return newId;
  } catch (error) {
    console.error('[CookiePot] Error getting/creating visitor ID:', error);
    // Return a new ID as fallback
    return generateVisitorId();
  }
}

/**
 * Generate a session ID
 * Session ID is stored in sessionStorage and generated per session
 */
export function getOrCreateSessionId(): string {
  try {
    if (typeof sessionStorage !== 'undefined') {
      const stored = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
      if (stored && isValidUUID(stored)) {
        return stored;
      }

      const newId = generateVisitorId(); // Use same UUID generator
      sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, newId);
      return newId;
    }
  } catch (error) {
    console.error('[CookiePot] Error getting/creating session ID:', error);
  }

  // Fallback to a new ID
  return generateVisitorId();
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Get cookie value
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
 * Save visitor ID to cookie (1 year expiration)
 */
function saveToCookie(visitorId: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const maxAge = 365 * 24 * 60 * 60; // 1 year
  const cookie = `${STORAGE_KEYS.VISITOR_ID}=${encodeURIComponent(visitorId)}; Max-Age=${maxAge}; Path=/; SameSite=Lax; Secure`;
  document.cookie = cookie;
}
