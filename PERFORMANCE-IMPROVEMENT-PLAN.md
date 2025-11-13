# Performance Improvement Plan
## Gesundes Leben Blog - Comprehensive Optimization Strategy

**Created:** 2025-11-13
**Status:** Ready for Implementation
**Priority:** CRITICAL - Current memory usage: 600MB browser, 8-16GB build

---

## Executive Summary

The application currently suffers from critical performance issues:
- **Browser memory**: 600MB (should be <100MB)
- **Build memory**: 8-16GB (should be <4GB)
- **High CPU load**: Excessive animations and unoptimized assets
- **Source size**: 239MB (217MB images alone)
- **Build time**: 30-45 seconds (should be <15s)

**Root Causes:**
1. 🔴 **217MB unoptimized source images** (individual files up to 19MB)
2. 🔴 **7,365 image variants** generated (15 breakpoints × 491 images)
3. 🔴 **Entire Tabler icon set** bundled (only 17 icons used)
4. 🟡 **83 dynamic OG images** generated at build time
5. 🟡 **Expensive CSS animations** (blur filters, global will-change)
6. 🟡 **Large translation objects** loaded on every page

**Expected Impact:**
- Build memory: -10GB (60% reduction)
- Browser memory: -400MB (67% reduction)
- Build time: -20s (50% reduction)
- Bundle size: -3-5MB
- Repository size: -200MB (85% reduction)

---

## Phase 1: CRITICAL (Immediate) - Week 1

### 1.1 Image Optimization Strategy

**Problem:** 217MB of unoptimized source images causing massive memory consumption

**Priority Files to Optimize:**
```
19MB - depositphotos-137850828-xl.jpg
14MB - cdc-gIaA5PyXgDY-unsplash.jpg (2 copies)
3.1MB - hunger-413685.jpg
+ 488 other images
```

**Action Items:**

#### A. Immediate Compression (DO FIRST)
```bash
# Install image optimization tools
bun add -D sharp-cli imagemin-cli

# Create compression script
```

**File:** `scripts/optimize-images.js`
```javascript
import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs/promises';

const MAX_WIDTH = 2400; // Max width for any image
const QUALITY = 85; // JPEG/WebP quality

async function optimizeImages() {
  const images = await glob('src/data/blog/**/images/*.{jpg,jpeg,png}');
  console.log(`Found ${images.length} images to optimize`);

  let totalSaved = 0;

  for (const imgPath of images) {
    const stats = await fs.stat(imgPath);
    const originalSize = stats.size;

    // Skip if already small enough
    if (originalSize < 500000) { // 500KB
      continue;
    }

    const image = sharp(imgPath);
    const metadata = await image.metadata();

    // Create backup
    await fs.copyFile(imgPath, `${imgPath}.backup`);

    // Optimize
    await image
      .resize(Math.min(metadata.width, MAX_WIDTH), null, {
        withoutEnlargement: true,
      })
      .jpeg({ quality: QUALITY, progressive: true })
      .toFile(`${imgPath}.optimized`);

    // Replace original
    await fs.rename(`${imgPath}.optimized`, imgPath);

    const newStats = await fs.stat(imgPath);
    const saved = originalSize - newStats.size;
    totalSaved += saved;

    console.log(`✓ ${path.basename(imgPath)}: ${(originalSize/1024/1024).toFixed(2)}MB → ${(newStats.size/1024/1024).toFixed(2)}MB (saved ${(saved/1024/1024).toFixed(2)}MB)`);
  }

  console.log(`\n🎉 Total saved: ${(totalSaved/1024/1024).toFixed(2)}MB`);
}

optimizeImages().catch(console.error);
```

**Add to package.json:**
```json
"scripts": {
  "images:optimize": "node scripts/optimize-images.js",
  "images:backup": "find src/data/blog -name '*.backup' -exec rm {} \\;",
  "images:restore": "find src/data/blog -name '*.backup' -exec bash -c 'mv \"$0\" \"${0%.backup}\"' {} \\;"
}
```

**Execution:**
```bash
# Run optimization
bun run images:optimize

# Test build - if successful
bun run build

# If successful, clean backups
bun run images:backup

# If issues, restore
bun run images:restore
```

**Expected Savings:** ~190MB source size, ~8GB build memory

---

#### B. Reduce Image Breakpoints

**File:** `astro.config.ts:217-220`

