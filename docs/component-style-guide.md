# Component Style Guide for Content Team

This guide provides best practices for using enhanced components in the Healthy Life blog. All components are designed to improve user experience, accessibility, and SEO performance.

## Available Components

### 1. List Component (`@/components/elements/List.astro`)

**Purpose**: Enhanced lists with better styling and accessibility

**Usage**:
```astro
import List from "@/components/elements/List.astro";

<List items={[
  "First item",
  "Second item", 
  "Third item"
]} />
```

**Best Practices**:
- Use for symptom lists, warning signs, benefits, tips
- Keep items concise and parallel in structure
- Consider using for any bulleted content

**Examples**: Vitamin deficiency symptoms, health tips, ingredient lists

### 2. Blockquote Component (`@/components/elements/Blockquote.astro`)

**Purpose**: Professional quotes and expert tips with enhanced styling

**Usage**:
```astro
import Blockquote from "@/components/elements/Blockquote.astro";

<Blockquote 
  quote="Expert advice or important tip"
  author="Author Name"
  title="Title/Credentials"
/>
```

**Best Practices**:
- Use for "Therapeuten Tipp" sections
- Include author credentials for credibility
- Keep quotes focused and actionable
- Use for classical quotes from medical experts

**Examples**: Health expert advice, research insights, professional recommendations

### 3. Accordion Component (`@/components/elements/Accordion.astro`)

**Purpose**: Collapsible content sections for detailed information

**Usage**:
```astro
import Accordion from "@/components/elements/Accordion.astro";

<Accordion title="Warning: Important Information">
  Detailed content that can be expanded/collapsed
</Accordion>
```

**Best Practices**:
- Use for warnings, side effects, detailed explanations
- Keep titles clear and descriptive
- Don't overuse - reserve for supplementary information
- Great for technical details that shouldn't interrupt main flow

**Examples**: Supplement warnings, technical explanations, detailed research

### 4. Image Component (`@/components/elements/Image.astro`)

**Purpose**: Responsive, optimized images with professional styling

**Usage**:
```astro
import Image from "@/components/elements/Image.astro";

<Image
  src="./images/image-name.jpg"
  alt="Descriptive alt text"
  title="Optional image title"
  position="center|left|right|full"
  style="default|polaroid|bordered|floating|glass"
  effect="none|zoom|parallax|tilt"
  aspectRatio="auto|square|video|portrait|ultrawide"
  invert={false}
/>
```

**Position Options**:
- `center`: Centered with margin
- `left`: Float left with text wrap
- `right`: Float right with text wrap  
- `full`: Full width

**Style Options**:
- `default`: Clean, modern styling
- `polaroid`: Vintage photo frame (perfect for author photos)
- `bordered`: Simple border
- `floating`: Subtle shadow effect
- `glass`: Modern glass morphism

**Best Practices**:
- Always include descriptive alt text for accessibility
- Use `polaroid` style for author profile images
- Use `center` position for main content images
- Use `left`/`right` for smaller supporting images
- Add `invert={true}` for dark mode compatibility when needed

## Content Writing Guidelines

### Image Alt Text
- Be descriptive but concise
- Include context relevant to health content
- Mention key visual elements that support the article
- Example: "Frau hält Vitamin-D-Tabletten in der Hand vor sonnigem Fenster"

### Author Profile Images
Always use polaroid style for author photos:
```astro
<Image
  src="./images/autor-name-profilbild-gesundheitsexperte.png"
  alt="Name - Heilpraktiker und Gesundheitsexperte"
  position="center"
  style="polaroid"
/>
```

### Content Structure Best Practices
1. **Lists**: Convert bullet points to List components
2. **Expert Tips**: Use Blockquote for "Therapeuten Tipp" sections
3. **Warnings**: Use Accordion for supplement warnings or side effects
4. **Images**: Always use Image component, never markdown syntax

## Migration Checklist

When editing existing posts:
- [ ] Replace `![alt](image.jpg)` with Image components
- [ ] Convert bullet lists to List components
- [ ] Wrap expert tips in Blockquote components
- [ ] Use Accordion for collapsible warnings
- [ ] Ensure all images have proper alt text
- [ ] Test responsive behavior

## Performance Benefits

These components provide:
- **Lazy loading**: Images load only when needed
- **Responsive images**: Automatic sizing for different devices
- **Modern formats**: WebP/AVIF support with fallbacks
- **SEO optimization**: Proper semantic markup
- **Accessibility**: Screen reader compatible
- **Visual consistency**: Professional, cohesive design

## Technical Notes

### Import Statements
Add imports at the top of your MDX files:
```astro
import Image from "@/components/elements/Image.astro";
import List from "@/components/elements/List.astro";
import Blockquote from "@/components/elements/Blockquote.astro";
import Accordion from "@/components/elements/Accordion.astro";
```

### File Naming Convention
- Images: Use descriptive German names with hyphens
- Components: Use PascalCase imports
- Keep existing folder structure: `./images/filename.jpg`

## Examples from Existing Posts

### Successful List Usage
From "18 Warnzeichen für Nährstoffmangel":
```astro
<List items={[
  "Müdigkeit und Energiemangel",
  "Häufige Infekte und schwaches Immunsystem", 
  "Haarausfall und brüchige Nägel",
  "Konzentrationsschwierigkeiten"
]} />
```

### Effective Blockquote Usage
From expert tip sections:
```astro
<Blockquote 
  quote="Die Einnahme von Vitamin D3 sollte immer auf Basis des aktuellen Blutwerts erfolgen..."
  author="Kai Renner"
  title="Heilpraktiker, Biologe"
/>
```

### Professional Image Usage
Standard content images:
```astro
<Image
  src="./images/vitamin-d-sonne-gesundheit.jpg"
  alt="Person in der Sonne für natürliche Vitamin-D-Synthese"
  position="center"
/>
```

This component system ensures consistent, professional presentation while improving performance and accessibility across all blog content.