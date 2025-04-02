#!/bin/bash

# WordPress to Markdown Exporter Setup Script

# Print colored messages
print_info() {
  echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
  echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_error() {
  echo -e "\033[1;31m[ERROR]\033[0m $1"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  print_error "npm is not installed. Please install Node.js and npm first."
  exit 1
fi

# Install dependencies
print_info "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
  print_error "Failed to install dependencies."
  exit 1
fi

# Build the project
print_info "Building the project..."
npm run build

if [ $? -ne 0 ]; then
  print_error "Failed to build the project."
  exit 1
fi

# Make the CLI executable
print_info "Making the CLI executable..."
chmod +x dist/cli/index.js

if [ $? -ne 0 ]; then
  print_error "Failed to make the CLI executable."
  exit 1
fi

print_success "Setup complete! You can now use the WordPress to Markdown Exporter."
print_info "Run 'node dist/index.js --help' for usage information."
