# Animation System Guide

## Overview
This guide shows you how to add smooth animations throughout your entire app using the reusable animation components.

## Available Components

### 1. **AnimatedCard**
Perfect for: Cards, containers, feature items

```tsx
import { AnimatedCard } from '@/components/Animated';

<AnimatedCard 
  onPress={() => router.push('/somewhere')} 
  delay={100}
  style={styles.card}
>
  <Text>Your Card Content</Text>
</AnimatedCard>
```

**Features:**
- ✅ Fade in + slide up entrance
- ✅ Scale down on press
- ✅ Staggered delays for multiple cards

---

### 2. **AnimatedListItem**
Perfect for: List items, menu items, rows

```tsx
import { AnimatedListItem } from '@/components/Animated';

{items.map((item, index) => (
  <AnimatedListItem 
    key={item.id} 
    index={index} 
    onPress={() => handlePress(item)}
    style={styles.listItem}
  >
    <Text>{item.title}</Text>
  </AnimatedListItem>
))}
```

**Features:**
- ✅ Staggered fade in (50ms per item)
- ✅ Subtle scale on press
- ✅ Optimized for long lists

---

### 3. **AnimatedButton**
Perfect for: Buttons, CTAs, interactive elements

```tsx
import { AnimatedButton } from '@/components/Animated';

<AnimatedButton 
  onPress={handleSubmit} 
  variant="bounce"  // 'scale' | 'bounce' | 'subtle'
  style={styles.button}
>
  <Text>Submit</Text>
</AnimatedButton>
```

**Variants:**
- `scale` - Standard scale down (0.95)
- `bounce` - Bouncy spring animation (0.92)
- `subtle` - Minimal scale (0.98)

---

### 4. **FadeInView**
Perfect for: Simple fade in effects

```tsx
import { FadeInView } from '@/components/Animated';

<FadeInView delay={200} duration={500}>
  <Text>Fades in smoothly</Text>
</FadeInView>
```

---

### 5. **SlideInView**
Perfect for: Directional entrance animations

```tsx
import { SlideInView } from '@/components/Animated';

<SlideInView 
  from="right"  // 'left' | 'right' | 'top' | 'bottom'
  distance={100} 
  delay={150}
>
  <Text>Slides in from right</Text>
</SlideInView>
```

---

### 6. **ScaleInView**
Perfect for: Pop-in effects, modals

```tsx
import { ScaleInView } from '@/components/Animated';

<ScaleInView delay={100}>
  <Text>Scales up with fade in</Text>
</ScaleInView>
```

---

## Real-World Examples

### Example 1: Animated Home Screen Cards

```tsx
// components/Home/HomeScreen.tsx
import { AnimatedCard } from '@/components/Animated';

export default function HomeScreen() {
  const cards = [
    { id: 1, title: 'Attendance', icon: 'clock' },
    { id: 2, title: 'Leaves', icon: 'calendar' },
    { id: 3, title: 'Requests', icon: 'send' },
  ];

  return (
    <View style={styles.grid}>
      {cards.map((card, index) => (
        <AnimatedCard
          key={card.id}
          delay={index * 100}
          onPress={() => router.push(`/category/${card.id}`)}
          style={styles.card}
        >
          <Feather name={card.icon} size={24} />
          <Text>{card.title}</Text>
        </AnimatedCard>
      ))}
    </View>
  );
}
```

---

### Example 2: Animated List with Items

```tsx
// app/ViewAllRequest/LeaveApplication.tsx
import { AnimatedListItem } from '@/components/Animated';

export default function LeaveApplications() {
  const [leaves, setLeaves] = useState([]);

  return (
    <ScrollView>
      {leaves.map((leave, index) => (
        <AnimatedListItem
          key={leave.id}
          index={index}
          onPress={() => handleViewLeave(leave)}
          style={styles.leaveItem}
        >
          <View style={styles.leaveContent}>
            <Text style={styles.leaveType}>{leave.type}</Text>
            <Text style={styles.leaveDates}>{leave.dates}</Text>
            <Text style={styles.leaveStatus}>{leave.status}</Text>
          </View>
        </AnimatedListItem>
      ))}
    </ScrollView>
  );
}
```

---

### Example 3: Animated Form Buttons

