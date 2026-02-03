# 🚀 Deployment Guide

This guide covers how to build and deploy the Office Management app using EAS (Expo Application Services).

## Prerequisites

1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

## Initial Setup

If this is your first time deploying, configure EAS for your project:

```bash
npx eas build:configure
```

## Building the App

### Preview Build (APK for Testing)

```bash
npx eas build -p android --profile preview
```

### Production Build (AAB for Play Store)

```bash
npx eas build -p android --profile production
```

### iOS Builds

```bash
# Preview
npx eas build -p ios --profile preview

# Production
npx eas build -p ios --profile production
```

## Over-the-Air (OTA) Updates

EAS Update allows you to push JavaScript and asset changes **without creating a new build**. Use this for quick bug fixes and minor updates.

### Common EAS Update Commands

| Action | Command |
|--------|---------|
| Push update to preview | `eas update --branch preview --message "fix: bug fix"` |
| Push update to production | `eas update --branch production --message "fix: bug fix"` |
| View update history | `eas update:list` |
| Rollback update | `eas update:rollback --channel preview` |

### When to Use OTA Updates vs New Build

| Scenario | Method |
|----------|--------|
| JavaScript/TypeScript code changes | OTA Update |
| Styling and UI changes | OTA Update |
| Asset changes (images, fonts) | OTA Update |
| Adding/removing native dependencies | New Build |
| Changing `app.json` configuration | New Build |
| Updating Expo SDK version | New Build |

## Workflow Commands

You can also use the built-in npm scripts:

```bash
# View all builds
npm run build:status

# Preview builds
npm run build:android:preview
npm run build:ios:preview

# Production builds
npm run build:android:production
npm run build:ios:production

# Submit to stores
npm run submit:android
npm run submit:ios

# Interactive menu
npm run build:menu
```

## Troubleshooting

If a build fails:

1. **Check build logs**: 
   ```bash
   eas build:view <build-id> --logs
   ```

2. **Verify configuration**:
   - Ensure `app.json` and `eas.json` are valid
   - Check all dependencies are installed

3. **Clear cache and rebuild**:
   ```bash
   eas build --clear-cache
   ```

## Related Documentation

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- `BUILD_AND_UPLOAD_GUIDE.md` - Comprehensive build guide
- `QUICK_BUILD_REFERENCE.md` - Quick command reference


npx eas build -p android --profile preview; 
npx eas build -p android --profile production; 
npx eas build -p ios --profile preview; 
npx eas build -p ios --profile production; 
npx eas build:configure;  