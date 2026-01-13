#!/bin/bash

# Reset CheckInCard - Clear all cached data

echo "🔄 Resetting CheckInCard state..."

# Kill Metro bundler
echo "📱 Stopping Metro bundler..."
pkill -f "react-native" || true
pkill -f "metro" || true

# Clear React Native cache
echo "🗑️  Clearing React Native cache..."
rm -rf $TMPDIR/react-* || true
rm -rf $TMPDIR/metro-* || true
rm -rf $TMPDIR/haste-* || true

# Clear watchman
echo "👁️  Clearing Watchman..."
watchman watch-del-all || true

# Clear node modules cache
echo "📦 Clearing node modules cache..."
rm -rf node_modules/.cache || true

# Clear Expo cache
echo "🧹 Clearing Expo cache..."
rm -rf .expo || true

echo "✅ Reset complete!"
echo ""
echo "Next steps:"
echo "1. Restart your app: npx expo start -c"
echo "2. Open the app and check console logs"
echo "3. The CheckInCard should reload fresh data from API"
