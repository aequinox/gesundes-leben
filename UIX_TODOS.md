# 🎯 UIX Implementation Todos

Based on the comprehensive analysis in `UIX_IMPROVEMENTS.md`, this document tracks the implementation status of all UX/UI improvements.

**Last Updated**: 2025-11-10
**Status**: In Progress

---

## 📊 Priority Overview

- **P0 (Critical)**: 2 tasks - Foundational fixes that impact accessibility & compliance
- **P1 (High)**: 3 tasks - Major improvements to visual hierarchy & interactions
- **P2 (Medium)**: 3 tasks - Polish and optimization improvements
- **P3 (Future)**: 2 tasks - Advanced features for enhanced experience

---

## ✅ P0: Critical Fixes (Week 1)

### 1. Color System & Contrast Improvements (Section 2) ✅
**File**: `src/styles/color-system.css`, `src/styles/global.css`
**Impact**: 🔥 High | **Effort**: Low
**Status**: COMPLETED

- [x] Update accent color from `oklch(62% 0.17 215deg)` to `oklch(58% 0.18 215deg)` for AAA contrast (7.2:1)
- [x] Improve muted text from `oklch(75% 0.025 240deg)` to `oklch(65% 0.025 240deg)` (4.8:1)
- [x] Update health category colors for guaranteed AAA contrast:
  - [x] `--health-nutrition: oklch(58% 0.20 120deg)` (7.5:1)
  - [x] `--health-fitness: oklch(56% 0.22 25deg)` (7.8:1)
  - [x] `--health-mental: oklch(60% 0.18 270deg)` (7.1:1)
  - [x] `--health-medical: oklch(58% 0.18 215deg)` (7.2:1)
  - [x] `--health-lifestyle: oklch(66% 0.18 80deg)` (6.9:1)
- [x] Update dark mode colors for better contrast
  - [x] Dark mode accent: `oklch(75% 0.19 55deg)` (8.1:1)
  - [x] Dark mode muted: `oklch(75% 0.025 240deg)` (6.2:1)
- [x] Add perceptual color harmony tokens (wellness, action, trust)
- [x] Add utility classes for harmony colors
- [ ] Test with WebAIM Contrast Checker (requires live site)
- [ ] Validate all text meets WCAG AAA (7:1+) standard (requires live site)

**Expected Outcome**: 100% WCAG AAA compliance, +15% trust perception

**Implementation Notes**:
- Updated `src/styles/global.css` lines 13, 16, 82, 85
- Updated `src/styles/color-system.css` lines 31-35
- Added harmony color tokens and utility classes to `color-system.css`

---

### 2. Skip Navigation Implementation (Section 6A) ✅
**File**: `src/layouts/Layout.astro`, `src/styles/global.css`
**Impact**: 🔥 High | **Effort**: Low
**Status**: COMPLETED

- [x] Add skip navigation link before Header component (line 85-87)
- [x] Implement skip-link class with focus reveal
- [x] Style with accent background and proper spacing
- [x] Add proper z-index (999) for overlay visibility
- [x] Add id="main-content" to main element
- [ ] Test with keyboard navigation (Tab key) - requires live site
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver) - requires live site
- [x] Ensure link targets `#main-content` ID exists

**Expected Outcome**: WCAG AAA keyboard navigation compliance

**Implementation Notes**:
- Added `.skip-link` class to `src/styles/global.css` lines 277-295
- Updated `src/layouts/Layout.astro` lines 85-87 with skip link
- Added `id="main-content"` to main element at line 91
- Skip link appears on focus with proper styling and positioning

---

## 🔥 P1: High Impact Improvements (Weeks 2-3)

### 3. Typography Scale Enhancement (Section 1) ✅
**Files**: `src/styles/typography.css`, `src/components/elements/H.astro`
**Impact**: 🔥 High | **Effort**: Medium
**Status**: COMPLETED

- [x] Create/update `src/styles/typography.css` with health-optimized scale
- [x] Increase base font size: `clamp(1.0625rem, 1rem + 0.5vw, 1.125rem)` (17-18px)
- [x] Increase lg font size: `clamp(1.1875rem, 1.1rem + 0.6vw, 1.25rem)`
- [x] Update line heights: base to 1.7, relaxed to 1.9
- [x] Add optical sizing: `font-variation-settings: "opsz" auto`
- [x] Create `.text-medical` utility class
- [x] Update H1 component: `text-5xl md:text-6xl font-black tracking-tight leading-[1.1]`
- [x] Update content width from 65ch to 72ch
- [x] Add article and narrow width variants (75ch, 60ch)
- [ ] Test readability with 50+ demographic - requires user testing
- [ ] Measure reading comprehension improvement - requires analytics

**Expected Outcome**: +25% readability for 50+ demographic, reduced bounce rate

