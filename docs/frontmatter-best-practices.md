# Blog Post Frontmatter Best Practices

## Overview

This document outlines the correct structure for blog post frontmatter to ensure proper parsing of metadata, especially for scientific references.

## Correct Frontmatter Structure

All blog posts should follow this structure:

```yaml
---
id: "unique-uuid"
title: "Article Title"
author: "author-name"
pubDatetime: "2024-01-01T00:00:00.000Z"
modDatetime: "2024-01-01T00:00:00.000Z"
description: "Article description"
keywords:
  - keyword1
  - keyword2
categories:
  - Category1
  - Category2
group: "pro"
tags:
  - tag1
  - tag2
heroImage:
  src: ./images/image.jpg
  alt: "Image description"
references:
  - "reference-id-1"
  - "reference-id-2"
draft: false
featured: false
---
```

## Critical Rules

### 1. Exactly Two Delimiters
- **Opening**: `---` at the very beginning of the file (line 1)
- **Closing**: `---` after all frontmatter fields, before article content
- **Never** add extra `---` delimiters within the frontmatter

### 2. References Placement
- References MUST be in the frontmatter, not in the article content
- Format: Array of reference IDs as shown above
- Place references before `draft` and `featured` fields

### 3. Common Mistakes to Avoid

❌ **Wrong - Extra delimiter:**
```yaml
---
title: "Article Title"
draft: false
---  # ← This breaks parsing!

import Image from "@/components/elements/Image.astro";
```

❌ **Wrong - References in content:**
```markdown
Article content here...

references:
  - "some-reference"
draft: false
featured: false
---
```

✅ **Correct structure:**
```yaml
---
title: "Article Title"
references:
  - "some-reference"
draft: false
featured: false
---

import Image from "@/components/elements/Image.astro";
```

## Validation Tools

### 1. Automatic Validation
Run the validation script before publishing:
```bash
./scripts/validate-frontmatter.sh
```

### 2. Fix Script
If validation fails, run the fix script:
```bash
./scripts/fix-frontmatter-references.sh
```

### 3. Content Sync Check
Always verify after changes:
```bash
bun run sync
```

## Symptoms of Incorrect Frontmatter

If you see these issues, check your frontmatter:

1. **Raw YAML text displayed on webpage**: 
   - `references: "reference-id" draft: false featured: false`
   - Indicates frontmatter is being treated as content

2. **Missing "Wissenschaftliche Quellen" section**:
   - References component not receiving data
   - References likely in wrong location

3. **Build errors or content sync failures**:
   - Malformed YAML structure
   - Check delimiter count and syntax

## Reference System Integration

### Reference IDs
- Must match YAML files in `src/data/references/`
- Format: `year-author-topic-keywords`
- Example: `2023-smith-nutrition-health`

### Component Rendering
When frontmatter is correct, the References component will:
1. Load reference data from YAML files
2. Display "Wissenschaftliche Quellen" heading
3. Show numbered reference list with proper formatting
4. Include links, DOIs, and metadata

## Quick Checklist

Before publishing any blog post:

- [ ] Exactly 2 `---` delimiters
- [ ] References in frontmatter (not content)
- [ ] All reference IDs exist in `src/data/references/`
- [ ] Run `./scripts/validate-frontmatter.sh`
- [ ] Run `bun run sync` without errors
- [ ] Test in browser - should see "Wissenschaftliche Quellen"

## Recovery

If you accidentally break a post:
1. Backups are automatically created in `/tmp/frontmatter-backup-*`
2. Use git to revert changes: `git checkout HEAD -- path/to/post.mdx`
3. Or restore from backup and reapply fix script