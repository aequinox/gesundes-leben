# Reference Templates

This directory contains templates for creating new scientific references. Each template includes the required and optional fields for different reference types.

## Available Templates

### 📄 Journal Article (`journal.yaml`)

For peer-reviewed academic papers published in scientific journals.

**Required fields:**

- `type`: "journal"
- `title`: Article title
- `authors`: List of author names
- `year`: Publication year
- `journal`: Journal name

**Optional fields:**

- `volume`: Journal volume number
- `issue`: Journal issue number
- `pages`: Page range (e.g., "123-145")
- `doi`: Digital Object Identifier
- `url`: Direct link to article
- `pmid`: PubMed ID
- `keywords`: List of relevant keywords
- `abstract`: Brief description of the article

### 🌐 Website (`website.yaml`)

For online articles, blog posts, and web-based resources.

**Required fields:**

- `type`: "website"
- `title`: Page/article title
- `authors`: List of author names
- `year`: Publication year
- `url`: Direct link to the resource

**Optional fields:**

- `keywords`: List of relevant keywords
- `abstract`: Brief description of the content

### 📖 Book (`book.yaml`)

For published books, textbooks, and monographs.

**Required fields:**

- `type`: "book"
- `title`: Book title
- `authors`: List of author names
- `year`: Publication year
- `publisher`: Publishing company

**Optional fields:**

- `location`: Publication location/city
- `edition`: Edition information (e.g., "3rd Edition")
- `isbn`: International Standard Book Number
- `url`: Link to book information or online version
- `keywords`: List of relevant keywords
- `abstract`: Brief description of the book

## Usage

1. Copy the appropriate template file
2. Rename it using the naming convention: `YEAR-FIRSTAUTHOR-TITLE-KEYWORDS.yaml`
3. Fill in all required fields
4. Add optional fields as needed
5. Save the file in `src/data/references/`

## Naming Convention

Reference files should follow this pattern:

```
YEAR-FIRSTAUTHOR-TITLE-KEYWORDS.yaml
```

Examples:

- `2024-smith-vitamin-c-deficiency-meta-analysis.yaml`
- `2023-mueller-omega3-cardiovascular-benefits.yaml`
- `2022-jones-intermittent-fasting-health-outcomes.yaml`

## Validation

After creating a reference file, you can validate it using:

```bash
bun run refs:validate
```

This will check for:

- Required field completeness
- Data format correctness
- Potential duplicates
- Field-specific validation (URLs, DOIs, etc.)

## Management

Use the reference management CLI for common operations:

```bash
# Add new reference interactively
bun run refs:manage add --type journal

# List all references
bun run refs:list

# Search references
bun run refs:manage search "vitamin c"

# Show reference details
bun run refs:manage show 2024-smith-vitamin-c-benefits
```