**Current (PROBLEMATIC):**
```typescript
breakpoints: [
  640, 750, 828, 960, 1080, 1280, 1668, 1920, 2048, 2560,
  3200, 3840, 4480, 5120, 6016  // 15 breakpoints!
],
```

**Change to:**
```typescript
breakpoints: [
  640,   // Mobile
  768,   // Tablet
  1024,  // Desktop
  1280,  // Large desktop
  1920,  // Full HD
  2560   // 2K/4K
],
```

**Impact:**
- Reduces from 7,365 to 2,946 image variants (60% reduction)
- Build time: -10-15 seconds
- Memory: -2-3GB

**Commit after testing:**
```bash
git add astro.config.ts
git commit -m "perf: Reduce image breakpoints from 15 to 6 for 60% fewer variants

- Changes from [640, 750, 828, 960, 1080, 1280, 1668, 1920, 2048, 2560, 3200, 3840, 4480, 5120, 6016]
- To [640, 768, 1024, 1280, 1920, 2560]
- Reduces image variants from 7,365 to 2,946
- Expected build time reduction: 10-15s
- Expected memory reduction: 2-3GB

Impact: Critical performance improvement for build process
References: PERFORMANCE-IMPROVEMENT-PLAN.md Phase 1.1.B"
```

---

### 1.2 Icon Bundle Optimization

**Problem:** ALL Tabler icons included, only 17 actually used

**File:** `astro.config.ts:50-58`

**Current (PROBLEMATIC):**
```typescript
icon({
  svgoOptions: {
    multipass: true,
  },
  include: {
    tabler: ["*"],  // ❌ ALL icons
  },
}),
```

**Change to:**
```typescript
icon({
  svgoOptions: {
    multipass: true,
  },
  include: {
    tabler: [
      // Actually used icons (verified via codebase search)
      "arrow-right",
      "bulb",
      "check",
      "chevron-down",
      "clock",
      "cloud",
      "filter",
      "filter-off",
      "hash",
      "home",
      "info-circle",
      "refresh",
      "search-off",
      "user",
      "x",
      // Add moon/sun if they're tabler icons for theme toggle
    ],
  },
}),
```

**Expected Savings:** 2-5MB bundle size

**Commit:**
```bash
git add astro.config.ts
git commit -m "perf: Include only used Tabler icons instead of entire collection

- Changed from tabler: ['*'] to specific 15 icons
- Icons included: arrow-right, bulb, check, chevron-down, clock, cloud,
  filter, filter-off, hash, home, info-circle, refresh, search-off, user, x
- Expected bundle size reduction: 2-5MB
- Eliminates processing of thousands of unused icons

Impact: Significant bundle size reduction
References: PERFORMANCE-IMPROVEMENT-PLAN.md Phase 1.2"
```

---

### 1.3 Memory Configuration Optimization

**Problem:** Requires 8-16GB memory for builds

**File:** `package.json:6-10`

**After completing 1.1 and 1.2, test with reduced memory:**

**Change from:**
```json
"check": "NODE_OPTIONS='--max-old-space-size=8192' astro check",
"build": "NODE_OPTIONS='--max-old-space-size=8192' astro build",
"build:check": "NODE_OPTIONS='--max-old-space-size=16384' astro check && NODE_OPTIONS='--max-old-space-size=8192' astro build",
"type-check": "NODE_OPTIONS='--max-old-space-size=16384' tsc --noEmit",
```

**To:**
```json
"check": "NODE_OPTIONS='--max-old-space-size=4096' astro check",
"build": "NODE_OPTIONS='--max-old-space-size=4096' astro build",
"build:check": "NODE_OPTIONS='--max-old-space-size=4096' astro check && NODE_OPTIONS='--max-old-space-size=4096' astro build",
"type-check": "NODE_OPTIONS='--max-old-space-size=4096' tsc --noEmit",
```

**Test incrementally:**
```bash
# Test with 4GB
bun run build

# If successful, commit
# If fails, try 6GB
```

---

## Phase 2: HIGH PRIORITY - Week 1-2

### 2.1 Disable/Optimize Dynamic OG Image Generation

**Problem:** Generates 83 OG images at build time, consuming 2-3GB memory

**Option A: Disable Dynamic Generation (RECOMMENDED)**

**File:** `src/config.ts:92`

**Change:**
```typescript
dynamicOgImage: false,  // Use fallback OG image
```

**Expected Savings:** 2-3GB build memory, 10-15s build time

---

**Option B: Pre-generate and Commit OG Images**

