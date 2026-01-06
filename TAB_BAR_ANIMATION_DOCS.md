# 🎭 Scroll-Based Tab Bar Animation

## ✨ Feature Overview

The app now features a **smooth, scroll-based tab bar animation** that automatically hides when scrolling down and shows when scrolling up, providing an immersive user experience with more screen space for content.

---

## 🎯 How It Works

### **User Experience**
```
Scroll Down ↓ → Tab Bar Slides Down (Hides)
Scroll Up ↑   → Tab Bar Slides Up (Shows)
```

### **Animation Details**
- **Type**: Spring animation (natural, bouncy feel)
- **Friction**: 8 (controls bounciness)
- **Tension**: 40 (controls speed)
- **Translate Distance**: 150px (tab bar moves down)
- **Trigger**: Scrolls > 50px before hiding
- **Performance**: Uses native driver for 60fps

---

## 🏗️ Architecture

### **1. TabBarContext** (`constants/TabBarContext.tsx`)

Provides shared animation values across the app:

```typescript
interface TabBarContextType {
  scrollY: Animated.Value;           // Current scroll position
  lastScrollY: React.MutableRefObject<number>; // Previous scroll position
  tabBarTranslateY: Animated.Value;  // Tab bar translation value
}
```

**Usage:**
```typescript
import { useTabBar } from '@/constants/TabBarContext';

const { scrollY, lastScrollY, tabBarTranslateY } = useTabBar();
```

---

### **2. Custom Tab Bar** (`app/(tabs)/_layout.tsx`)

A fully custom animated tab bar component:

**Key Features:**
- Custom `CustomTabBar` component
- Animated.View with `translateY` transform
- Spring animation for smooth transitions
- Integrates with Expo Router's tab navigation

**Code Structure:**
```typescript
function CustomTabBar({ state, descriptors, navigation }) {
  const { tabBarTranslateY } = useTabBar();
  
  return (
    <Animated.View
      style={[
        styles.tabBarContainer,
        { transform: [{ translateY: tabBarTranslateY }] }
      ]}
    >
      {/* Tab buttons */}
    </Animated.View>
  );
}
```

---

### **3. Scroll Handler** (`components/Home/HomeScreen.tsx`)

Detects scroll direction and animates tab bar:

```typescript
const handleScroll = Animated.event(
  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
  {
    useNativeDriver: false,
    listener: (event: any) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const diff = currentScrollY - lastScrollY.current;

      if (diff > 0 && currentScrollY > 50) {
        // Scrolling down - hide tab bar
        Animated.spring(tabBarTranslateY, {
          toValue: 150,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start();
      } else if (diff < 0) {
        // Scrolling up - show tab bar
        Animated.spring(tabBarTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start();
      }

      lastScrollY.current = currentScrollY;
    },
  }
);
```

**Logic Breakdown:**
1. **Track scroll position** using `Animated.event`
2. **Calculate difference** between current and last scroll position
3. **Determine direction**:
   - `diff > 0` = Scrolling down
   - `diff < 0` = Scrolling up
4. **Animate tab bar**:
   - Down: `translateY(150)` - Hides tab bar
   - Up: `translateY(0)` - Shows tab bar
5. **Update last position** for next comparison

---

## 🎨 Styling

### **Tab Bar Styles**
```typescript
{
  position: 'absolute',
  bottom: 22,              // Distance from bottom
  left: 20,
  right: 20,
  height: 80,              // Tab bar height
  backgroundColor: '#fff',
  borderRadius: 50,        // Fully rounded
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-around',
  paddingHorizontal: 20,
  
  // Shadow (iOS)
  shadowColor: "#1a1a1a",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  
  // Elevation (Android)
  elevation: 5,
}
```

### **Tab Button Styles**
```typescript
{
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 8,
}
```

### **Active vs Inactive**
- **Active**: `#4289f4ff` (Primary blue)
- **Inactive**: `#666` (Gray)

---

## 🔧 Implementation Steps

### **Step 1: Create TabBarContext**
```typescript
// constants/TabBarContext.tsx
export const TabBarProvider = ({ children }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const tabBarTranslateY = useRef(new Animated.Value(0)).current;

  return (
    <TabBarContext.Provider value={{ scrollY, lastScrollY, tabBarTranslateY }}>
      {children}
    </TabBarContext.Provider>
  );
};
```

