# SDK Repository Setup Guide

This guide will help you set up the CookiePot Consent SDK as a separate public GitHub repository.

## Prerequisites

- GitHub account
- npm account (create at https://www.npmjs.com/signup)
- Git installed locally
- Node.js 18+ installed

## Step 1: Create npm Organization

1. Go to https://www.npmjs.com/
2. Click your profile → "Add Organization"
3. Create organization: `cookiepot-eu`
4. Choose "Free" plan (for public packages)

**Note:** We're using `cookiepot-eu` since `cookiepot` was already taken. This matches your domain `cookiepot.eu` perfectly!

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `consent-sdk`
3. Owner: `cookiepot` (or your organization)
4. Visibility: **Public** ✅
5. **DO NOT** initialize with README (we have one)
6. Click "Create repository"

## Step 3: Prepare SDK Directory

```bash
cd /home/matthew/BrightClouds/Development/cookiepot/packages/sdk

# Remove any local build artifacts
rm -rf node_modules dist

# Install fresh dependencies
npm install
```

## Step 4: Initialize Git Repository

```bash
cd /home/matthew/BrightClouds/Development/cookiepot/packages/sdk

# Initialize new repo
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial public release of CookiePot Consent SDK

- Core consent management functionality
- React integration with hooks and components
- Google Consent Mode v2 support
- Script auto-blocking
- Multi-language support (EN, NL, DE, FR, ES, IT, PT, PL)
- TypeScript support
- ~23KB gzipped bundle size

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Add remote
git remote add origin https://github.com/cookiepot-eu/consent-sdk.git

# Create main branch and push
git branch -M main
git push -u origin main
```

## Step 5: Configure GitHub Repository

### Add Repository Secrets

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add the following secrets:

**NPM_TOKEN:**
```bash
# On your local machine:
npm login
cat ~/.npmrc  # Find your npm token
```
Copy the token after `//registry.npmjs.org/:_authToken=`

Add to GitHub as secret: `NPM_TOKEN`

### Enable GitHub Pages (Optional)

1. Settings → Pages
2. Source: GitHub Actions
3. Can be used for docs later

### Configure Branch Protection (Recommended)

1. Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
4. Save changes

## Step 6: Test CI/CD

The CI workflow should run automatically on push. Check:

1. Go to Actions tab
2. You should see "CI" workflow running
3. Wait for it to complete (should be green ✅)

If it fails, check the logs and fix any issues.

## Step 7: Create First Release

```bash
# Make sure you're on main branch with latest changes
git checkout main
git pull

# Update version in package.json (or use npm version)
npm version 0.2.0 -m "Release v%s"

# Push with tags
git push --follow-tags

# Create GitHub release
gh release create v0.2.0 \
  --title "v0.2.0 - Initial Public Release" \
  --notes "See CHANGELOG.md for details"
```

This will automatically trigger the publish workflow and deploy to npm!

## Step 8: Verify npm Package

After the publish workflow completes:

1. Check npm: https://www.npmjs.com/package/@cookiepot-eu/consent
2. Test installation:
```bash
mkdir test-install
cd test-install
npm init -y
npm install @cookiepot-eu/consent
```

## Step 9: Update Main Project

In your private `cookiepot` repository:

```bash
cd /home/matthew/BrightClouds/Development/cookiepot

# Remove the SDK directory
rm -rf packages/sdk

# Update any references to point to the new repo
# (if you have workspace configs, remove SDK from there)
```

Optional: Add SDK as a git submodule if you want to keep it linked:
```bash
git submodule add https://github.com/cookiepot-eu/consent-sdk.git packages/sdk
```

## Step 10: Announce 🎉

Once published:

1. Update https://cookiepot.eu to link to the SDK
2. Tweet/post about it
3. Submit to awesome lists
4. Share in relevant communities

## Common Issues

### "Organization not found" on npm publish

Create the npm organization first at https://www.npmjs.com/org/create

### "Permission denied" on GitHub push

Make sure you have write access to the repository. Use personal access token or SSH key.

### CI workflow fails

Check that:
- Node.js version is correct
- All dependencies are in package.json
- Tests pass locally with `npm test`

### npm publish fails with 403

Check that:
- NPM_TOKEN secret is set correctly
- Token has publish permissions
- Organization/package name is available

## Maintenance

### Publishing New Versions

```bash
# For patches (0.2.0 -> 0.2.1)
npm version patch
git push --follow-tags
gh release create v0.2.1

# For minor (0.2.0 -> 0.3.0)
npm version minor
git push --follow-tags
gh release create v0.3.0

# For major (0.2.0 -> 1.0.0)
npm version major
git push --follow-tags
gh release create v1.0.0
```

The publish workflow will run automatically when you create a release.

### Updating Documentation

1. Edit README.md
2. Commit and push
3. GitHub Pages will update automatically (if enabled)

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)

## Support

Questions? Open an issue or email info@cookiepot.eu
