import type { ConsentCategories, ScriptPattern, ConsentCategory } from '../types';

/**
 * Script Auto-Blocker
 *
 * Intercepts script loading and blocks scripts until consent is granted
 * Uses MutationObserver to watch for new script tags
 */

interface BlockedScript {
  element: HTMLScriptElement;
  category: ConsentCategory;
  src?: string;
  content?: string;
}

export class ScriptAutoBlocker {
  private patterns: ScriptPattern[];
  private blockedScripts: BlockedScript[] = [];
  private observer: MutationObserver | null = null;
  private consent: ConsentCategories;
  private enabled: boolean;

  constructor(
    patterns: ScriptPattern[],
    initialConsent: ConsentCategories,
    enabled: boolean = true
  ) {
    this.patterns = patterns;
    this.consent = initialConsent;
    this.enabled = enabled;
  }

  /**
   * Start observing the DOM for script additions
   */
  start(): void {
    if (!this.enabled || typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
      return;
    }

    // Stop existing observer if any
    this.stop();

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'SCRIPT') {
              this.handleScriptTag(node as HTMLScriptElement);
            }
          });
        }
      }
    });

    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    console.log('[CookiePot] Script auto-blocker started');
  }

  /**
   * Stop observing the DOM
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      console.log('[CookiePot] Script auto-blocker stopped');
    }
  }

  /**
   * Handle a new script tag
   */
  private handleScriptTag(script: HTMLScriptElement): void {
    // Skip if already processed
    if (script.hasAttribute('data-cookiepot-processed')) {
      return;
    }

    const category = this.matchScriptToCategory(script);

    if (category && !this.hasConsent(category)) {
      // Block the script
      this.blockScript(script, category);
    }

    // Mark as processed
    script.setAttribute('data-cookiepot-processed', 'true');
  }

  /**
   * Match a script to a consent category based on patterns
   */
  private matchScriptToCategory(script: HTMLScriptElement): ConsentCategory | null {
    const src = script.src;
    const content = script.textContent || script.innerHTML;

    for (const pattern of this.patterns) {
      const matcher = typeof pattern.pattern === 'string'
        ? pattern.pattern
        : pattern.pattern.source;

      // Check src attribute
      if (src && this.matchesPattern(src, matcher)) {
        return pattern.category;
      }

      // Check inline script content
      if (content && this.matchesPattern(content, matcher)) {
        return pattern.category;
      }
    }

    return null;
  }

  /**
   * Check if a string matches a pattern
   */
  private matchesPattern(text: string, pattern: string): boolean {
    try {
      const regex = new RegExp(pattern, 'i');
      return regex.test(text);
    } catch {
      // Fallback to simple string matching
      return text.toLowerCase().includes(pattern.toLowerCase());
    }
  }

  /**
   * Check if consent is granted for a category
   */
  private hasConsent(category: ConsentCategory): boolean {
    return this.consent[category] === true;
  }

  /**
   * Block a script from executing
   */
  private blockScript(script: HTMLScriptElement, category: ConsentCategory): void {
    // Store original script
    const blockedScript: BlockedScript = {
      element: script,
      category,
      src: script.src || undefined,
      content: script.textContent || undefined,
    };

    this.blockedScripts.push(blockedScript);

    // Prevent execution by changing type
    script.type = 'text/plain';
    script.setAttribute('data-cookiepot-blocked', category);

    // Remove src to prevent loading
    if (script.src) {
      script.removeAttribute('src');
    }

    console.log(`[CookiePot] Blocked ${category} script:`, blockedScript.src || 'inline');
  }

  /**
   * Update consent and unblock scripts if consent is granted
   */
  updateConsent(newConsent: ConsentCategories): void {
    const previousConsent = { ...this.consent };
    this.consent = newConsent;

    // Check which categories got newly granted consent
    const changedCategories: ConsentCategory[] = [];

    for (const category of ['analytics', 'marketing', 'preferences'] as ConsentCategory[]) {
      if (!previousConsent[category] && newConsent[category]) {
        changedCategories.push(category);
      }
    }

    // Unblock scripts for newly granted categories
    if (changedCategories.length > 0) {
      this.unblockScripts(changedCategories);
    }
  }

  /**
   * Unblock scripts for given categories
   */
  private unblockScripts(categories: ConsentCategory[]): void {
    const scriptsToUnblock = this.blockedScripts.filter((script) =>
      categories.includes(script.category)
    );

    for (const blockedScript of scriptsToUnblock) {
      this.executeBlockedScript(blockedScript);
    }

    // Remove unblocked scripts from the list
    this.blockedScripts = this.blockedScripts.filter(
      (script) => !categories.includes(script.category)
    );

    console.log(`[CookiePot] Unblocked ${scriptsToUnblock.length} scripts for:`, categories);
  }

  /**
   * Execute a previously blocked script
   */
  private executeBlockedScript(blockedScript: BlockedScript): void {
    const newScript = document.createElement('script');

    // Copy attributes
    Array.from(blockedScript.element.attributes).forEach((attr) => {
      if (attr.name !== 'data-cookiepot-blocked') {
        newScript.setAttribute(attr.name, attr.value);
      }
    });

    // Restore type
    newScript.type = 'text/javascript';

    // Restore src or content
    if (blockedScript.src) {
      newScript.src = blockedScript.src;
    } else if (blockedScript.content) {
      newScript.textContent = blockedScript.content;
    }

    // Mark as processed
    newScript.setAttribute('data-cookiepot-processed', 'true');
    newScript.setAttribute('data-cookiepot-unblocked', 'true');

    // Replace old script with new one
    if (blockedScript.element.parentNode) {
      blockedScript.element.parentNode.replaceChild(newScript, blockedScript.element);
    }
  }

  /**
   * Get list of currently blocked scripts
   */
  getBlockedScripts(): Array<{ src?: string; category: ConsentCategory }> {
    return this.blockedScripts.map((script) => ({
      src: script.src,
      category: script.category,
    }));
  }

  /**
   * Enable auto-blocking
   */
  enable(): void {
    this.enabled = true;
    this.start();
  }

  /**
   * Disable auto-blocking
   */
  disable(): void {
    this.enabled = false;
    this.stop();
  }

  /**
   * Check if auto-blocking is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

/**
 * Create a script auto-blocker instance
 */
export function createScriptAutoBlocker(
  patterns: ScriptPattern[],
  initialConsent: ConsentCategories,
  enabled: boolean
): ScriptAutoBlocker {
  return new ScriptAutoBlocker(patterns, initialConsent, enabled);
}