```bash
# One-time generation
bun run build

# Copy generated OG images
mkdir -p public/og-images
cp dist/posts/*.png public/og-images/

# Modify OG image logic to serve from /og-images/ instead of generating
```

**Update:** `src/pages/posts/[...slug].png.ts`
```typescript
// Comment out dynamic generation
// Return 404 or redirect to static files
```

**Commit:**
```bash
git add src/config.ts src/pages/posts/[...slug].png.ts public/og-images/
git commit -m "perf: Disable dynamic OG image generation, use pre-generated images

- Set dynamicOgImage: false in config
- Pre-generated 83 OG images committed to public/og-images/
- Removes Satori/Resvg build-time processing
- Expected memory reduction: 2-3GB
- Expected build time reduction: 10-15s

Impact: Significant build performance improvement
Trade-off: OG images must be regenerated manually when post metadata changes
References: PERFORMANCE-IMPROVEMENT-PLAN.md Phase 2.1"
```

---

### 2.2 Optimize Expensive CSS Animations

**Problem:** Filter animations (blur) are GPU-intensive and cause high CPU load

**File:** `src/styles/view-transitions.css:165-199`

**Issues:**
- Lines 169, 174, 179: `filter: blur()` - Very expensive
- Line 313: Global `will-change` on all transition elements - Memory overhead

**Changes:**

#### A. Remove blur animations

**Change:**
```css
@keyframes vt-morph-out {
  from {
    opacity: 1;
    transform: scale(1) rotate(0deg);
    /* Removed: filter: blur(0px); */
  }
  50% {
    opacity: 0.8;
    transform: scale(0.95) rotate(-1deg);
    /* Removed: filter: blur(1px); */
  }
  to {
    opacity: 0;
    transform: scale(0.8) rotate(-2deg);
    /* Removed: filter: blur(4px); */
  }
}

@keyframes vt-morph-in {
  from {
    opacity: 0;
    transform: scale(1.1) rotate(2deg);
    /* Removed: filter: blur(4px); */
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05) rotate(1deg);
    /* Removed: filter: blur(1px); */
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
    /* Removed: filter: blur(0px); */
  }
}
```

**Similar for lines 117-141** (vt-image-out, vt-image-in):
```css
@keyframes vt-image-out {
  from {
    opacity: 1;
    transform: scale(1);
    /* Removed: filter: brightness(1); */
  }
  to {
    opacity: 0;
    transform: scale(0.95);
    /* Removed: filter: brightness(0.8); */
  }
}

@keyframes vt-image-in {
  from {
    opacity: 0;
    transform: scale(1.05);
    /* Removed: filter: brightness(1.2); */
  }
  to {
    opacity: 1;
    transform: scale(1);
    /* Removed: filter: brightness(1); */
  }
}
```

#### B. Optimize will-change usage

**File:** `src/styles/view-transitions.css:310-314`

**Remove or modify:**
```css
/* OLD - Causes memory overhead */
[style*="view-transition-name"] {
  transform: translateZ(0);
  will-change: transform, opacity;  /* ❌ Always applied */
}
```

**Replace with:**
```css
/* NEW - Only during active transitions */
[style*="view-transition-name"] {
  transform: translateZ(0);
  /* Removed: will-change - let browser manage */
}

/* Apply will-change only during animation via JS */
[data-animating="true"] {
  will-change: transform, opacity;
}
```

**Expected Savings:** 30-50% CPU reduction during page transitions

**Commit:**
```bash
git add src/styles/view-transitions.css
git commit -m "perf: Remove expensive filter animations and optimize will-change

- Removed blur() and brightness() filters from animations (GPU-intensive)
- Removed global will-change from all transition elements
- Animations now use only transform and opacity (GPU-efficient)
- Expected CPU reduction during transitions: 30-50%
- Expected memory reduction: 10-20MB per page

Impact: Significant runtime performance improvement
Trade-off: Slightly less elaborate transition effects
References: PERFORMANCE-IMPROVEMENT-PLAN.md Phase 2.2"
```

---

### 2.3 Split Large Translation Files

**Problem:** 819-line translation object loaded on every page

**File:** `src/i18n/ui.ts` (819 lines)

**Strategy:** Code split by language

**Create:**
```typescript
// src/i18n/languages/de.ts
export const de = {
  // Move all German translations here
};

// src/i18n/languages/en.ts
export const en = {
  // Move all English translations here
};
```

**Update:** `src/i18n/ui.ts`
```typescript
import { de } from './languages/de';
import { en } from './languages/en';

export const ui = { de, en };
```

