# Contributing to CookiePot Consent SDK

Thank you for your interest in contributing! This document provides guidelines for contributing to the CookiePot Consent SDK.

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to info@cookiepot.eu.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Browser/environment details**
- **Code samples** (if applicable)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear use case**
- **Why this would be useful**
- **Possible implementation approach**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. Make your changes
3. Add tests if applicable
4. Ensure tests pass: `npm test`
5. Ensure linting passes: `npm run lint`
6. Ensure TypeScript compiles: `npm run typecheck`
7. Update documentation if needed
8. Submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/cookiepot-consent-sdk.git
cd consent-sdk

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Run tests with UI
npm run test:ui

# Run local dev server
npm run serve
```

## Project Structure

```
src/
├── index.ts              # Main entry point
├── client.ts             # Core SDK client
├── types.ts              # TypeScript types
├── lib/                  # Core functionality
│   ├── api.ts           # API client
│   ├── banner.ts        # Consent banner
│   ├── storage.ts       # Local storage
│   ├── i18n.ts          # Translations
│   └── ...
└── react/               # React integration
    ├── index.tsx
    ├── hooks.ts
    └── components.tsx
```

## Coding Guidelines

### TypeScript

- Use TypeScript for all code
- Avoid `any` types
- Export types for public APIs
- Use strict mode

### Code Style

- Use ESLint configuration provided
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas in multi-line structures

### Testing

- Write tests for new features
- Use Vitest for testing
- Aim for good coverage of critical paths
- Test both happy paths and error cases

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add Portuguese translation
fix: handle null consent state
docs: update installation instructions
test: add tests for banner positioning
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Adding Translations

To add a new language:

1. Open `src/lib/i18n.ts`
2. Add your translation to the `translations` object
3. Follow the existing structure
4. Test with `language: 'xx'` in config
5. Update README with new language

## Support

**Note:** This is an open-source project. For commercial support or feature requests, please contact info@cookiepot.eu or visit https://cookiepot.eu.

GitHub issues are for:
- ✅ Bug reports
- ✅ Feature suggestions
- ✅ Documentation improvements

GitHub issues are NOT for:
- ❌ General usage questions (see docs)
- ❌ Account/billing issues (contact support)
- ❌ Security vulnerabilities (see SECURITY.md)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
