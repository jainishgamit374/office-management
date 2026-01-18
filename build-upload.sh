#!/bin/bash

# Office Management App - Build & Upload Script
# This script helps you build and upload your app to app stores

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Function to check if EAS CLI is installed
check_eas_cli() {
    if ! command -v eas &> /dev/null; then
        print_error "EAS CLI is not installed"
        print_info "Installing EAS CLI..."
        npm install -g eas-cli
        print_success "EAS CLI installed successfully"
    else
        print_success "EAS CLI is already installed"
    fi
}

# Function to check if user is logged in
check_eas_login() {
    if ! eas whoami &> /dev/null; then
        print_warning "You are not logged in to EAS"
        print_info "Please login..."
        eas login
    else
        print_success "You are logged in to EAS as: $(eas whoami)"
    fi
}

# Function to display menu
show_menu() {
    echo ""
    echo "╔════════════════════════════════════════════════╗"
    echo "║   Office Management - Build & Upload Menu     ║"
    echo "╚════════════════════════════════════════════════╝"
    echo ""
    echo "  Build Options:"
    echo "  1) Build Android Preview (APK for testing)"
    echo "  2) Build Android Production (AAB for Play Store)"
    echo "  3) Build iOS Preview"
    echo "  4) Build iOS Production"
    echo "  5) Build All Platforms (Production)"
    echo ""
    echo "  Submit Options:"
    echo "  6) Submit to Google Play Store"
    echo "  7) Submit to Apple App Store"
    echo ""
    echo "  Utilities:"
    echo "  8) View Build List"
    echo "  9) Check Build Status"
    echo "  10) Update Version Number"
    echo "  11) View Project Info"
    echo ""
    echo "  0) Exit"
    echo ""
}

# Function to build Android preview
build_android_preview() {
    print_info "Building Android Preview (APK)..."
    eas build --platform android --profile preview
    print_success "Build initiated! Check your Expo dashboard for progress."
}

# Function to build Android production
build_android_production() {
    print_info "Building Android Production (AAB)..."
    print_warning "Make sure you've updated the version number!"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        eas build --platform android --profile production
        print_success "Build initiated! Check your Expo dashboard for progress."
    fi
}

# Function to build iOS preview
build_ios_preview() {
    print_info "Building iOS Preview..."
    eas build --platform ios --profile preview
    print_success "Build initiated! Check your Expo dashboard for progress."
}

# Function to build iOS production
build_ios_production() {
    print_info "Building iOS Production..."
    print_warning "Make sure you've updated the version number!"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        eas build --platform ios --profile production
        print_success "Build initiated! Check your Expo dashboard for progress."
    fi
}

# Function to build all platforms
build_all_platforms() {
    print_info "Building All Platforms (Production)..."
    print_warning "Make sure you've updated the version number!"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        eas build --platform all --profile production
        print_success "Build initiated! Check your Expo dashboard for progress."
    fi
}

# Function to submit to Google Play Store
submit_android() {
    print_info "Submitting to Google Play Store..."
    print_warning "Make sure you have configured your Google Service Account!"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        eas submit --platform android --latest
    fi
}

# Function to submit to Apple App Store
submit_ios() {
    print_info "Submitting to Apple App Store..."
    print_warning "Make sure you have your Apple credentials ready!"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        eas submit --platform ios --latest
    fi
}

# Function to view build list
view_builds() {
    print_info "Fetching build list..."
    eas build:list
}

# Function to check build status
check_build_status() {
    print_info "Enter build ID (or press Enter to view latest):"
    read build_id
    if [ -z "$build_id" ]; then
        eas build:list --limit 1
    else
        eas build:view "$build_id"
    fi
}

# Function to update version
update_version() {
    print_info "Current version info from app.json:"
    grep -A 2 '"version"' app.json
    echo ""
    print_warning "Please update version manually in app.json"
    print_info "Opening app.json..."
    ${EDITOR:-nano} app.json
}

# Function to view project info
view_project_info() {
    print_info "Project Information:"
    echo ""
    echo "  Project Name: $(grep '"name"' app.json | head -1 | cut -d'"' -f4)"
    echo "  Slug: $(grep '"slug"' app.json | cut -d'"' -f4)"
    echo "  Version: $(grep '"version"' app.json | head -1 | cut -d'"' -f4)"
    echo "  Owner: $(grep '"owner"' app.json | cut -d'"' -f4)"
    echo "  Package: $(grep '"package"' app.json | cut -d'"' -f4)"
    echo ""
    print_info "Expo Dashboard: https://expo.dev/accounts/jainishgamit/projects/karmayoginfinitesofttech"
}

# Main script
main() {
    clear
    print_success "Office Management Build & Upload Tool"
    
    # Check prerequisites
    check_eas_cli
    check_eas_login
    
    # Main loop
    while true; do
        show_menu
        read -p "Select an option: " choice
        
        case $choice in
            1) build_android_preview ;;
            2) build_android_production ;;
            3) build_ios_preview ;;
            4) build_ios_production ;;
            5) build_all_platforms ;;
            6) submit_android ;;
            7) submit_ios ;;
            8) view_builds ;;
            9) check_build_status ;;
            10) update_version ;;
            11) view_project_info ;;
            0) 
                print_success "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main
