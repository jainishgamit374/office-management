# Quick Build Commands Reference

## 🚀 Quick Start

### Option 1: Interactive Menu (Recommended)
```bash
npm run build:menu
# or
./build-upload.sh
```

### Option 2: Direct Commands

## 📱 Android Builds

### Preview Build (APK for Testing)
```bash
npm run build:android:preview
# or
eas build --platform android --profile preview
```
**Output:** `.apk` file you can share with testers

### Production Build (Play Store)
```bash
npm run build:android:production
# or
eas build --platform android --profile production
```
**Output:** `.aab` file for Google Play Store

## 🍎 iOS Builds

### Preview Build
```bash
npm run build:ios:preview
# or
eas build --platform ios --profile preview
```

### Production Build (App Store)
```bash
npm run build:ios:production
# or
eas build --platform ios --profile production
```

## 🌐 Build All Platforms
```bash
npm run build:all
# or
eas build --platform all --profile production
```

## 📤 Submit to Stores

### Google Play Store
```bash
npm run submit:android
# or
eas submit --platform android --latest
```

### Apple App Store
```bash
npm run submit:ios
# or
eas submit --platform ios --latest
```

## 📊 Monitor Builds

### View Build List
```bash
npm run build:status
# or
eas build:list
```

### View Specific Build
```bash
eas build:view <build-id>
```

### View Build Logs
```bash
eas build:view <build-id> --logs
```

## 🔧 Setup Commands

### Install EAS CLI
```bash
npm install -g eas-cli
```

### Login to Expo
```bash
eas login
```

### Check Who's Logged In
```bash
eas whoami
```

## 📋 Pre-Build Checklist

Before building for production:

1. **Update version in `app.json`:**
   ```json
   {
     "expo": {
       "version": "1.0.1",  // Update this
       "android": {
         "versionCode": 2   // Update this
       }
     }
   }
   ```

2. **Test the app thoroughly**
   ```bash
   npm run android  # Test on Android
   npm run ios      # Test on iOS
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Check for linting errors**
   ```bash
   npm run lint
   ```

## 🔗 Important Links

- **Expo Dashboard:** https://expo.dev/accounts/jainishgamit/projects/karmayoginfinitesofttech
- **Google Play Console:** https://play.google.com/console
- **App Store Connect:** https://appstoreconnect.apple.com

## 💡 Tips

### Build for Testing First
Always build a preview version first to test before production:
```bash
npm run build:android:preview
```

### Check Build Status
Monitor your builds at:
```bash
npm run build:status
```

### Download Builds
After build completes, download from:
- Expo Dashboard
- Or use the link provided in terminal

### Environment Variables
For production builds, ensure your `.env` file has production values:
```env
API_URL=https://your-production-api.com
```

## 🆘 Troubleshooting

### Build Fails
```bash
# View detailed logs
eas build:view <build-id> --logs
```

### Cancel a Build
```bash
eas build:cancel
```

### Clear Cache and Rebuild
```bash
eas build --platform android --profile production --clear-cache
```

## 📝 Common Workflows

### Workflow 1: Quick Test Build
```bash
# 1. Build preview APK
npm run build:android:preview

# 2. Wait for build to complete
# 3. Download and test on device
```

### Workflow 2: Production Release
```bash
# 1. Update version in app.json
# 2. Test thoroughly
npm test

# 3. Build production
npm run build:android:production

# 4. Wait for build to complete
# 5. Submit to Play Store
npm run submit:android
```

### Workflow 3: Both Platforms
```bash
# 1. Update version in app.json
# 2. Build both platforms
npm run build:all

# 3. Submit both
npm run submit:android
npm run submit:ios
```

## 🎯 Project Info

- **Project Name:** officemanagement
- **Slug:** karmayoginfinitesofttech
- **Owner:** jainishgamit
- **Package:** karmayog.infinitesofttech
- **EAS Project ID:** f85ec670-4fcc-4063-8437-83e48d7a3be4