```tsx
// app/Requests/Leaveapplyreq.tsx
import { AnimatedButton, FadeInView } from '@/components/Animated';

export default function LeaveApplyReq() {
  return (
    <View style={styles.form}>
      <FadeInView delay={100}>
        <TextInput placeholder="Reason" />
      </FadeInView>

      <FadeInView delay={200}>
        <DatePicker />
      </FadeInView>

      <AnimatedButton 
        variant="bounce" 
        onPress={handleSubmit}
        style={styles.submitButton}
      >
        <Text style={styles.submitText}>Submit Leave Request</Text>
      </AnimatedButton>
    </View>
  );
}
```

---

### Example 4: Animated Modal/Sidebar

```tsx
// components/Sidebar.tsx
import { SlideInView, AnimatedButton } from '@/components/Animated';

export default function Sidebar({ visible, onClose }) {
  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <FadeInView duration={250}>
        <Pressable onPress={onClose} style={styles.backdrop} />
      </FadeInView>

      {/* Sidebar */}
      <SlideInView from="right" distance={400}>
        <View style={styles.sidebar}>
          <AnimatedButton onPress={onClose} variant="subtle">
            <Feather name="x" size={24} />
          </AnimatedButton>
          {/* Sidebar content */}
        </View>
      </SlideInView>
    </>
  );
}
```

---

### Example 5: Staggered Grid Animation

```tsx
// app/(tabs)/explore.tsx
import { AnimatedCard } from '@/components/Animated';

export default function MySpaceScreen() {
  return (
    <View style={styles.categoryGrid}>
      {CATEGORIES.map((category, index) => (
        <AnimatedCard
          key={category.id}
          delay={index * 100}  // Stagger by 100ms
          onPress={() => handleCategoryPress(category)}
          style={styles.categoryCard}
        >
          <View style={styles.cardIcon}>
            <Feather name={category.icon} size={28} />
          </View>
          <Text style={styles.cardTitle}>{category.title}</Text>
          <Text style={styles.cardSubtitle}>{category.subtitle}</Text>
        </AnimatedCard>
      ))}
    </View>
  );
}
```

---

## Migration Guide

### Before (No Animation):
```tsx
<Pressable onPress={handlePress} style={styles.card}>
  <Text>My Card</Text>
</Pressable>
```

### After (With Animation):
```tsx
<AnimatedCard onPress={handlePress} style={styles.card}>
  <Text>My Card</Text>
</AnimatedCard>
```

---

## Best Practices

### ✅ DO:
- Use `AnimatedCard` for grid items and cards
- Use `AnimatedListItem` for list/menu items
- Use `AnimatedButton` for all buttons
- Stagger animations with delays (100-150ms between items)
- Keep animations consistent across similar components

### ❌ DON'T:
- Don't mix different animation styles in the same screen
- Don't use delays longer than 500ms
- Don't animate more than 20 items at once (performance)
- Don't nest animated components unnecessarily

---

## Performance Tips

1. **Use `useNativeDriver: true`** - Already built into all components
2. **Limit staggered items** - Max 20 items with stagger
3. **Reuse components** - Don't create new Animated.Value on every render
4. **Memoize callbacks** - Use `useCallback` for onPress handlers

---

## Quick Reference

| Component | Use Case | Animation Type |
|-----------|----------|----------------|
| `AnimatedCard` | Cards, containers | Fade + Slide + Scale |
| `AnimatedListItem` | List items | Staggered fade + Scale |
| `AnimatedButton` | Buttons, CTAs | Scale on press |
| `FadeInView` | Simple fade | Fade in |
| `SlideInView` | Directional entrance | Slide + Fade |
| `ScaleInView` | Pop-in effects | Scale + Fade |

---

## Import Shortcut

```tsx
// Import all at once
import {
  AnimatedCard,
  AnimatedListItem,
  AnimatedButton,
  FadeInView,
  SlideInView,
  ScaleInView,
} from '@/components/Animated';
```

---

## Next Steps

1. **Replace existing Pressables** with `AnimatedCard` or `AnimatedButton`
2. **Add entrance animations** to screens using `FadeInView` or `SlideInView`
3. **Animate lists** using `AnimatedListItem` with index-based delays
4. **Test on device** to ensure smooth 60fps animations

Your app will feel premium and polished! 🚀
