# PWA Implementation Guide

## Overview

This document describes the Progressive Web App (PWA) implementation for Gesundes Leben, based on recommendations from `PACKAGE_ANALYSIS.md`.

## Implemented Features

### 1. PWA Integration (@vite-pwa/astro)

**Installation:**
```bash
bun add @vite-pwa/astro -D
```

**Configuration** (`astro.config.ts`):
- **Auto-update service worker** for seamless updates
- **Offline support** with intelligent caching strategies
- **App manifest** for installability on devices
- **Runtime caching** for fonts and images

### 2. Bundle Analysis (rollup-plugin-visualizer)

**Installation:**
```bash
bun add rollup-plugin-visualizer -D
```

**Configuration** (`astro.config.ts`):
- Generates interactive bundle analysis at `dist/stats.html`
- Shows gzip and brotli compressed sizes
- Helps identify large dependencies and optimization opportunities

**Usage:**
```bash
bun run build
# Open dist/stats.html in browser to view bundle analysis
```

### 3. Dependency Organization

**Moved to devDependencies:**
- `axios` - XML conversion scripts only
- `commander` - CLI tools only
- `turndown` - WordPress/XML to MDX conversion only
- `turndown-plugin-gfm` - Markdown conversion only
- `uuid` - Frontmatter ID generation only
- `xml2js` - XML parsing in scripts only

**Impact:**
- Smaller production builds
- Clearer dependency purpose
- Better Docker image optimization

### 4. New NPM Scripts

**Security:**
- `security:fix` - Automatic security vulnerability fixes

**Performance monitoring scripts** were already present:
- `perf` - Full performance check (build + budget + analyze)
- `perf:watch` - Watch mode with type checking
- `perf:ci` - CI/CD performance testing
- `deps:check` - Check for outdated dependencies
- `deps:update` - Update all dependencies to latest
- `deps:audit` - Security audit
- `security:audit` - Alias for security audit

## PWA Configuration Details

### Service Worker Strategy

**Register Type:** `autoUpdate`
- Automatically updates service worker when new version is deployed
- Users get latest version without manual intervention

### Caching Strategies

**Font Caching:**
- Google Fonts: 365-day cache
- Strategy: CacheFirst (network fallback)

**Image Caching:**
- All image formats (png, jpg, jpeg, svg, gif, webp, avif)
- 30-day cache with 100-entry limit
- Strategy: CacheFirst for optimal performance

**Asset Caching:**
- CSS, JS, HTML, SVG, PNG, ICO, TXT, WOFF2
- Automatic glob pattern matching
- 404 fallback for navigation requests

### App Manifest

**Configuration:**
```json
{
  "name": "Gesundes Leben - Gesundheit, Ernährung & Wellness",
  "short_name": "Gesundes Leben",
  "theme_color": "#10b981",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait-primary"
}
```

**Icon Sizes:**
- 192x192 (standard)
- 512x512 (high-res)
- 512x512 (maskable for adaptive icons)

## Required Assets

### PWA Icons

You need to create the following icon files in the `public/` directory:

1. **pwa-192x192.png** - 192x192px icon
2. **pwa-512x512.png** - 512x512px icon

**Recommendation:**
Use your existing `public/favicon.svg` as the source and generate PNG icons at the required sizes.

**Icon Guidelines:**
- Use the site's primary brand color (#10b981 - emerald green)
- Ensure high contrast against white background
- Test maskable icon on different devices
- Consider safe area for maskable icons (80% of icon area)

## Testing PWA Functionality

### Development Testing

1. **Build the site:**
   ```bash
   bun run build
   ```

2. **Preview the build:**
   ```bash
   bun run preview
   ```

3. **Test in browser:**
   - Open Chrome DevTools → Application → Manifest
   - Verify manifest details
   - Check Service Workers registration
   - Test offline functionality

### Lighthouse Audit

Run Lighthouse PWA audit to verify:
- Installability criteria
- Service worker registration
- Offline capabilities
- App manifest compliance

### Browser Testing

Test PWA installation on:
- Chrome/Edge (desktop and mobile)
- Safari (iOS)
- Firefox

## Performance Impact

**Expected Improvements:**
- **Repeat visits:** 40-60% faster (cached resources)
- **Offline capability:** Full site available offline
- **Mobile experience:** App-like installation option
- **Resource optimization:** Intelligent caching reduces bandwidth

## Next Steps

1. **Create PWA icons** (pwa-192x192.png, pwa-512x512.png)
2. **Test PWA installation** on multiple devices
3. **Monitor service worker** in production
4. **Analyze bundle size** using generated stats.html
5. **Optimize large dependencies** identified in bundle analysis

## Additional Resources

- [Vite PWA for Astro](https://vite-pwa-org.netlify.app/frameworks/astro.html)
- [PWA Best Practices](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Bundle Analysis Guide](https://github.com/btd/rollup-plugin-visualizer)

## Troubleshooting

### Service Worker Not Registering

1. Ensure HTTPS or localhost
2. Check browser console for errors
3. Verify service worker scope in manifest

### Icons Not Displaying

1. Check icon paths in public directory
2. Verify icon sizes match manifest
3. Clear browser cache and rebuild

### Cache Not Working

1. Check Network tab in DevTools
2. Verify service worker is active
3. Review caching strategy in configuration

---

**Implementation Date:** November 2024
**Framework:** Astro 5.15.4
**Package Manager:** Bun
