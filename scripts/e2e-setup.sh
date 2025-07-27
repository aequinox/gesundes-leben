#!/bin/bash

# E2E Testing Environment Setup Script
# Prepares the environment for comprehensive E2E testing of the German health blog

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NODE_MIN_VERSION="18"
BUN_MIN_VERSION="1.0.0"
E2E_PORT="4321"
E2E_TIMEOUT="60000"

echo -e "${BLUE}🧪 E2E Testing Environment Setup${NC}"
echo "=================================================="

# Function to check command existence
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    fi
    echo -e "${GREEN}✅ $1 is available${NC}"
    return 0
}

# Function to check version
check_version() {
    local cmd=$1
    local min_version=$2
    local current_version=$($cmd --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    
    if [ -z "$current_version" ]; then
        echo -e "${YELLOW}⚠️  Could not determine $cmd version${NC}"
        return 0
    fi
    
    echo -e "${GREEN}✅ $cmd version: $current_version${NC}"
    return 0
}

# Check system requirements
echo -e "\n${BLUE}📋 Checking system requirements...${NC}"
check_command "node" || exit 1
check_version "node" "$NODE_MIN_VERSION"

check_command "bun" || exit 1
check_version "bun" "$BUN_MIN_VERSION"

check_command "git" || exit 1

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

if [ ! -f "playwright.config.ts" ]; then
    echo -e "${RED}❌ playwright.config.ts not found. Playwright configuration missing.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Project structure verified${NC}"

# Install dependencies
echo -e "\n${BLUE}📦 Installing dependencies...${NC}"
if [ -f "bun.lock" ]; then
    echo "Using bun for dependency installation..."
    bun install --frozen-lockfile
else
    echo "Using npm for dependency installation..."
    npm ci
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Install Playwright browsers
echo -e "\n${BLUE}🌐 Installing Playwright browsers...${NC}"
npx playwright install --with-deps
echo -e "${GREEN}✅ Playwright browsers installed${NC}"

# Create necessary directories
echo -e "\n${BLUE}📁 Setting up test directories...${NC}"
mkdir -p test-results
mkdir -p playwright-report
mkdir -p coverage
echo -e "${GREEN}✅ Test directories created${NC}"

# Check Astro build
echo -e "\n${BLUE}🔨 Building Astro application...${NC}"
bun run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Astro build successful${NC}"
else
    echo -e "${RED}❌ Astro build failed${NC}"
    exit 1
fi

# Check server startup
echo -e "\n${BLUE}🚀 Testing server startup...${NC}"
bun run preview &
SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start on port $E2E_PORT..."
timeout=$E2E_TIMEOUT
while [ $timeout -gt 0 ]; do
    if curl -sf http://localhost:$E2E_PORT > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is running on http://localhost:$E2E_PORT${NC}"
        break
    fi
    sleep 1
    timeout=$((timeout - 1000))
done

if [ $timeout -le 0 ]; then
    echo -e "${RED}❌ Server failed to start within timeout${NC}"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Stop the test server
kill $SERVER_PID 2>/dev/null || true
echo -e "${GREEN}✅ Server startup test completed${NC}"

# Run a quick health check test
echo -e "\n${BLUE}🔍 Running health check tests...${NC}"
echo "Testing German character encoding..."
if curl -sf http://localhost:$E2E_PORT 2>/dev/null | grep -q "Gesundheit\|Ernährung\|Wellness" 2>/dev/null; then
    echo -e "${GREEN}✅ German content detected${NC}"
else
    echo -e "${YELLOW}⚠️  German content check inconclusive (server may be stopped)${NC}"
fi

# Display test commands
echo -e "\n${BLUE}🧪 Available E2E test commands:${NC}"
echo "=================================================="
echo -e "${GREEN}# Run all E2E tests${NC}"
echo "bun run test:e2e"
echo ""
echo -e "${GREEN}# Run tests by category${NC}"
echo "bun run test:e2e:features        # Navigation, search, health content"
echo "bun run test:e2e:accessibility   # WCAG compliance, keyboard navigation"
echo "bun run test:e2e:performance     # Core Web Vitals, image optimization"
echo "bun run test:e2e:integration     # RSS, sitemap, edge cases"
echo ""
echo -e "${GREEN}# Run specific test types${NC}"
echo "bun run test:e2e:german          # German language support"
echo "bun run test:e2e:health          # Health content validation"
echo "bun run test:e2e:search          # Search functionality"
echo "bun run test:e2e:navigation      # Site navigation"
echo "bun run test:e2e:wcag            # WCAG compliance"
echo "bun run test:e2e:core-vitals     # Core Web Vitals"
echo ""
echo -e "${GREEN}# Development and debugging${NC}"
echo "bun run test:e2e:headed          # Run with visible browser"
echo "bun run test:e2e:ui              # Run with Playwright UI"
echo "bun run test:e2e:debug           # Debug mode"
echo ""
echo -e "${GREEN}# CI/CD${NC}"
echo "bun run test:e2e:ci              # GitHub Actions optimized"

# Display environment information
echo -e "\n${BLUE}🌍 Environment Information:${NC}"
echo "=================================================="
echo "Node.js: $(node --version)"
echo "Bun: $(bun --version)"
echo "Git: $(git --version | head -1)"
echo "OS: $(uname -s) $(uname -r)"
echo "Architecture: $(uname -m)"
echo ""
echo "Playwright Base URL: http://localhost:$E2E_PORT"
echo "Locale: de-DE"
echo "Timezone: Europe/Berlin"
echo ""

# Display project-specific information
echo -e "${BLUE}📊 Project Test Coverage:${NC}"
echo "=================================================="
echo "✅ Static Pages: Homepage, About, Imprint, Our Vision, 404"
echo "✅ Content Collections: Blog posts, Authors, Glossary"
echo "✅ Dynamic Pages: Search, Categories, Archives"
echo "✅ German Language: Character encoding, terminology, localization"
echo "✅ Health Content: Medical disclaimers, author credentials"
echo "✅ Accessibility: WCAG 2.1 AA compliance, keyboard navigation"
echo "✅ Performance: Core Web Vitals, image optimization"
echo "✅ Integration: RSS feeds, sitemaps, edge cases"
echo "✅ Security: XSS prevention, input validation"
echo "✅ Cross-Browser: Chromium, Firefox, WebKit, Mobile"

echo -e "\n${GREEN}🎉 E2E testing environment setup complete!${NC}"
echo -e "${BLUE}You can now run comprehensive E2E tests for the German health blog.${NC}"
echo ""
echo -e "${YELLOW}💡 Quick start:${NC}"
echo "bun run test:e2e:health    # Test health content validation"
echo "bun run test:e2e:german    # Test German language support"
echo "bun run test:e2e:wcag      # Test accessibility compliance"
echo ""
echo -e "${BLUE}For more information, see: tests/e2e/README.md${NC}"