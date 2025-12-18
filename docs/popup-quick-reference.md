# Quick Reference: Both Popup Styles

## 🎯 When to Use Which Style

### Use Toast (Style 1) ☁️
```tsx
Toast.show({
    type: 'error',
    text1: 'Title',
    text2: 'Description',
    position: 'top',
    visibilityTime: 3000,
});
```

**Best for:**
- ✅ Form validation errors
- ✅ Quick confirmations
- ✅ Non-critical updates
- ✅ Background notifications
- ✅ When user needs to continue working

---

### Use Custom Modal (Style 2) 🎨
```tsx
setModalConfig({
    visible: true,
    type: 'success', // 'error' | 'warning' | 'info'
    title: 'Title Here',
    message: 'Detailed message here',
});
```

**Best for:**
- ✅ Important confirmations
- ✅ Critical errors
- ✅ Success celebrations
- ✅ Multi-line explanations
- ✅ When user must acknowledge

---

## 📊 Current Implementation

### Sign-Up Page (`sign-up.tsx`)
| Action | Popup Style | Type |
|--------|-------------|------|
| Empty fields | Toast | Error |
| Account created | Custom Modal | Success |
| Creation failed | Custom Modal | Error |

### Sign-In Page (`sign-in.tsx`)
| Action | Popup Style | Type |
|--------|-------------|------|
| Empty fields | Toast | Error |
| Email not verified | Custom Modal | Warning |
| Sign-in success | Custom Modal | Success |
| Sign-in failed | Custom Modal | Error |

---

## 🎨 Modal Types & Colors

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `success` | ✓ Checkmark | Green (#10B981) | Successful actions |
| `error` | ✗ Close | Red (#EF4444) | Failed actions |
| `warning` | ⚠ Triangle | Amber (#F59E0B) | Important warnings |
| `info` | ℹ Circle | Blue (#3B82F6) | Informational |

---

## 💻 Code Templates

### Toast Template
```tsx
// In your component
Toast.show({
    type: 'success', // 'error' | 'info' | 'warning'
    text1: 'Main Title',
    text2: 'Subtitle or description',
    position: 'top',
    visibilityTime: 3000,
});
```

### Modal Template
```tsx
// 1. Add state
const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
});

// 2. Add close function
const closeModal = () => {
    setModalConfig({ ...modalConfig, visible: false });
};

// 3. Show modal
setModalConfig({
    visible: true,
    type: 'success',
    title: 'Success!',
    message: 'Your action was completed successfully.',
});

// 4. Render modal
<CustomModal
    visible={modalConfig.visible}
    onClose={closeModal}
    type={modalConfig.type}
    title={modalConfig.title}
    message={modalConfig.message}
/>
```

---

## 🔧 Customization Options

### Toast Customization
```tsx
Toast.show({
    type: 'success',
    text1: 'Title',
    text2: 'Description',
    position: 'top', // or 'bottom'
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 30,
    bottomOffset: 40,
    onShow: () => {},
    onHide: () => {},
});
```

### Modal Customization
Edit `components/CustomModal.tsx` to change:
- Colors and themes
- Animation timing
- Icon styles
- Button text
- Layout and spacing

---

## 📱 Files Overview

| File | Purpose |
|------|---------|
| `components/CustomModal.tsx` | Reusable modal component |
| `app/(auth)/sign-up.tsx` | Sign-up with both popup styles |
| `app/(auth)/sign-in.tsx` | Sign-in with both popup styles |
| `docs/popup-styles-guide.md` | Detailed guide |
| `docs/signin-popup-implementation.md` | Sign-in specific docs |

---

## ✨ Pro Tips

1. **Consistency**: Use the same popup style for similar actions across your app
2. **Timing**: Keep toast visibility between 2-4 seconds
3. **Messages**: Be clear and actionable in your messages
4. **Colors**: Stick to the color scheme for consistency
5. **Testing**: Test both styles on different screen sizes

---

## 🎉 You're All Set!

Both popup styles are now implemented and ready to use across your application. The pattern is consistent, modern, and provides excellent user feedback!
