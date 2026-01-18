# Build and Upload Guide for Office Management App

## Overview
This guide covers the complete process for building and uploading your Office Management application to app stores using Expo Application Services (EAS).

## Prerequisites

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```
Use your Expo account credentials (owner: jainishgamit)

### 3. Verify Project Configuration
Ensure your `app.json` and `eas.json` are properly configured (already done ✓)

---

## Build Profiles

Your project has three build profiles configured in `eas.json`:

### 1. **Development Build**
- For internal testing with development features
- Includes development client
- Distribution: Internal

### 2. **Preview Build**
- For testing before production
- Generates APK for Android (easy to share and test)
- Distribution: Internal

### 3. **Production Build**
- For app store submission
- Generates AAB (Android App Bundle) for Google Play Store
- Auto-increments version numbers

---

## Building the App

### Android Builds

#### Preview Build (APK for Testing)
```bash
eas build --platform android --profile preview
```
- Generates `.apk` file
- Can be directly installed on Android devices
- Perfect for sharing with testers

#### Production Build (AAB for Play Store)
```bash
eas build --platform android --profile production
```
- Generates `.aab` (Android App Bundle)
- Required for Google Play Store submission
- Optimized for different device configurations

### iOS Builds

#### Preview Build
```bash
eas build --platform ios --profile preview
```

#### Production Build
```bash
eas build --platform ios --profile production
```

### Build Both Platforms
```bash
eas build --platform all --profile production
```

---

## Build Process

1. **Initiate Build**
   ```bash
   eas build --platform android --profile production
   ```

2. **EAS Will:**
   - Upload your project to EAS servers
   - Install dependencies
   - Run the build process
   - Generate the build artifact
   - Provide a download link

3. **Monitor Build**
   - View build progress at: https://expo.dev/accounts/jainishgamit/projects/karmayoginfinitesofttech/builds
   - You'll receive email notifications on build completion

4. **Download Build**
   - Once complete, download the `.aab` or `.apk` file from the build page

---

## Uploading to Google Play Store

### Option 1: Manual Upload

1. **Go to Google Play Console**
   - Visit: https://play.google.com/console
   - Select your app or create a new one

2. **Navigate to Release Section**
   - Production → Create new release
   - Or Internal testing → Create new release

3. **Upload AAB**
   - Upload the `.aab` file from EAS build
   - Fill in release notes
   - Review and rollout

### Option 2: Automatic Upload with EAS Submit

#### Setup
1. **Create Google Service Account**
   - Go to Google Cloud Console
   - Create a service account with Play Store permissions
   - Download JSON key file

2. **Configure EAS Submit**
   ```bash
   eas submit --platform android
   ```
   - Follow prompts to configure
   - Provide service account JSON key

#### Submit to Play Store
```bash
# Submit latest build
eas submit --platform android --latest

# Or submit specific build
eas submit --platform android --id <build-id>
```

---

## Uploading to Apple App Store

### Setup

1. **Apple Developer Account**
   - Ensure you have an active Apple Developer account
   - Create App ID in Apple Developer Portal

2. **App Store Connect**
   - Create app in App Store Connect
   - Configure app metadata

### Submit to App Store

```bash
# Submit latest iOS build
eas submit --platform ios --latest

# Or submit specific build
eas submit --platform ios --id <build-id>
```

You'll be prompted for:
- Apple ID
- App-specific password
- Bundle identifier

---

## Version Management

### Update Version Number

Edit `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",  // Increment this
    "android": {
      "versionCode": 2   // Increment this for Android
    },
    "ios": {
      "buildNumber": "2" // Increment this for iOS
    }
  }
}
```

Or use auto-increment (already configured in production profile):
```json
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

---

## Environment Variables

### For Production Builds

If you need to use different environment variables for production:

1. **Create `.env.production`**
   ```env
   API_URL=https://your-production-api.com
   API_KEY=your-production-key
   ```

2. **Update `eas.json`**
   ```json
   {
     "build": {
       "production": {
         "env": {
           "API_URL": "https://your-production-api.com"
         }
       }
     }
   }
   ```

---

## Pre-Build Checklist

Before building for production:

- [ ] Update version numbers in `app.json`
- [ ] Test app thoroughly on both platforms
- [ ] Update app icons and splash screens
- [ ] Review and update app permissions
- [ ] Check API endpoints (production vs development)
- [ ] Update environment variables
- [ ] Review `eas.json` configuration
- [ ] Ensure all assets are optimized
- [ ] Update release notes
- [ ] Test on physical devices

---

## Common Build Commands

```bash
# Check build status
eas build:list

# View specific build details
eas build:view <build-id>

# Cancel a build
eas build:cancel

# Configure project
eas build:configure

# View build logs
eas build:view <build-id> --logs

# Resign build (iOS)
eas build:resign
```

---

## Troubleshooting

### Build Fails

1. **Check build logs**
   ```bash
   eas build:view <build-id> --logs
   ```

2. **Common issues:**
   - Missing dependencies: Check `package.json`
   - Invalid configuration: Verify `app.json` and `eas.json`
   - Asset issues: Ensure all referenced assets exist

### Duplicate Build Configuration

Your `eas.json` has duplicate "build" keys. Fix this:

```json
{
  "cli": {
    "version": ">= 16.28.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## Quick Start Commands

### For Testing (APK)
```bash
# Build preview APK
eas build --platform android --profile preview

# Download and share with testers
```

### For Production (Play Store)
```bash
# Build production AAB
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --latest
```

---

## Additional Resources

- **EAS Build Documentation**: https://docs.expo.dev/build/introduction/
- **EAS Submit Documentation**: https://docs.expo.dev/submit/introduction/
- **Expo Dashboard**: https://expo.dev/accounts/jainishgamit/projects/karmayoginfinitesofttech
- **Google Play Console**: https://play.google.com/console
- **App Store Connect**: https://appstoreconnect.apple.com

---

## Support

For issues or questions:
- Expo Forums: https://forums.expo.dev/
- Expo Discord: https://chat.expo.dev/
- GitHub Issues: https://github.com/expo/expo/issues