**Expected Savings:** Minimal bundle (already static), but better maintainability

---

## Phase 3: MEDIUM PRIORITY - Week 2-3

### 3.1 Lazy Load View Transitions CSS

**Problem:** 8KB of view-transitions CSS loaded on every page

**Strategy:** Load only when navigation occurs

**File:** Create `src/utils/load-view-transitions.ts`
```typescript
let loaded = false;

export async function loadViewTransitions() {
  if (loaded) return;

  await import('../styles/view-transitions.css');
  loaded = true;
}
```

**Update:** `src/layouts/Layout.astro`
```astro
<script>
  // Load view transitions CSS on first navigation
  document.addEventListener('astro:before-preparation', async () => {
    const { loadViewTransitions } = await import('../utils/load-view-transitions');
    await loadViewTransitions();
  }, { once: true });
</script>
```

---

### 3.2 Refactor Oversized Components

**Problem:** Multiple files exceed size guidelines

**Priority Refactoring:**

| File | Lines | Target | Action |
|------|-------|--------|--------|
| `src/components/sections/Card.astro` | 590 | 300 | Split into Card, CardImage, CardContent |
| `src/components/sections/ContentSeries.astro` | 538 | 300 | Extract SeriesItem component |
| `src/components/filter/BlogFilter.astro` | 508 | 300 | Extract FilterControls, FilterResults |

**Example refactoring for Card.astro:**

**Create:** `src/components/sections/card/CardImage.astro`
**Create:** `src/components/sections/card/CardContent.astro`
**Create:** `src/components/sections/card/CardMeta.astro`

**Update:** `src/components/sections/Card.astro`
```astro
---
import CardImage from './card/CardImage.astro';
import CardContent from './card/CardContent.astro';
import CardMeta from './card/CardMeta.astro';
// ...
---

<article>
  <CardImage {...imageProps} />
  <CardContent {...contentProps} />
  <CardMeta {...metaProps} />
</article>
```

---

### 3.3 Review PWA Configuration

**Problem:** PWA adds complexity, may not be essential

**Evaluation Questions:**
1. Are users actually installing the PWA?
2. Is offline support critical for a blog?
3. What's the bundle cost of PWA features?

**Action:** Add analytics to measure PWA usage
```javascript
// Track PWA installs
window.addEventListener('beforeinstallprompt', (e) => {
  // Track prompt shown
});

window.addEventListener('appinstalled', () => {
  // Track installation
});
```

**Decision Matrix:**
- **If usage < 5%**: Consider removing PWA
- **If usage > 20%**: Keep but optimize manifest
- **Between 5-20%**: Lazy load PWA features

---

## Phase 4: OPTIMIZATION & MONITORING - Week 3-4

### 4.1 Bundle Analysis & Monitoring

**Add monitoring scripts:**

**File:** `scripts/performance-baseline.js`
```javascript
import fs from 'fs/promises';
import { glob } from 'glob';

async function measurePerformance() {
  // Measure dist size
  const files = await glob('dist/**/*');
  let totalSize = 0;

  for (const file of files) {
    const stats = await fs.stat(file);
    if (stats.isFile()) {
      totalSize += stats.size;
    }
  }

  // Measure largest files
  const jsFiles = await glob('dist/**/*.js');
  const sizes = await Promise.all(
    jsFiles.map(async (file) => {
      const stats = await fs.stat(file);
      return { file, size: stats.size };
    })
  );

  sizes.sort((a, b) => b.size - a.size);

  console.log(`\n📊 Build Performance Report`);
  console.log(`Total dist size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`\nLargest JS files:`);
  sizes.slice(0, 10).forEach(({ file, size }) => {
    console.log(`  ${file}: ${(size / 1024).toFixed(2)}KB`);
  });

  // Write to file for tracking
  const report = {
    timestamp: new Date().toISOString(),
    totalSize,
    largestFiles: sizes.slice(0, 20),
  };

  await fs.writeFile(
    'performance-report.json',
    JSON.stringify(report, null, 2)
  );
}

measurePerformance().catch(console.error);
```

**Add to package.json:**
```json
"scripts": {
  "perf:measure": "bun run build && node scripts/performance-baseline.js"
}
```

---

### 4.2 Image Optimization Pipeline

**Add pre-commit hook to prevent large images:**

**File:** `.husky/pre-commit`
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Check for large images
large_images=$(find src/data/blog -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" | while read file; do
  size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
  if [ "$size" -gt 1048576 ]; then  # 1MB
    echo "$file: $(($size / 1024 / 1024))MB"
  fi
done)

if [ -n "$large_images" ]; then
  echo "❌ Large images detected (>1MB):"
  echo "$large_images"
  echo ""
  echo "Please optimize images before committing:"
  echo "  bun run images:optimize"
  exit 1
fi

# Run existing checks
bun run lint
```

