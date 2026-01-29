# 🍪 CookiePot Consent SDK

[![npm version](https://img.shields.io/npm/v/@cookiepot-eu/consent.svg)](https://www.npmjs.com/package/@cookiepot-eu/consent)
[![CI](https://github.com/cookiepot-eu/consent-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/cookiepot-eu/consent-sdk/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@cookiepot-eu/consent)](https://bundlephobia.com/package/@cookiepot-eu/consent)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

A lightweight, type-safe consent management SDK for web applications. Built with TypeScript, fully compliant with GDPR, CCPA, and other privacy regulations.

**Bundle Size:** ~23KB gzipped | **Languages:** 8 | **Frameworks:** Vanilla JS + React

## ✨ Features

- ✅ Lightweight & fast (~23KB gzipped)
- ✅ Full TypeScript support
- ✅ Multi-language (EN, NL, DE, FR, ES, IT, PT, PL)
- ✅ Google Consent Mode v2
- ✅ Script auto-blocking
- ✅ Customizable theming
- ✅ Offline-first design
- ✅ WCAG 2.1 AA accessible

## 📦 Installation

```bash
npm install @cookiepot-eu/consent
```

## 🚀 Quick Start

### Vanilla JavaScript

```typescript
import { CookiePot } from '@cookiepot-eu/consent';

const sdk = CookiePot.init({
  apiKey: 'your-api-key',
  domain: 'example.com',
});

// Listen for consent changes
sdk.on('consent:change', (consent) => {
  console.log('Consent updated:', consent);
});

// Show banner
sdk.showBanner();
```

### React

```tsx
import { CookiePotProvider, ConsentBanner, useConsent } from '@cookiepot-eu/consent/react';

function App() {
  return (
    <CookiePotProvider config={{ apiKey: 'your-key', domain: 'example.com' }}>
      <ConsentBanner />
      <YourApp />
    </CookiePotProvider>
  );
}

function YourApp() {
  const consent = useConsent();
  return <div>Analytics: {consent.analytics ? 'On' : 'Off'}</div>;
}
```

## ⚙️ Configuration

```typescript
CookiePot.init({
  apiKey: 'your-api-key',          // Required
  domain: 'example.com',            // Required
  language: 'en',                   // Optional: auto-detected
  enableGoogleConsentMode: true,    // Optional: Enable GCM v2
  banner: {
    position: 'bottom-center',      // Position on screen
    theme: 'light',                 // light | dark | auto
    showRejectAll: true,            // Show reject button
  },
  autoBlock: {                      // Script auto-blocking
    enabled: true,
    scripts: [
      { pattern: 'google-analytics.com', category: 'analytics' },
      { pattern: 'facebook.net', category: 'marketing' },
    ],
  },
});
```

## 📚 API Reference

### Core Methods

- `CookiePot.init(config)` - Initialize SDK
- `getConsent()` - Get current consent
- `setConsent(categories)` - Update consent
- `acceptAll()` - Accept all categories
- `rejectAll()` - Reject all except necessary
- `resetConsent()` - Clear all consent data
- `showBanner()` - Display consent banner
- `showPreferences()` - Show preferences modal
- `on(event, handler)` - Listen to events
- `off(event, handler)` - Remove event listener

### Events

- `consent:change` - Consent updated
- `banner:show` - Banner displayed
- `banner:hide` - Banner hidden
- `banner:accept_all` - Accept all clicked
- `banner:reject_all` - Reject all clicked

### React Hooks

- `useCookiePot()` - Get SDK instance
- `useConsent()` - Get reactive consent state
- `useHasConsent(category)` - Check specific category

### React Components

- `<CookiePotProvider>` - Context provider
- `<ConsentBanner>` - Consent banner
- `<PreferencesButton>` - Preferences button
- `<AcceptAllButton>` - Accept all button
- `<RejectAllButton>` - Reject all button

## 🎨 Customization

### Custom Text

```typescript
CookiePot.init({
  apiKey: 'your-key',
  domain: 'example.com',
  banner: {
    text: {
      title: 'We use cookies',
      description: 'Custom description...',
      acceptAll: 'Accept',
      rejectAll: 'Decline',
    },
  },
});
```

### Custom Styling

```typescript
CookiePot.init({
  apiKey: 'your-key',
  domain: 'example.com',
  banner: {
    styling: {
      primaryColor: '#2563eb',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      borderRadius: '12px',
    },
  },
});
```

## 🌍 Supported Languages

English • Dutch • German • French • Spanish • Italian • Portuguese • Polish

## 🔒 Privacy Features

### Google Consent Mode v2

Automatically integrates with Google Analytics:

```typescript
CookiePot.init({
  apiKey: 'your-key',
  domain: 'example.com',
  enableGoogleConsentMode: true,
});
```

### Script Auto-Blocking

Prevents scripts from loading until consent is granted:

```typescript
CookiePot.init({
  apiKey: 'your-key',
  domain: 'example.com',
  autoBlock: {
    enabled: true,
    scripts: [
      { pattern: 'google-analytics.com', category: 'analytics' },
      { pattern: /hotjar/, category: 'analytics' },
    ],
  },
});
```

## 📖 Examples

### Conditional Script Loading

```typescript
const sdk = CookiePot.init({ apiKey: 'your-api-key', domain: 'example.com' });

sdk.on('consent:change', (consent) => {
  if (consent.analytics && !window.gtag) {
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_ID';
    document.head.appendChild(script);
  }
});
```

### React with Conditional Rendering

```tsx
import { useHasConsent } from '@cookiepot-eu/consent/react';

function AnalyticsWrapper() {
  const hasConsent = useHasConsent('analytics');
  return hasConsent ? <GoogleAnalytics /> : null;
}
```

## 🌐 Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- iOS Safari: Latest 2 versions

## 📝 TypeScript

Full TypeScript support included:

```typescript
import type {
  CookiePotConfig,
  ConsentCategories,
  BannerConfig,
} from '@cookiepot-eu/consent';
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

- 🐛 **Bug reports:** [Open an issue](https://github.com/cookiepot-eu/consent-sdk/issues/new?template=bug_report.md)
- 💡 **Feature requests:** [Open an issue](https://github.com/cookiepot-eu/consent-sdk/issues/new?template=feature_request.md)
- 🔧 **Pull requests:** See [Contributing Guide](CONTRIBUTING.md)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔒 Security

For security concerns, please review our [Security Policy](SECURITY.md).

## 🤝 Support

- 📧 Email: info@cookiepot.eu
- 🌐 Website: https://cookiepot.eu
- 📖 Documentation: https://cookiepot.eu/docs
- 🐛 Issues: https://github.com/cookiepot-eu/consent-sdk/issues

## ⭐ Show Your Support

If you find this SDK helpful, please consider:
- Giving it a ⭐ on GitHub
- Sharing it with others
- [Contributing](CONTRIBUTING.md) to the project

---

Made with ❤️ by [BrightClouds](https://brightclouds.be)
