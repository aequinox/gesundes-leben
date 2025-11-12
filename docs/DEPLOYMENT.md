# Deployment Guide

This document describes the deployment process and available deployment scripts for the Gesundes Leben project.

## Quick Start

```bash
# Full deployment with all checks
bun run deploy

# Deploy without running tests (faster)
bun run deploy:skip-tests

# Test deployment without pushing (dry run)
bun run deploy:dry-run
```

## Deployment Script

The project uses a TypeScript deployment script (`scripts/deploy.ts`) that provides:

- ✅ **Pre-deployment validation** - Ensures working tree is clean
- ✅ **Automated testing** - Runs tests before deployment (optional)
- ✅ **Build verification** - Builds project and verifies success
- ✅ **Deployment metadata** - Includes commit SHA and timestamp
- ✅ **Error recovery** - Automatic cleanup on failure
- ✅ **Dry run mode** - Test deployment without pushing

## Deployment Process

The deployment script executes the following steps:

### 1. Pre-deployment Checks ✓
- Verifies working tree is clean (no uncommitted changes)
- Confirms build directory exists
- Validates git repository state

### 2. Testing (Optional) ✓
- Runs unit and integration tests
- Can be skipped with `--skip-tests` flag

### 3. Build Project ✓
- Runs production build with `bun run build`
- Verifies build completes successfully

### 4. Branch Management ✓
- Cleans up old `gh-pages` branch if exists
- Creates fresh orphan branch

### 5. Commit Build Artifacts ✓
- Adds all files from `dist/` directory
- Creates commit with deployment metadata:
  - Commit SHA
  - Timestamp
  - Source branch
  - Test run status

### 6. Push to Remote ✓
- Force pushes to `github/gh-pages` branch
- Can be skipped in dry-run mode

### 7. Cleanup ✓
- Returns to original branch
- Removes temporary deployment branch
- Executes even if deployment fails

## Available Scripts

### Development
```bash
bun run dev              # Start development server
bun run preview          # Preview production build
```

### Build
```bash
bun run build            # Production build
bun run build:prod       # Build with type checking
bun run build:check      # Type checking + Astro check
```

### Code Quality
```bash
bun run quality:check    # Run all quality checks
bun run quality:fix      # Auto-fix linting and formatting
bun run lint             # Run ESLint
bun run lint:fix         # Fix ESLint issues
bun run format           # Format with Prettier
bun run type-check       # TypeScript type checking
```

### Testing
```bash
# Quick tests
bun run test:quick       # Unit + integration tests
bun run test:run         # All tests (no watch)

# Full test suites
bun run test:all         # All test suites
bun run test:unit        # Unit tests only
bun run test:integration # Integration tests
bun run test:component   # Component tests
bun run test:e2e         # E2E tests with Playwright

# Coverage
bun run test:coverage    # Generate coverage report
```

### Deployment
```bash
bun run deploy           # Full deployment (with tests)
bun run deploy:skip-tests # Deploy without tests
bun run deploy:dry-run   # Test deployment process
bun run predeploy        # Pre-deployment checks
```

### Performance
```bash
bun run perf             # Performance analysis
bun run perf:full        # Full performance suite
bun run perf:ci          # CI performance checks
bun run analyze          # Bundle analysis
```

### Validation
```bash
bun run validate         # Full validation (quality + tests + build)
bun run validate:full    # Comprehensive validation
```

## Deployment Configuration

The deployment script can be configured by editing `scripts/deploy.ts`:

```typescript
const config: DeployConfig = {
  remote: "github",           // Git remote name
  branch: "gh-pages",         // Deployment branch
  buildDir: "dist",           // Build output directory
  requireClean: true,         // Require clean working tree
  runTests: true,             // Run tests before deploy
  dryRun: false,              // Dry run mode
};
```

## Command-line Flags

The deploy script supports the following flags:

- `--skip-tests` - Skip running tests before deployment
- `--dry-run` - Run deployment process without pushing to remote
- `--help` - Show help message

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing (`bun run test:all`)
- [ ] No TypeScript errors (`bun run type-check`)
- [ ] No linting errors (`bun run lint`)
- [ ] Build succeeds (`bun run build`)
- [ ] Performance budgets met (`bun run perf:check`)
- [ ] Working tree is clean (no uncommitted changes)

## Troubleshooting

### Deployment Fails with "Working tree not clean"

**Solution:** Commit or stash your changes before deploying:
```bash
git status                 # Check what's uncommitted
git add .                  # Stage changes
git commit -m "Message"    # Commit changes
# OR
git stash                  # Temporarily stash changes
```

### Deployment Fails Mid-process

The script automatically cleans up and returns to your original branch. If cleanup fails:

```bash
# Manually return to main branch
git checkout main

# Delete deployment branch
git branch -D gh-pages
```

### Tests Fail During Deployment

**Option 1:** Fix the failing tests and redeploy
**Option 2:** Skip tests (not recommended for production)
```bash
bun run deploy:skip-tests
```

### Build Fails During Deployment

Check the build output for errors:
```bash
bun run build
# Fix any errors, then deploy again
```

## CI/CD Integration

For automated deployments in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run validate      # Run all checks
      - run: bun run deploy        # Deploy to gh-pages
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Best Practices

1. **Always test before deploying** - Use `bun run validate` to ensure everything works
2. **Use dry-run for testing** - Test deployment process with `--dry-run` flag
3. **Review deployment metadata** - Check commit message includes correct info
4. **Monitor deployments** - Watch for errors in deployment logs
5. **Keep builds clean** - Regularly clean old deployment branches

## Security Considerations

- Never commit sensitive data (API keys, tokens) to the build
- Ensure `.env` files are in `.gitignore`
- Review deployment commits before force-pushing
- Use GitHub secrets for CI/CD tokens

## Additional Resources

- [Astro Build Documentation](https://docs.astro.build/en/guides/deploy/)
- [GitHub Pages Setup](https://docs.github.com/en/pages)
- [Bun Package Manager](https://bun.sh/docs)
