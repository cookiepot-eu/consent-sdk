import React, { createContext, useContext, useEffect, useState } from 'react';
import { CookiePot } from '../client';
import type { CookiePotConfig, ConsentCategories } from '../types';

/**
 * CookiePot Context
 */
interface CookiePotContextValue {
  sdk: CookiePot;
  consent: ConsentCategories;
}

const CookiePotContext = createContext<CookiePotContextValue | null>(null);

/**
 * CookiePot Provider Props
 */
export interface CookiePotProviderProps {
  config: CookiePotConfig;
  children: React.ReactNode;
}

/**
 * CookiePot Provider Component
 *
 * Initializes the SDK and provides it to child components via context.
 *
 * @example
 * ```tsx
 * <CookiePotProvider config={{ apiKey: 'your-key', domain: 'example.com' }}>
 *   <App />
 * </CookiePotProvider>
 * ```
 */
export function CookiePotProvider({ config, children }: CookiePotProviderProps) {
  const [sdk] = useState(() => CookiePot.init(config));
  const [consent, setConsent] = useState<ConsentCategories>(() => sdk.getConsent());

  useEffect(() => {
    // Sync consent state with SDK changes
    const handleConsentChange = (newConsent: unknown) => {
      setConsent(newConsent as ConsentCategories);
    };

    sdk.on('consent:change', handleConsentChange);

    return () => {
      sdk.off('consent:change', handleConsentChange);
    };
  }, [sdk]);

  return (
    <CookiePotContext.Provider value={{ sdk, consent }}>
      {children}
    </CookiePotContext.Provider>
  );
}

/**
 * Hook to access the CookiePot context
 * @internal
 */
export function useCookiePotContext(): CookiePotContextValue {
  const context = useContext(CookiePotContext);

  if (!context) {
    throw new Error('useCookiePotContext must be used within CookiePotProvider');
  }

  return context;
}