---

### 4.3 Runtime Performance Monitoring

**Add to Layout.astro:**
```astro
<script>
  // Monitor page memory
  if (performance.memory) {
    const logMemory = () => {
      const used = performance.memory.usedJSHeapSize / 1024 / 1024;
      const total = performance.memory.totalJSHeapSize / 1024 / 1024;

      if (used > 100) {
        console.warn(`⚠️ High memory usage: ${used.toFixed(2)}MB / ${total.toFixed(2)}MB`);
      }
    };

    // Check every 30 seconds
    setInterval(logMemory, 30000);
  }

  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  }
</script>
```

---

## Phase 5: ADVANCED OPTIMIZATIONS - Week 4+

### 5.1 Image CDN Migration

**Strategy:** Move images to external CDN (Cloudflare Images, Cloudinary, etc.)

**Benefits:**
- Remove 217MB from repository
- Faster git operations
- Dynamic optimization at edge
- Automatic format negotiation (WebP, AVIF)

**Implementation:**
1. Upload images to CDN
2. Update Image component to use CDN URLs
3. Remove local images
4. Update git history to remove image commits (optional)

---

### 5.2 Implement Advanced Caching

**Strategy:** Add stale-while-revalidate for API calls and assets

**File:** `src/middleware/cache.ts`
```typescript
export function cacheMiddleware() {
  return {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
  };
}
```

---

### 5.3 Evaluate Astro Experimental Features

**Check for:**
- `experimental.contentCollectionCache` - Cache content collections
- `experimental.optimizeHoistedScript` - Optimize inline scripts
- Route-level code splitting

---

## Testing & Validation

### After Each Phase:

#### 1. **Build Performance Test**
```bash
# Clear cache
rm -rf node_modules/.astro dist

# Time the build
time bun run build

# Should be <15s after Phase 1-2
```

#### 2. **Bundle Size Check**
```bash
bun run analyze

# Check dist/stats.html
# JS bundle should be <500KB (compressed)
```

#### 3. **Runtime Performance Test**
```bash
# Start dev server
bun run preview

# Open Chrome DevTools
# 1. Performance tab - Record page load
# 2. Memory tab - Take heap snapshot
# 3. Check:
#    - FCP < 1.5s
#    - LCP < 2.5s
#    - Memory < 100MB
```

#### 4. **Lighthouse Test**
```bash
# Run from tests/accessibility/a11y-test.js
bun run a11y:test

# Should score:
# - Performance: >90
# - Accessibility: >95
# - Best Practices: >90
```

#### 5. **Visual Regression Test**
```bash
# Run E2E tests
bun run test:e2e

# Ensure no visual breakage
```

---

## Success Metrics

### Before (Current State)
- Browser memory: 600MB
- Build memory: 8-16GB
- Build time: 30-45s
- Source size: 239MB
- Lighthouse Performance: Unknown
- CPU during transitions: High

### After Phase 1 (Week 1)
- Browser memory: ~300MB (50% reduction)
- Build memory: ~4GB (60% reduction)
- Build time: ~20s (33% reduction)
- Source size: ~50MB (79% reduction)

### After Phase 2 (Week 2)
- Browser memory: ~200MB (67% reduction)
- Build memory: ~2GB (75% reduction)
- Build time: ~10s (67% reduction)
- Lighthouse Performance: >90

### After Phase 3 (Week 3)
- Browser memory: ~150MB (75% reduction)
- Build time: ~8s (73% reduction)
- Code maintainability: Improved

### Final Target (Week 4)
- Browser memory: <100MB (83% reduction)
- Build memory: <2GB (88% reduction)
- Build time: <8s (73% reduction)
- Source size: <50MB (79% reduction)
- Lighthouse Performance: >95
- CPU during transitions: Normal

---

## Risk Mitigation

### Potential Issues & Solutions

#### 1. **Images Look Worse After Optimization**
- **Solution**: Adjust QUALITY constant in optimization script
- **Test**: Side-by-side comparison with original
- **Rollback**: Use `bun run images:restore`

