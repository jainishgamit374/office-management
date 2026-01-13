# Uttarayan Holiday Notification Update

## Summary
Added Uttarayan (Makar Sankranti) festival to the holiday calendar for January 14-15, 2026. The holiday will now appear in notifications and prevent the check-in slider from resetting on these days.

## Changes Made

### 1. Added Uttarayan to Holiday Images (`lib/calendarEvents.ts`)
```typescript
const HOLIDAY_IMAGES = {
    'Republic Day': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&q=80',
    'Independence Day': 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80',
    'Uttarayan': 'https://images.unsplash.com/photo-1611416517780-eff3a13b0359?w=800&q=80', // Colorful kites
    'Diwali': 'https://images.unsplash.com/photo-1605641461241-f0b3f5e1e8c0?w=800&q=80',
    // ... other holidays
};
```

### 2. Added Uttarayan Dates to Holiday Calendar
```typescript
const holidays: { [key: string]: { name: string; date: string } } = {
    '1-1': { name: 'New Year', date: 'January 1' },
    '1-14': { name: 'Uttarayan - Day 1', date: 'January 14' },
    '1-15': { name: 'Uttarayan - Day 2', date: 'January 15' },
    '1-26': { name: 'Republic Day', date: 'January 26' },
    // ... other holidays
};
```

### 3. Enhanced Holiday Notification Logic
- Added support for multi-day holidays
- Extracts base holiday name for image lookup (e.g., "Uttarayan - Day 1" → "Uttarayan")
- Custom message for kite festival: "Happy Uttarayan! Office is closed today. Enjoy the kite festival! 🪁"
- Uses kite emoji (🪁) for Uttarayan holidays

### 4. Updated Upcoming Holidays Display
Shows Uttarayan notification when:
- Current date is in January (before Jan 14)
- Message: "Uttarayan (Makar Sankranti) on January 14-15. Office will be closed for the kite festival! 🪁"

Shows Republic Day notification when:
- Current date is in January (Jan 16-25, after Uttarayan)

## Expected Behavior

### On January 12-13, 2026 (Before Uttarayan)
- ✅ **Upcoming Holiday Notification** appears:
  - Title: "🪁 Upcoming Holiday - Uttarayan"
  - Message: "Uttarayan (Makar Sankranti) on January 14-15. Office will be closed for the kite festival! 🪁"
  - Shows colorful kite image

### On January 14, 2026 (Uttarayan Day 1)
- ✅ **Holiday Notification** appears:
  - Title: "🪁 Uttarayan - Day 1"
  - Message: "Happy Uttarayan! Office is closed today. Enjoy the kite festival! 🪁"
  - Shows colorful kite image
- ⏸️ Check-in slider **does NOT reset** at midnight
- ⏸️ Console logs: "⏸️ Skipping reset - Today is Holiday (Uttarayan - Day 1)"

### On January 15, 2026 (Uttarayan Day 2)
- ✅ **Holiday Notification** appears:
  - Title: "🪁 Uttarayan - Day 2"
  - Message: "Happy Uttarayan! Office is closed today. Enjoy the kite festival! 🪁"
  - Shows colorful kite image
- ⏸️ Check-in slider **does NOT reset** at midnight
- ⏸️ Console logs: "⏸️ Skipping reset - Today is Holiday (Uttarayan - Day 2)"

### On January 16-25, 2026 (After Uttarayan)
- ✅ **Upcoming Holiday Notification** for Republic Day appears
- ✅ Check-in slider resets normally (working days)

## Integration Points

### Components Affected
1. **NotificationCard** - Displays holiday notifications
2. **CheckInCard** - Respects holiday dates (no reset on Jan 14-15)
3. **HomeScreen** - Shows holiday notifications in the feed

### Files Modified
- `/lib/calendarEvents.ts` - Added Uttarayan holiday configuration

## Testing Checklist
- [ ] Verify notification appears on Jan 12-13 (upcoming)
- [ ] Verify notification appears on Jan 14 (Day 1)
- [ ] Verify notification appears on Jan 15 (Day 2)
- [ ] Verify slider doesn't reset on Jan 14
- [ ] Verify slider doesn't reset on Jan 15
- [ ] Verify kite image displays correctly
- [ ] Verify kite emoji (🪁) appears in title and message

## Cultural Note
**Uttarayan** (also known as Makar Sankranti) is a major harvest festival celebrated in Gujarat and other parts of India. It marks the sun's transition into Capricorn (Makar) and is famous for kite flying festivals. The two-day celebration on January 14-15 is a public holiday in Gujarat.

🪁 Happy Uttarayan! 🪁
