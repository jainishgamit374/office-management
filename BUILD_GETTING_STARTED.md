# 🚀 Build & Upload - Getting Started

## Quick Setup (3 Steps)

### 1. Verify Your Setup
```bash
./verify-setup.sh
```
This will check if everything is ready and offer to install missing components.

### 2. Install EAS CLI (if needed)
```bash
npm install -g eas-cli
```

### 3. Login to Expo
```bash
eas login
```
Use your Expo account credentials (owner: jainishgamit)

---

## 🎯 Start Building

### Option 1: Interactive Menu (Easiest)
```bash
npm run build:menu
```
This opens an interactive menu with all build options.

### Option 2: Direct Commands

**For Testing:**
```bash
npm run build:android:preview
```
Creates an APK you can install on Android devices.

**For Production:**
```bash
npm run build:android:production
```
Creates an AAB for Google Play Store.

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **BUILD_UPLOAD_SETUP.md** | 📖 Start here - Complete overview |
| **BUILD_AND_UPLOAD_GUIDE.md** | 📚 Comprehensive guide with all details |
| **QUICK_BUILD_REFERENCE.md** | ⚡ Quick command reference |
| **.agent/workflows/build-upload.md** | 🔄 Workflow steps |

---

## 🛠️ Available Commands

### Build Commands
```bash
npm run build:menu                  # Interactive menu
npm run build:android:preview       # APK for testing
npm run build:android:production    # AAB for Play Store
npm run build:ios:preview           # iOS preview
npm run build:ios:production        # iOS for App Store
npm run build:all                   # All platforms
```

### Submit Commands
```bash
npm run submit:android              # Submit to Play Store
npm run submit:ios                  # Submit to App Store
```

### Utility Commands
```bash
npm run build:status                # View build list
./verify-setup.sh                   # Verify setup
```

---

## 📋 Before Your First Build

1. ✅ Run verification: `./verify-setup.sh`
2. ✅ Install EAS CLI: `npm install -g eas-cli`
3. ✅ Login: `eas login`
4. ✅ Update version in `app.json` (for production)
5. ✅ Test your app: `npm test`

---

## 🎬 Typical Workflow

### For Testing
```bash
# 1. Build preview
npm run build:android:preview

# 2. Wait for build (check Expo dashboard)

# 3. Download APK and test on device
```

### For Production
```bash
# 1. Update version in app.json

# 2. Test thoroughly
npm test
npm run android

# 3. Build production
npm run build:android:production

# 4. Submit to Play Store
npm run submit:android
```

---

## 🔗 Important Links

- **Expo Dashboard:** https://expo.dev/accounts/jainishgamit/projects/karmayoginfinitesofttech
- **Builds:** https://expo.dev/accounts/jainishgamit/projects/karmayoginfinitesofttech/builds
- **Google Play Console:** https://play.google.com/console
- **App Store Connect:** https://appstoreconnect.apple.com

---

## 💡 Tips

- **Always test with preview builds first** before production
- **Update version number** in `app.json` before production builds
- **Monitor builds** at your Expo dashboard
- **Check build logs** if something fails: `eas build:view <build-id> --logs`

---

## 🆘 Need Help?

1. **Check documentation** in the files listed above
2. **Run verification**: `./verify-setup.sh`
3. **View build logs**: `eas build:view <build-id> --logs`
4. **Expo resources**:
   - Docs: https://docs.expo.dev/build/introduction/
   - Forums: https://forums.expo.dev/
   - Discord: https://chat.expo.dev/

---

## ✨ You're Ready!

Your Office Management app is fully configured for building and uploading. Start with:

```bash
./verify-setup.sh
```

Then build your first preview:

```bash
npm run build:android:preview
```

**Good luck with your app! 🎉**
