import React, { useEffect } from 'react';
import { useCookiePot } from './hooks';
import type { BannerPosition, BannerTheme } from '../types';

/**
 * Consent Banner Component Props
 */
export interface ConsentBannerProps {
  /**
   * Banner position on the screen
   * @default 'bottom-center'
   */
  position?: BannerPosition;

  /**
   * Banner theme (light, dark, or auto)
   * @default 'light'
   */
  theme?: BannerTheme;

  /**
   * Whether to show the "Reject All" button
   * @default true
   */
  showRejectAll?: boolean;

  /**
   * Auto-show banner if no consent is stored
   * @default true
   */
  autoShow?: boolean;
}

/**
 * Consent Banner Component
 *
 * Renders the cookie consent banner using the SDK.
 * The banner will automatically show if no consent is stored (configurable).
 *
 * @example
 * ```tsx
 * <ConsentBanner position="bottom-center" theme="light" />
 * ```
 */
export function ConsentBanner({
  autoShow = true,
}: ConsentBannerProps) {
  const sdk = useCookiePot();

  useEffect(() => {
    if (autoShow) {
      // Check if consent is already stored
      const consent = sdk.getConsent();
      const hasStoredConsent = consent.analytics || consent.marketing || consent.preferences;

      // Show banner if no consent is stored
      if (!hasStoredConsent) {
        sdk.showBanner();
      }
    }
  }, [sdk, autoShow]);

  // This component doesn't render anything itself
  // The banner is rendered by the SDK
  return null;
}

/**
 * Preferences Button Component Props
 */
export interface PreferencesButtonProps {
  /**
   * Button content
   */
  children?: React.ReactNode;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Additional inline styles
   */
  style?: React.CSSProperties;
}

/**
 * Preferences Button Component
 *
 * A button that opens the cookie preferences modal when clicked.
 *
 * @example
 * ```tsx
 * <PreferencesButton>
 *   Manage Cookie Preferences
 * </PreferencesButton>
 * ```
 */
export function PreferencesButton({
  children = 'Cookie Preferences',
  className,
  style,
}: PreferencesButtonProps) {
  const sdk = useCookiePot();

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={() => sdk.showPreferences()}
    >
      {children}
    </button>
  );
}

/**
 * Accept All Button Component Props
 */
export interface AcceptAllButtonProps {
  /**
   * Button content
   */
  children?: React.ReactNode;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Additional inline styles
   */
  style?: React.CSSProperties;

  /**
   * Callback fired after accepting all cookies
   */
  onAccept?: () => void;
}

/**
 * Accept All Button Component
 *
 * A button that accepts all cookie categories when clicked.
 *
 * @example
 * ```tsx
 * <AcceptAllButton>Accept All Cookies</AcceptAllButton>
 * ```
 */
export function AcceptAllButton({
  children = 'Accept All',
  className,
  style,
  onAccept,
}: AcceptAllButtonProps) {
  const sdk = useCookiePot();

  const handleClick = async () => {
    await sdk.acceptAll();
    onAccept?.();
  };

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

/**
 * Reject All Button Component Props
 */
export interface RejectAllButtonProps {
  /**
   * Button content
   */
  children?: React.ReactNode;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Additional inline styles
   */
  style?: React.CSSProperties;

  /**
   * Callback fired after rejecting all cookies
   */
  onReject?: () => void;
}

/**
 * Reject All Button Component
 *
 * A button that rejects all non-necessary cookie categories when clicked.
 *
 * @example
 * ```tsx
 * <RejectAllButton>Reject All</RejectAllButton>
 * ```
 */
export function RejectAllButton({
  children = 'Reject All',
  className,
  style,
  onReject,
}: RejectAllButtonProps) {
  const sdk = useCookiePot();

  const handleClick = async () => {
    await sdk.rejectAll();
    onReject?.();
  };

  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}