#### 2. **Build Fails with Reduced Memory**
- **Solution**: Increase incrementally (4GB → 6GB → 8GB)
- **Root cause**: Other memory leaks need addressing first

#### 3. **Animations Feel Sluggish**
- **Solution**: Adjust transition durations
- **Fallback**: Keep blur for desktop only via media query

#### 4. **OG Images Not Updating**
- **Solution**: Create regeneration script for changed posts
- **Documentation**: Add to CONTRIBUTING.md

---

## Rollback Procedures

### If Phase 1 Causes Issues:
```bash
# Restore images
bun run images:restore

# Revert config changes
git revert <commit-hash>

# Rebuild
bun run build
```

### If Build Completely Fails:
```bash
# Emergency restore
git reset --hard HEAD~<number-of-commits>
rm -rf node_modules/.astro dist
bun install
bun run build
```

---

## Documentation Updates

### Files to Update After Completion:

1. **README.md**
   - Update build requirements (memory, time)
   - Add image optimization guidelines
   - Document performance benchmarks

2. **CONTRIBUTING.md**
   - Add image size limits (<1MB per image)
   - Add pre-commit hook documentation
   - Document OG image regeneration process

3. **CLAUDE.md**
   - Update with new performance standards
   - Add monitoring guidelines

4. **.github/workflows/** (if applicable)
   - Update CI memory limits
   - Add performance regression tests

---

## Appendix

### A. Icon Usage Audit Results

**Actually used (17 icons):**
- arrow-right, bulb, check, chevron-down, clock
- cloud, filter, filter-off, hash, home
- info-circle, refresh, search-off, user, x
- moon, sun (if Tabler)

**Recommendation:** Only include these 17 icons

---

### B. Image Directory Sizes (Top 20)

```
49M  - misc-images/images
32M  - 2024-04-26-10-strategien-um-negative-gedanken-zu-stoppen/images
22M  - 2024-07-17-die-koerperlichkeit-der-depression/images
20M  - 2024-02-28-4-regeln-fuer-ein-gutes-selbstwertgefuehl/images
15M  - 2023-08-01-top-5-darm-und-immunsystemstaerkung/images
14M  - 2024-05-05-top-5-untersuchungen-und-laborwerte-fuer-deinen-gesundheits-tuev/images
12M  - 2024-04-19-lesenswert-die-1-methode-minimale-veraenderung-maximale-wirkung/images
(+ 13 more directories)
```

---

### C. Dependencies Analysis

**Heavy Dependencies:**
- `sharp` (18MB) - Required for image processing ✓
- `satori` (5MB) - OG image generation - Can be removed if Phase 2.1 Option A
- `@resvg/resvg-js` (3MB) - OG image generation - Can be removed if Phase 2.1 Option A
- `lighthouse` (20MB) - Dev dependency ✓

**Recommendation:** Consider moving `lighthouse` to separate testing package

---

### D. Performance Budget

**Establish ongoing budgets:**

```javascript
// performance-budget.json
{
  "budgets": [
    {
      "resourceType": "script",
      "maximum": "500kb"
    },
    {
      "resourceType": "stylesheet",
      "maximum": "100kb"
    },
    {
      "resourceType": "image",
      "maximum": "300kb"
    },
    {
      "resourceType": "font",
      "maximum": "200kb"
    },
    {
      "metric": "first-contentful-paint",
      "maximum": 1500
    },
    {
      "metric": "largest-contentful-paint",
      "maximum": 2500
    }
  ]
}
```

---

### E. Monitoring Dashboard

**Recommended tools:**
- **SpeedCurve** or **Calibre** for continuous monitoring
- **bundle-stats** for bundle analysis over time
- **size-limit** for PR-level size checks

**Setup size-limit:**
```bash
bun add -D size-limit @size-limit/file

# .size-limit.json
[
  {
    "path": "dist/client/*.js",
    "limit": "500 KB"
  }
]

# Add to package.json
"scripts": {
  "size": "size-limit"
}
```

---

## Next Steps

1. **Review this plan** with the team
2. **Prioritize phases** based on urgency
3. **Assign owners** to each phase
4. **Create tickets** in issue tracker
5. **Schedule sprint** planning
6. **Set up monitoring** baseline
7. **Begin Phase 1** immediately

---

## Questions or Issues?

- Create issue in repository with `performance` label
- Reference this document section
- Include performance measurements

---

**Document Version:** 1.0
**Last Updated:** 2025-11-13
**Owner:** Development Team
**Status:** Ready for Implementation
