# OG Image Caching System

## Overview

The OG (Open Graph) image caching system intelligently generates and caches social media preview images for blog posts. Instead of regenerating all images on every build (2-3GB memory, 10-15s time), images are cached and only regenerated when post content changes.

## How It Works

### 1. **Smart Caching**
- OG images are pre-generated and stored in `public/og/`
- A cache manifest (`public/og/.cache.json`) tracks content hashes
- Only changed posts trigger regeneration
- Build-time OG generation: ~1s (vs 10-15s without caching)

### 2. **Hybrid Approach**
- **Production**: Serves pre-generated images from `public/og/`
- **Development**: Falls back to dynamic generation if cache miss
- **Best of both worlds**: Fast builds + always up-to-date images

### 3. **Content-Based Invalidation**
Images are regenerated when any of these change:
- Post title
- Post description
- Publication date
- Author
- Category

## Usage

### Generate OG Images (First Time)

```bash
# Generate all OG images with caching
bun run og:generate

# This will:
# 1. Scan all blog posts
# 2. Generate missing or changed OG images
# 3. Update the cache manifest
# 4. Skip unchanged posts (instant)
```

**Output:**
```
🖼️  Processing OG Images with Smart Caching

Found 83 blog posts

  Generating: top-5-untersuchungen-und-laborwerte
  ✓ Cached: die-koerperlichkeit-der-depression
  Generating: 10-strategien-um-negative-gedanken-zu-stoppen
  ✓ Cached: 4-regeln-fuer-ein-gutes-selbstwertgefuehl
  ...

📊 Summary:
   Generated: 5 images
   Cached: 78 images
   Total size: 1.2MB
   Cache file: public/og/.cache.json

✅ OG images processed successfully!
```

### Commit Generated Images

```bash
# Add generated images to git
git add public/og/*.png

# Commit them (but not the cache file - it's gitignored)
git commit -m "chore: Generate OG images for blog posts"
```

### Rebuild All Images

```bash
# Clear cache and regenerate everything
bun run og:rebuild

# Or manually:
bun run og:clear
bun run og:generate
```

### Clear Cache Only

```bash
# Remove all cached images
bun run og:clear
```

## Integration with Build Process

### Option 1: Pre-Build Hook (Recommended)

Add to `package.json`:
```json
{
  "scripts": {
    "prebuild": "bun run og:generate",
    "build": "NODE_OPTIONS='--max-old-space-size=4096' astro build"
  }
}
```

**Pros:**
- Automatic OG image generation before every build
- Always up-to-date
- Minimal overhead (only regenerates changed posts)

**Cons:**
- Adds 1-2s to build time (for cache checks)

### Option 2: Manual Generation (Current)

Generate OG images manually when content changes:
```bash
bun run og:generate
git add public/og/*.png
git commit -m "chore: Update OG images"
```

**Pros:**
- Zero build-time overhead
- Full control over when images are generated

**Cons:**
- Must remember to run after content changes
- Risk of outdated images if forgotten

### Option 3: CI/CD Integration

Add to your CI/CD pipeline:
```yaml
# .github/workflows/build.yml
- name: Generate OG Images
  run: bun run og:generate

- name: Commit OG Images
  run: |
    git add public/og/*.png
    git commit -m "chore: Update OG images [skip ci]" || true
    git push
```

## File Structure

```
public/
└── og/
    ├── .cache.json                    # Cache manifest (gitignored)
    ├── post-slug-1.png               # Generated OG image (committed)
    ├── post-slug-2.png               # Generated OG image (committed)
    └── ...
```

## Cache Manifest Format

```json
{
  "version": 1,
  "images": {
    "post-slug-1": "a1b2c3d4...",  // SHA-256 hash of relevant content
    "post-slug-2": "e5f6g7h8...",
    ...
  }
}
```

## Performance Impact

