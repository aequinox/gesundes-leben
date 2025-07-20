# Performance Testing Suite

This directory contains comprehensive performance testing tools to measure and track the impact of optimizations on the Healthy Life blog.

## 🚀 Quick Start

### Run Complete Performance Test Suite
```bash
# Builds project and runs all performance tests
bun run perf:baseline

# Or run tests on existing build
bun run perf:test
```

### Individual Test Commands
```bash
# Bundle analysis only
bun run analyze

# Lighthouse performance tests only
bun run perf:lighthouse

# Compare two performance reports
bun run perf:compare tests/performance/results/before.json tests/performance/results/after.json
```

## 📊 What Gets Measured

### Bundle Analysis (`analyze-bundle.js`)
- **JavaScript bundle sizes** and chunks
- **CSS bundle sizes** and optimization
- **Image optimization** results (WebP/AVIF usage)
- **Font optimization** (WOFF2 usage)
- **Code splitting** effectiveness
- **Minification** status

### Lighthouse Performance (`lighthouse-test.js`)
- **Core Web Vitals**: LCP, FID, CLS
- **Performance metrics**: FCP, TTI, TBT, Speed Index
- **Image optimization** scores
- **Bundle efficiency** metrics
- **Accessibility** and **SEO** scores

### Real-Time Monitoring (`WebVitalsMonitor.astro`)
- **Live Core Web Vitals** tracking
- **Image loading performance**
- **Navigation timing** metrics
- **User experience** data collection

## 📈 Performance Testing Workflow

### 1. Establish Baseline
```bash
# Before making any changes
bun run perf:baseline
```
This creates a baseline measurement of current performance.

### 2. Implement Improvements
Make your optimizations (lazy loading, bundle splitting, etc.)

### 3. Measure Impact
```bash
# After implementing changes
bun run build
bun run perf:test
```

### 4. Compare Results
The test suite automatically compares with previous results and shows:
- ✅ **Improvements**: Metrics that got better
- ⚠️ **Regressions**: Metrics that got worse
- 📊 **Impact analysis**: Percentage changes and significance

## 🎯 Performance Thresholds

The test suite uses these thresholds to identify issues:

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s (good), < 4.0s (needs improvement)
- **FID (First Input Delay)**: < 100ms (good), < 300ms (needs improvement)  
- **CLS (Cumulative Layout Shift)**: < 0.1 (good), < 0.25 (needs improvement)

### Performance Metrics
- **FCP (First Contentful Paint)**: < 1.8s (good), < 3.0s (needs improvement)
- **TTI (Time to Interactive)**: < 3.8s (good), < 7.3s (needs improvement)
- **Performance Score**: ≥ 90 (good), ≥ 50 (needs improvement)

### Bundle Size Thresholds
- **JavaScript bundle**: < 100KB per chunk
- **CSS bundle**: < 50KB total
- **Images**: < 500KB per image
- **Fonts**: < 100KB per font file

## 📁 Output Files

All test results are saved in `tests/performance/results/`:

### JSON Reports
- `performance-{timestamp}.json` - Lighthouse test results
- `bundle-analysis-{timestamp}.json` - Bundle analysis data
- `performance-summary-{timestamp}.json` - Combined test results

### Human-Readable Reports
- `performance-report-{timestamp}.md` - Markdown summary report

## 🔧 Customization

### Test URLs
Edit `lighthouse-test.js` to change which pages get tested:
```javascript
this.testUrls = [
  { name: 'Homepage', url: 'http://localhost:4321/' },
  { name: 'Blog Post', url: 'http://localhost:4321/posts/your-post' },
  // Add more URLs to test
];
```

### Performance Thresholds
Adjust thresholds in the test files based on your requirements:
```javascript
this.thresholds = {
  performance: 90,  // Performance score threshold
  lcp: 2500,       // LCP threshold (ms)
  cls: 0.1,        // CLS threshold
  // ... other thresholds
};
```

### Bundle Size Limits
Modify bundle size warnings in `analyze-bundle.js`:
```javascript
this.thresholds = {
  jsBundle: 100,    // JavaScript bundle (KB)
  cssBundle: 50,    // CSS bundle (KB)
  image: 500,       // Individual image (KB)
  // ... other limits
};
```

## 🧪 Real-World Testing

### Adding Web Vitals Monitoring
Include the monitoring component in your layouts:
```astro
---
import WebVitalsMonitor from '@/components/elements/WebVitalsMonitor.astro';
---

<WebVitalsMonitor 
  endpoint="/api/analytics"
  debug={true}
  sampleRate={0.1}
/>
```

### Performance Regression Testing
Add to your CI/CD pipeline:
```yaml
- name: Performance Regression Test
  run: |
    bun run perf:baseline
    # Check if performance degraded
    node -e "
      const results = require('./tests/performance/results/latest.json');
      if (results.comparison?.regressions?.length > 0) {
        console.error('Performance regressions detected!');
        process.exit(1);
      }
    "
```

## 📋 Performance Checklist

Use this checklist to ensure comprehensive optimization:

### Images ✅
- [ ] WebP/AVIF format conversion
- [ ] Lazy loading implementation
- [ ] Responsive image sizing
- [ ] Image compression optimization

### JavaScript ✅
- [ ] Code splitting by route
- [ ] Tree shaking unused code
- [ ] Bundle size monitoring
- [ ] Dynamic imports for large libraries

### CSS ✅
- [ ] Critical CSS extraction
- [ ] Unused CSS removal
- [ ] CSS minification
- [ ] Media query optimization

### Fonts ✅
- [ ] WOFF2 format usage
- [ ] Font preloading
- [ ] Font-display: swap
- [ ] Font subsetting

### Core Web Vitals ✅
- [ ] LCP < 2.5s
- [ ] FID < 100ms  
- [ ] CLS < 0.1
- [ ] Performance score > 90

## 🚨 Troubleshooting

### Common Issues

**Test fails with "Build failed"**
```bash
# Ensure project builds successfully first
bun run build
```

**Lighthouse can't connect to server**
```bash
# Check if port 4321 is available
lsof -i :4321
```

**Bundle analysis shows no files**
```bash
# Ensure dist directory exists
ls -la dist/
```

**Performance tests timeout**
```bash
# Increase timeout in lighthouse-test.js
const lighthouseOptions = {
  // ... other options
  timeout: 60000  // Increase timeout
};
```