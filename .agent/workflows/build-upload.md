---
description: Build and upload the app to stores
---

# Build and Upload Workflow

This workflow guides you through building and uploading your Office Management app to app stores.

## Prerequisites

1. **Install EAS CLI** (if not already installed)
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

## Build Process

### For Testing (Android APK)

// turbo
1. **Build preview APK**
   ```bash
   npm run build:android:preview
   ```

2. **Monitor build progress**
   - Check terminal for build URL
   - Or visit: https://expo.dev/accounts/jainishgamit/projects/karmayoginfinitesofttech/builds

3. **Download and test**
   - Download APK when build completes
   - Install on Android device for testing

### For Production (Google Play Store)

1. **Update version number**
   - Edit `app.json`
   - Increment `version` and `android.versionCode`

2. **Test thoroughly**
   ```bash
   npm test
   npm run android
   ```

3. **Build production AAB**
   ```bash
   npm run build:android:production
   ```

4. **Wait for build to complete**
   - Monitor at Expo dashboard
   - Download AAB file when ready

5. **Submit to Play Store**
   ```bash
   npm run submit:android
   ```
   Or manually upload AAB to Google Play Console

### For iOS App Store

1. **Update version number**
   - Edit `app.json`
   - Increment `version` and `ios.buildNumber`

2. **Build production**
   ```bash
   npm run build:ios:production
   ```

3. **Submit to App Store**
   ```bash
   npm run submit:ios
   ```

## Interactive Menu

For a guided experience, use the interactive menu:

// turbo
```bash
npm run build:menu
```

This provides a menu-driven interface for all build and upload operations.

## Quick Commands

- **View builds:** `npm run build:status`
- **Android preview:** `npm run build:android:preview`
- **Android production:** `npm run build:android:production`
- **Submit Android:** `npm run submit:android`
- **Submit iOS:** `npm run submit:ios`

## Troubleshooting

If build fails:
1. Check build logs: `eas build:view <build-id> --logs`
2. Verify `app.json` and `eas.json` are valid
3. Ensure all dependencies are installed
4. Try clearing cache: `eas build --clear-cache`

## Documentation

For detailed information, see:
- `BUILD_AND_UPLOAD_GUIDE.md` - Comprehensive guide
- `QUICK_BUILD_REFERENCE.md` - Quick command reference
