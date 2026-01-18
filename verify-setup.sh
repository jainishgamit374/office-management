#!/bin/bash

# Build & Upload Setup Verification Script
# This script checks if everything is ready for building and uploading

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   Build & Upload Setup Verification           ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Installed ($NODE_VERSION)${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
    echo "  Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ Installed ($NPM_VERSION)${NC}"
else
    echo -e "${RED}✗ Not installed${NC}"
    exit 1
fi

# Check EAS CLI
echo -n "Checking EAS CLI... "
if command -v eas &> /dev/null; then
    EAS_VERSION=$(eas --version)
    echo -e "${GREEN}✓ Installed ($EAS_VERSION)${NC}"
else
    echo -e "${YELLOW}⚠ Not installed${NC}"
    echo ""
    echo -e "${BLUE}Would you like to install EAS CLI now? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "Installing EAS CLI..."
        npm install -g eas-cli
        echo -e "${GREEN}✓ EAS CLI installed successfully${NC}"
    else
        echo -e "${YELLOW}⚠ You'll need to install EAS CLI before building${NC}"
        echo "  Run: npm install -g eas-cli"
    fi
fi

# Check if logged in to EAS
echo -n "Checking EAS login... "
if command -v eas &> /dev/null; then
    if eas whoami &> /dev/null; then
        EAS_USER=$(eas whoami 2>/dev/null)
        echo -e "${GREEN}✓ Logged in as $EAS_USER${NC}"
    else
        echo -e "${YELLOW}⚠ Not logged in${NC}"
        echo ""
        echo -e "${BLUE}Would you like to login now? (y/n)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            eas login
        else
            echo -e "${YELLOW}⚠ You'll need to login before building${NC}"
            echo "  Run: eas login"
        fi
    fi
else
    echo -e "${YELLOW}⚠ EAS CLI not installed${NC}"
fi

# Check app.json
echo -n "Checking app.json... "
if [ -f "app.json" ]; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${RED}✗ Not found${NC}"
    exit 1
fi

# Check eas.json
echo -n "Checking eas.json... "
if [ -f "eas.json" ]; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${RED}✗ Not found${NC}"
    exit 1
fi

# Check package.json
echo -n "Checking package.json... "
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓ Found${NC}"
else
    echo -e "${RED}✗ Not found${NC}"
    exit 1
fi

# Check build scripts
echo -n "Checking build scripts... "
if grep -q "build:android:preview" package.json; then
    echo -e "${GREEN}✓ Configured${NC}"
else
    echo -e "${RED}✗ Not configured${NC}"
fi

# Check build-upload.sh
echo -n "Checking build-upload.sh... "
if [ -f "build-upload.sh" ]; then
    if [ -x "build-upload.sh" ]; then
        echo -e "${GREEN}✓ Found and executable${NC}"
    else
        echo -e "${YELLOW}⚠ Found but not executable${NC}"
        chmod +x build-upload.sh
        echo -e "${GREEN}✓ Made executable${NC}"
    fi
else
    echo -e "${RED}✗ Not found${NC}"
fi

# Display project info
echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   Project Information                          ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

if [ -f "app.json" ]; then
    PROJECT_NAME=$(grep '"name"' app.json | head -1 | sed 's/.*"name": "\(.*\)".*/\1/')
    PROJECT_SLUG=$(grep '"slug"' app.json | sed 's/.*"slug": "\(.*\)".*/\1/')
    PROJECT_VERSION=$(grep '"version"' app.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
    PROJECT_OWNER=$(grep '"owner"' app.json | sed 's/.*"owner": "\(.*\)".*/\1/')
    
    echo "  Name: $PROJECT_NAME"
    echo "  Slug: $PROJECT_SLUG"
    echo "  Version: $PROJECT_VERSION"
    echo "  Owner: $PROJECT_OWNER"
fi

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║   Available Commands                           ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "  npm run build:menu              - Interactive menu"
echo "  npm run build:android:preview   - Build APK for testing"
echo "  npm run build:android:production - Build AAB for Play Store"
echo "  npm run build:status            - View build list"
echo ""

echo "╔════════════════════════════════════════════════╗"
echo "║   Next Steps                                   ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

if command -v eas &> /dev/null && eas whoami &> /dev/null; then
    echo -e "${GREEN}✓ You're ready to build!${NC}"
    echo ""
    echo "To start building:"
    echo "  1. Run: npm run build:menu"
    echo "  2. Or: npm run build:android:preview"
    echo ""
else
    echo -e "${YELLOW}⚠ Setup incomplete${NC}"
    echo ""
    if ! command -v eas &> /dev/null; then
        echo "  1. Install EAS CLI: npm install -g eas-cli"
    fi
    if command -v eas &> /dev/null && ! eas whoami &> /dev/null; then
        echo "  2. Login to EAS: eas login"
    fi
    echo "  3. Then run: npm run build:menu"
    echo ""
fi

echo "For detailed documentation, see:"
echo "  - BUILD_UPLOAD_SETUP.md (Quick overview)"
echo "  - BUILD_AND_UPLOAD_GUIDE.md (Comprehensive guide)"
echo "  - QUICK_BUILD_REFERENCE.md (Command reference)"
echo ""
