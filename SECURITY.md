# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please email security concerns to: **info@cookiepot.eu**

Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You should receive a response within 48 hours. If the issue is confirmed, we will:

1. Release a patch as soon as possible
2. Credit you in the release notes (unless you prefer to remain anonymous)
3. Notify users through our security advisory system

## Security Best Practices

When using the CookiePot SDK:

1. **Keep the SDK updated** - We regularly release security patches
2. **Protect your API key** - Never commit API keys to version control
3. **Use HTTPS** - Always serve your website over HTTPS
4. **Validate domains** - Only use approved domains in your CookiePot dashboard
5. **Review consent data** - Regularly audit what data is being collected

## Known Security Considerations

### API Key Exposure

The CookiePot SDK is a client-side library, which means your API key is visible in the browser. This is by design and safe because:

- API keys are scoped to specific domains
- Keys have rate limiting
- Keys cannot modify account settings
- Keys cannot access other accounts' data

However, you should still:
- Only use keys in production domains you control
- Configure allowed domains in your dashboard
- Rotate keys if compromised

### Cross-Site Scripting (XSS)

The SDK sanitizes all user-provided configuration to prevent XSS. However:

- Always validate any data you pass to the SDK
- Don't construct config from untrusted sources
- Follow your framework's XSS prevention guidelines

### Third-Party Scripts

When using auto-blocking features:

- Review script patterns carefully
- Only block scripts you control or trust
- Test thoroughly to avoid breaking functionality

## Contact

For security concerns: info@cookiepot.eu
For general questions: https://cookiepot.eu
