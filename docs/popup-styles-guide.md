# Popup Styles Guide

This application now supports **two different popup/notification styles** for better user experience and visual variety.

## Style 1: Toast Notifications (react-native-toast-message)

**Best for:** Quick, non-blocking notifications that don't require user interaction

### Features:
- Appears at the top of the screen
- Auto-dismisses after a set time
- Doesn't block user interaction
- Lightweight and subtle

### Usage Example:
```tsx
Toast.show({
    type: 'error',
    text1: 'Missing Fields',
    text2: 'All fields are required',
    position: 'top',
    visibilityTime: 3000,
});
```

### Available Types:
- `success` - Green checkmark
- `error` - Red X
- `info` - Blue info icon
- `warning` - Yellow warning icon

---

## Style 2: Custom Modal (CustomModal Component)

**Best for:** Important messages that require user acknowledgment

### Features:
- Full-screen overlay with backdrop
- Requires user interaction to dismiss
- Animated entrance with spring animation
- More prominent and attention-grabbing
- Customizable icons and colors

### Usage Example:
```tsx
setModalConfig({
    visible: true,
    type: 'success',
    title: 'Account Created! 🎉',
    message: 'Please verify your email before signing in.',
});
```

### Available Types:
- `success` - Green checkmark circle (emerald theme)
- `error` - Red close circle (red theme)
- `warning` - Yellow warning triangle (amber theme)
- `info` - Blue information circle (blue theme)

### Props:
- `visible: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is dismissed
- `type?: 'success' | 'error' | 'warning' | 'info'` - Modal type
- `title: string` - Modal title
- `message: string` - Modal message
- `buttonText?: string` - Custom button text (default: "OK")

---

## When to Use Which Style?

### Use Toast (Style 1) for:
- ✅ Form validation errors
- ✅ Quick confirmations
- ✅ Non-critical updates
- ✅ Background process notifications

### Use Custom Modal (Style 2) for:
- ✅ Account creation success
- ✅ Critical errors
- ✅ Important confirmations
- ✅ Messages that need user acknowledgment
- ✅ Multi-line explanatory messages

---

## Current Implementation in sign-up.tsx

1. **Validation errors** → Toast (Style 1)
   - Quick feedback for missing fields
   - Doesn't interrupt the form flow

2. **Success messages** → Custom Modal (Style 2)
   - Celebrates account creation
   - Ensures user sees the verification message

3. **Error messages** → Custom Modal (Style 2)
   - Makes errors more visible
   - Provides detailed error information

---

## Customization

### Customizing Toast:
Edit the Toast configuration in your component:
```tsx
Toast.show({
    type: 'success',
    text1: 'Title',
    text2: 'Description',
    position: 'top', // or 'bottom'
    visibilityTime: 4000, // milliseconds
    autoHide: true,
    topOffset: 30,
    bottomOffset: 40,
});
```

### Customizing Modal:
Edit `components/CustomModal.tsx` to change:
- Colors and themes
- Animation timing
- Icon styles
- Layout and spacing
- Button appearance

---

## Design Philosophy

Both popup styles follow modern design principles:
- **Clear visual hierarchy** with bold titles and readable text
- **Color-coded feedback** for different message types
- **Smooth animations** for better UX
- **Accessibility** with proper contrast and sizing
- **Responsive design** that works on all screen sizes