**Implementation Notes**:
- Updated `src/styles/typography.css` lines 9-10 (font sizes)
- Updated `src/styles/typography.css` lines 19-20 (line heights)
- Updated `src/styles/typography.css` lines 29-32 (content widths)
- Added optical sizing at line 46
- Added `.text-medical` utility class at lines 50-54
- Updated `src/components/elements/H.astro` line 61 (H1 styling)
- H1 now 40% larger than H2 for clear visual hierarchy

---

### 4. Smart Header Behavior (Section 4A)
**File**: `src/components/sections/Navigation.astro`
**Impact**: 🔥 High | **Effort**: Medium

- [ ] Add scroll event listener script
- [ ] Implement hide-on-scroll-down behavior (after 100px)
- [ ] Implement show-on-scroll-up behavior
- [ ] Add smooth transform transition to header
- [ ] Ensure no layout shift (CLS impact)
- [ ] Test on mobile devices
- [ ] Verify header is accessible via scroll-up or keyboard focus
- [ ] Add CSS transform styles for smooth animation

**Expected Outcome**: +18% mobile viewport usage, better content focus

---

### 5. Card Animation Refinement (Section 5A)
**File**: `src/components/sections/Card.astro`
**Impact**: 🔥 High | **Effort**: Low

- [ ] Replace aggressive hover with subtle `-translate-y-1`
- [ ] Change scale from `105%` to `103%` for images
- [ ] Update transition to `cubic-bezier(0.34, 1.56, 0.64, 1)` (bounce)
- [ ] Add `brightness-[1.02]` to image hover
- [ ] Increase duration to 400ms (article) and 600ms (image)
- [ ] Adjust border color to `border-accent/20`
- [ ] Update shadow to `shadow-elevation-medium`
- [ ] Test feel on both desktop and touch devices
- [ ] Verify animations respect `prefers-reduced-motion`

**Expected Outcome**: +22% perceived performance, smoother interactions

---

## 📈 P2: Polish & Optimization (Week 4)

### 6. Modern Focus Indicators (Section 6B)
**File**: `src/styles/global.css`
**Impact**: Medium | **Effort**: Low

- [ ] Replace dashed outline with modern ring approach
- [ ] Implement triple-layer box-shadow focus style
- [ ] Add glow effect with accent color opacity
- [ ] Set 3px background ring, 5px accent ring
- [ ] Add 20px glow with 30% opacity
- [ ] Include border-radius for smoother appearance
- [ ] Add 200ms ease-out transition
- [ ] Ensure reduced-motion compatibility (0.01ms duration)
- [ ] Test focus visibility on all interactive elements

**Expected Outcome**: Enhanced accessibility score, modern visual feel

---

### 7. Enhanced Link Affordance (Section 6C)
**File**: `src/styles/typography.css`
**Impact**: Medium | **Effort**: Low

- [ ] Update prose link styles with underline
- [ ] Set decoration to `accent/40` with 2px thickness
- [ ] Add 2px underline offset
- [ ] Implement hover transition to full accent color
- [ ] Add focus-visible ring styles
- [ ] Ensure ring offset is 2px
- [ ] Test with keyboard navigation
- [ ] Verify color contrast of underlines

**Expected Outcome**: Better link discoverability, improved content navigation

---

### 8. Skeleton Loading Pattern (Section 7A)
**Files**: New `src/components/sections/CardSkeleton.astro`
**Impact**: Medium | **Effort**: Medium

- [ ] Create CardSkeleton.astro component
- [ ] Implement animate-pulse utility
- [ ] Match card dimensions and aspect ratio
- [ ] Add muted background shimmer effect
- [ ] Create placeholder for image (aspect-video)
- [ ] Create placeholders for title and meta (varying widths)
- [ ] Update index/archive pages to show skeletons during load
- [ ] Test loading perception improvement
- [ ] Measure LCP impact

**Expected Outcome**: +18% perceived speed, reduced layout shift

---

## 🚀 P3: Advanced Features (Week 5+)

### 9. Spacing System Implementation (Section 3A)
**Files**: `src/styles/global.css`, all components
**Impact**: Medium | **Effort**: Medium

- [ ] Implement 8pt spacing scale in CSS variables
- [ ] Define --space-0 through --space-10
- [ ] Update content width variables (65ch → 72ch)
- [ ] Add article-specific width (75ch)
- [ ] Add narrow width for quotes (60ch)
- [ ] Update Card component padding (p-3/p-4 → p-4/p-6)
- [ ] Audit all components for spacing consistency
- [ ] Replace arbitrary spacing with scale values
- [ ] Test visual consistency across pages

**Expected Outcome**: +20% visual consistency, better scannability

---

### 10. Bottom Navigation for Mobile (Section 8A)
**Files**: New `src/components/sections/BottomNav.astro`
**Impact**: Medium | **Effort**: Medium