### Before (Dynamic Generation)
- **Memory**: 2-3GB for Satori/Resvg processing
- **Build Time**: +10-15s for 83 images
- **Every Build**: Full regeneration

### After (Smart Caching)
- **Memory**: ~50MB (only for changed posts)
- **Build Time**: +1-2s (cache checks only)
- **First Build**: 10-15s (generates all)
- **Subsequent Builds**: <1s (serves from cache)

### Cumulative Savings
- 83 posts × 30 builds/month = **5-7.5 hours/month saved**
- Memory pressure reduced by **90%**

## Troubleshooting

### Images Not Updating

**Problem**: Changed post content but OG image didn't regenerate

**Solutions:**
1. Clear cache and rebuild:
   ```bash
   bun run og:rebuild
   ```

2. Check if post has custom `ogImage` field (skipped by system):
   ```yaml
   ---
   ogImage: custom-image.jpg  # This post won't use dynamic generation
   ---
   ```

3. Verify cache manifest:
   ```bash
   cat public/og/.cache.json
   ```

### Build Fails with "Cannot find module"

**Problem**: Missing OG template imports

**Solution**: Ensure OG templates exist:
```bash
ls src/utils/og-templates/
# Should show: post.js, site.js
```

### Images Not Served in Production

**Problem**: OG images return 404

**Solutions:**
1. Ensure images are committed:
   ```bash
   git ls-files public/og/
   ```

2. Check `dynamicOgImage` setting:
   ```typescript
   // src/config.ts
   dynamicOgImage: true  // Must be true
   ```

3. Verify deployment includes `public/` directory

## Advanced Configuration

### Custom Cache Location

Edit `scripts/generate-og-images.js`:
```javascript
const OUTPUT_DIR = 'public/custom-og-path';
const CACHE_FILE = 'public/custom-og-path/.cache.json';
```

### Custom Hash Algorithm

Change content hash generation:
```javascript
function generateContentHash(post) {
  // Include more or fewer fields
  const relevantContent = JSON.stringify({
    title: post.data.title,
    description: post.data.description,
    // Add: tags, featured image, etc.
  });
  return crypto.createHash('sha256').update(relevantContent).digest('hex');
}
```

### Integration with CI

Skip OG generation in CI when no posts changed:
```bash
# Check if blog posts changed
if git diff --name-only HEAD~1 | grep -q "src/data/blog/"; then
  bun run og:generate
else
  echo "No blog posts changed, skipping OG generation"
fi
```

## Monitoring

### Track Cache Hit Rate

Add to generation script:
```javascript
const hitRate = (cached / (generated + cached)) * 100;
console.log(`Cache hit rate: ${hitRate.toFixed(1)}%`);
```

### Measure Generation Time

```bash
time bun run og:generate
```

Expected times:
- First run: 10-15s
- Subsequent runs (no changes): <1s
- With 5 changed posts: 2-3s

## Best Practices

1. **Commit Generated Images**: OG images are part of your site's assets
2. **Run Before Major Deployments**: Ensure all images are up-to-date
3. **Monitor Cache Size**: Each image is ~15-30KB, 100 posts = ~2-3MB
4. **Periodic Rebuilds**: Consider monthly full regeneration to catch edge cases
5. **Test Locally**: Always run `bun run og:generate` before committing posts

## Migration from Dynamic Generation

If you previously disabled OG generation:

```bash
# 1. Re-enable in config
# src/config.ts: dynamicOgImage: true

# 2. Generate all images
bun run og:generate

# 3. Commit images
git add public/og/*.png
git commit -m "feat: Add cached OG images"

# 4. Deploy and verify
```

## See Also

- [PERFORMANCE-IMPROVEMENT-PLAN.md](../PERFORMANCE-IMPROVEMENT-PLAN.md) - Phase 2.1
- [OG Image Templates](../src/utils/og-templates/) - Template source code
- [Satori Documentation](https://github.com/vercel/satori) - SVG generation library
