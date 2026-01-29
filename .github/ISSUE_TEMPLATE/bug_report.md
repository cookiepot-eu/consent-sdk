---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

## Bug Description

A clear and concise description of what the bug is.

## Steps to Reproduce

1. Initialize SDK with config: `...`
2. Call method: `...`
3. See error

## Expected Behavior

What you expected to happen.

## Actual Behavior

What actually happened.

## Code Sample

```typescript
// Minimal code to reproduce the issue
import { CookiePot } from '@cookiepot/consent';

const sdk = CookiePot.init({
  apiKey: 'xxx',
  domain: 'example.com'
});
```

## Environment

- SDK Version: [e.g. 0.2.0]
- Browser: [e.g. Chrome 120]
- OS: [e.g. macOS 14]
- Framework: [e.g. React 18, Vanilla JS]

## Additional Context

Add any other context about the problem here (screenshots, logs, etc).

## Checklist

- [ ] I've checked existing issues for duplicates
- [ ] I've tested with the latest SDK version
- [ ] I've included a minimal reproduction
