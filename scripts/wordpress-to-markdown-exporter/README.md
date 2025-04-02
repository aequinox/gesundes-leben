# WordPress to Markdown Exporter

A TypeScript tool to convert WordPress export XML to Markdown for Astro.

## Features

- Convert WordPress export XML to Markdown
- Download and save images
- Generate frontmatter for Astro content collections
- Interactive configuration wizard
- Command-line interface
- TypeScript type safety
- Service-oriented architecture

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd wordpress-to-markdown-exporter

# Install dependencies
npm install

# Build the project
npm run build

# Link the CLI globally (optional)
npm link
```

## Usage

### Command Line Interface

```bash
# Using npx
npx wordpress-to-markdown-exporter --input export.xml --output output

# If linked globally
wordpress-to-markdown-exporter --input export.xml --output output
```

### Interactive Wizard

```bash
# Start the interactive wizard
npx wordpress-to-markdown-exporter
```

### Options

| Option | Description | Default |
| ------ | ----------- | ------- |
| `-i, --input <path>` | Path to WordPress export XML file | `export.xml` |
| `-o, --output <path>` | Path to output directory | `output` |
| `-y, --year-folders` | Create year folders | `false` |
| `-m, --month-folders` | Create month folders | `false` |
| `-p, --post-folders` | Create a folder for each post | `true` |
| `-d, --prefix-date` | Prefix post folders/files with date | `false` |
| `-a, --save-attached-images` | Save images attached to posts | `true` |
| `-s, --save-scraped-images` | Save images scraped from post body content | `true` |
| `-t, --include-other-types` | Include custom post types and pages | `false` |
| `-w, --wizard` | Use interactive wizard | `true` |
| `--no-wizard` | Skip interactive wizard | |
| `--strict-ssl` | Enforce strict SSL when downloading images | `true` |
| `--no-strict-ssl` | Disable strict SSL when downloading images | |

## Astro Integration

This tool is designed to work seamlessly with Astro content collections. By default, it will:

1. Generate Markdown files with frontmatter compatible with Astro
2. Structure output to work with Astro's content collections
3. Optimize images for Astro's image optimization

## Architecture

The project follows a service-oriented architecture with dependency injection:

- **Domain Models**: Define the data structures
- **Services**: Implement the business logic
- **Interfaces**: Define the contracts between services
- **Utils**: Provide utility functions

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the project
npm run build

# Run tests
npm test
```

## License

MIT
