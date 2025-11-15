# Hugo Setup Guide for Gesundes Leben

## Prerequisites

### 1. Install Hugo Extended

Hugo Extended edition is required for this project (supports Sass/SCSS processing).

**Minimum Version**: v0.128.0 or later (recommended: v0.139.3+)

#### Installation Options:

**Linux:**
```bash
# Option 1: Download binary from GitHub (recommended)
cd /tmp
wget https://github.com/gohugoio/hugo/releases/download/v0.139.3/hugo_extended_0.139.3_linux-amd64.tar.gz
tar -xzf hugo_extended_0.139.3_linux-amd64.tar.gz
sudo mv hugo /usr/local/bin/
hugo version
```

**macOS:**
```bash
brew install hugo
```

**Windows:**
```bash
# Using Chocolatey
choco install hugo-extended

# Or download from: https://github.com/gohugoio/hugo/releases
```

### 2. Verify Installation

```bash
hugo version
# Should show: hugo v0.139.3+ with "extended" in the output
```

## Initial Project Setup

Once Hugo is installed, follow these steps:

### 1. Install Blowfish Theme

The project uses the Blowfish theme as a git submodule:

```bash
cd /home/user/gesundes-leben/hugo
git submodule add -b main https://github.com/nunocoracao/blowfish.git themes/blowfish
git submodule update --init --recursive
```

### 2. Test Development Server

```bash
cd /home/user/gesundes-leben/hugo
hugo server -D
```

The site should be available at: http://localhost:1313

### 3. Build for Production

```bash
hugo --minify
```

Output will be in the `public/` directory.

## Project Structure

The following structure has been created:

```
hugo/
├── archetypes/           # Content templates
│   ├── default.md
│   ├── blog.md
│   ├── authors.md
│   └── glossary.md
├── assets/              # Source files (CSS, JS, images)
│   └── css/
│       └── schemes/
├── content/             # All markdown content
│   ├── blog/           # Blog posts
│   ├── authors/        # Author profiles
│   ├── glossary/       # Health terms
│   └── pages/          # Static pages
├── data/               # YAML/JSON data files
│   └── references/     # Scientific references
├── i18n/               # Translations
│   └── de.yaml
├── layouts/            # Custom templates
│   ├── _default/
│   ├── blog/
│   ├── partials/
│   └── shortcodes/
├── static/             # Static assets (copied as-is)
│   ├── images/
│   └── fonts/
├── themes/
│   └── blowfish/       # Theme (git submodule)
├── config/
│   └── _default/       # Configuration files
│       ├── hugo.toml
│       ├── params.toml
│       ├── menus.de.toml
│       └── languages.toml
└── hugo.toml          # Main configuration
```

## Next Steps

1. Install Hugo Extended (see above)
2. Install Blowfish theme as submodule
3. Review configuration in `config/_default/`
4. Run migration scripts (in `scripts/` directory)
5. Test with `hugo server`
6. Build with `hugo --minify`

## Troubleshooting

### Hugo not found
- Ensure Hugo is in your PATH
- Verify installation with `hugo version`
- Make sure you have the **extended** edition

### Theme not loading
- Check that Blowfish submodule is initialized: `git submodule update --init`
- Verify `theme = "blowfish"` in `hugo.toml`

### Build errors
- Ensure you're using Hugo Extended (not regular Hugo)
- Check Hugo version is >= 0.128.0
- Review error messages for missing dependencies

## Resources

- **Hugo Documentation**: https://gohugo.io/documentation/
- **Blowfish Theme**: https://blowfish.page/
- **Action Plan**: See `ACTIONPLAN.md` for complete migration roadmap