- [ ] Create BottomNav.astro component
- [ ] Implement fixed bottom positioning
- [ ] Add backdrop-blur and safe-area-bottom support
- [ ] Create 5-item grid layout
- [ ] Ensure 56px minimum touch target height
- [ ] Add icons and labels for top 5 nav items
- [ ] Implement active state indicator
- [ ] Add active scale feedback (scale-95)
- [ ] Test on iPhone SE and other small screens
- [ ] Verify no conflict with floating action buttons

**Expected Outcome**: +40% mobile engagement, < 1% tap error rate

---

## 📋 Secondary Improvements (Future Backlog)

### Enhanced Action Buttons (Section 4B)
**File**: `src/components/sections/Navigation.astro`

- [ ] Show labels on desktop for search/archives
- [ ] Implement rounded-full pill design
- [ ] Add icon + text layout with gap-2
- [ ] Style with bg-surface2/surface3 hover

---

### Smart Badge Positioning (Section 5B)
**File**: `src/components/sections/Card.astro`

- [ ] Add content-aware badge positioning
- [ ] Position at `bottom-3` when heroImage present
- [ ] Position at `top-3` when no heroImage
- [ ] Add backdrop-filter with saturate(180%)

---

### CTA Loading State (Section 5C)
**File**: `src/components/sections/Card.astro`

- [ ] Add loading spinner to "Weiterlesen" button
- [ ] Implement group-active:inline-block pattern
- [ ] Use tabler:loader-2 with animate-spin
- [ ] Add arrow translation on hover

---

### Mega Menu Implementation (Section 4C)
**Files**: New `src/components/sections/MegaMenu.astro`

- [ ] Design mega menu layout for categories
- [ ] Create 3-column grid for health topics
- [ ] Add category icons and descriptions
- [ ] Implement backdrop-blur and elevation
- [ ] Add hover states for menu items
- [ ] Test keyboard navigation through menu

---

### Touch Optimizations (Section 8B)
**File**: `src/components/sections/Card.astro`

- [ ] Add media query for touch devices
- [ ] Disable hover animations on touch
- [ ] Implement tap feedback (scale-98)
- [ ] Reduce transition to 100ms for active state

---

### Swipe Gestures (Section 8C)
**File**: `src/layouts/Layout.astro`

- [ ] Add touchstart/touchend listeners
- [ ] Implement swipe detection (100px threshold)
- [ ] Enable prev/next article navigation
- [ ] Test on iOS and Android devices

---

### Intersection Observer for Cards (Section 7C)
**File**: `src/components/sections/Card.astro`

- [ ] Implement IntersectionObserver for lazy animations
- [ ] Set 50px rootMargin and 0.1 threshold
- [ ] Add 'visible' class on intersection
- [ ] Unobserve after triggering
- [ ] Test animation performance impact

---

### Critical Image Optimization (Section 7B)
**File**: `src/pages/index.astro`

- [ ] Add preload links for critical images
- [ ] Set fetchpriority="high"
- [ ] Add proper imagesizes attribute
- [ ] Test LCP improvement

---

## 📊 Testing Checklist

### Accessibility Testing
- [ ] NVDA screen reader (Windows)
- [ ] JAWS screen reader (Windows)
- [ ] VoiceOver (macOS/iOS)
- [ ] Keyboard-only navigation
- [ ] High contrast mode
- [ ] Reduced motion preferences
- [ ] Color blindness simulation (Deuteranopia, Protanopia, Tritanopia)

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Performance Testing
- [ ] Lighthouse audit (target: 98+)
- [ ] Core Web Vitals (LCP < 1.8s, FID < 100ms, CLS < 0.05)
- [ ] WebPageTest with 3G throttling
- [ ] Real device testing

---

## 🎯 Success Metrics

### Performance Targets
- **LCP**: < 1.8s (currently measuring)
- **FID**: < 100ms
- **CLS**: < 0.05
- **TTI**: < 3s

### Accessibility Targets
- **Lighthouse A11y**: 100/100
- **Keyboard Navigation**: 100% success rate
- **Contrast Ratio**: All text 7:1+ (AAA)

### Engagement Targets
- **Bounce Rate**: < 40%
- **Session Duration**: > 3 minutes
- **Pages/Session**: > 2.5
- **Mobile Engagement**: +35-40% increase

---

## 📝 Implementation Notes

### Commit Strategy
- Commit after each completed P0/P1 task
- Use descriptive commit messages with impact description
- Reference this file in commits: "UIX_TODOS.md: Mark [task] as complete"

### Testing Protocol
1. Test locally after each change
2. Verify no regressions in existing functionality
3. Run `bun run lint` and `bun run test`
4. Test in at least 2 browsers before committing
5. Validate accessibility with keyboard navigation

### File References
- All section numbers reference `UIX_IMPROVEMENTS.md`
- Line numbers are approximate and may shift during implementation
- Always verify current code structure before making changes

---

**Next Action**: Start with P0 Task 1 (Color System & Contrast)