### **Step 2: Wrap App with Provider**
```typescript
// app/(tabs)/_layout.tsx
return (
  <TabBarProvider>
    <TabsLayoutContent />
  </TabBarProvider>
);
```

### **Step 3: Create Custom Tab Bar**
```typescript
function CustomTabBar({ state, descriptors, navigation }) {
  const { tabBarTranslateY } = useTabBar();
  
  return (
    <Animated.View style={[styles.tabBar, { transform: [{ translateY: tabBarTranslateY }] }]}>
      {/* Render tabs */}
    </Animated.View>
  );
}
```

### **Step 4: Add Scroll Handler**
```typescript
// In any scrollable screen
const { scrollY, lastScrollY, tabBarTranslateY } = useTabBar();

const handleScroll = Animated.event(
  [{ nativeEvent: { contentOffset: { y: scrollY } } }],
  {
    useNativeDriver: false,
    listener: (event) => {
      // Animation logic
    },
  }
);

<ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
  {/* Content */}
</ScrollView>
```

---

## 📊 Performance

### **Optimizations**
- ✅ **Native Driver**: Uses `useNativeDriver: true` for transform animations
- ✅ **Throttling**: `scrollEventThrottle={16}` for 60fps
- ✅ **Spring Animation**: Natural, performant physics-based animation
- ✅ **Shared Context**: Single animation value across all screens

### **Performance Metrics**
- **Frame Rate**: 60fps
- **Animation Duration**: ~300-500ms (spring-based)
- **Memory**: Minimal overhead (shared Animated.Value)
- **CPU**: Offloaded to native thread

---

## 🎯 Usage in Other Screens

To add the same animation to other screens (e.g., Profile, Explore):

```typescript
import { useTabBar } from '@/constants/TabBarContext';

const YourScreen = () => {
  const { scrollY, lastScrollY, tabBarTranslateY } = useTabBar();

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const diff = currentScrollY - lastScrollY.current;

        if (diff > 0 && currentScrollY > 50) {
          Animated.spring(tabBarTranslateY, {
            toValue: 150,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }).start();
        } else if (diff < 0) {
          Animated.spring(tabBarTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }).start();
        }

        lastScrollY.current = currentScrollY;
      },
    }
  );

  return (
    <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
      {/* Your content */}
    </ScrollView>
  );
};
```

---

## 🐛 Troubleshooting

### **Tab Bar Not Hiding**
- Check if `scrollEventThrottle={16}` is set
- Verify `useNativeDriver: true` for transform
- Ensure scroll content is long enough (> 50px)

### **Jerky Animation**
- Use `spring` instead of `timing` for smoother feel
- Adjust `friction` (lower = more bounce)
- Adjust `tension` (higher = faster)

### **Tab Bar Not Showing**
- Check if `toValue: 0` is set correctly
- Verify `lastScrollY.current` is being updated
- Ensure no conflicting animations

---

## 🎨 Customization

### **Change Animation Speed**
```typescript
Animated.spring(tabBarTranslateY, {
  toValue: 150,
  useNativeDriver: true,
  friction: 6,    // Lower = faster, more bounce
  tension: 50,    // Higher = faster
}).start();
```

### **Change Hide Distance**
```typescript
// Hide tab bar completely
toValue: 150  // Current

// Partial hide
toValue: 80   // Only hide halfway
```

### **Change Trigger Threshold**
```typescript
if (diff > 0 && currentScrollY > 100) {  // Hide after 100px instead of 50px
  // Hide animation
}
```

---

## ✅ Benefits

1. **More Screen Space** - Content gets full attention when scrolling
2. **Better UX** - Natural, intuitive interaction
3. **Modern Feel** - Matches popular apps (Instagram, Twitter, etc.)
4. **Performance** - Native driver ensures smooth 60fps
5. **Reusable** - Works across all tabs with shared context

---

## 📝 Notes

- The animation is **screen-specific** - each screen can have its own scroll handler
- The tab bar is **shared** - all screens animate the same tab bar
- The animation is **direction-aware** - only hides when scrolling down significantly
- The animation is **spring-based** - natural, bouncy feel instead of linear

---

**Developed with 💖 by Jainish G**

*Last Updated: December 11, 2025*
