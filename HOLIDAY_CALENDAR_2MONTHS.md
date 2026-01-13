# Holiday Calendar - 2 Months View

## ✅ Fixed: Notification Calendar Now Shows 2 Months of Holidays

The notification calendar has been updated to show all upcoming holidays for the **next 2 months** instead of just today's holiday.

## What Changed

### Before
- Only showed today's holiday (if any)
- Or showed next upcoming holiday (within 7 days)
- Limited visibility of future holidays

### After
- Shows ALL holidays in the current month (that haven't passed)
- Shows ALL holidays in the next month
- Provides 2 months of holiday visibility
- Automatically sorts holidays by date

## Example: January 12, 2026

**Current Month (January):**
- ✅ Uttarayan - Day 1 (Jan 14)
- ✅ Uttarayan - Day 2 (Jan 15)
- ✅ Republic Day (Jan 26)

**Next Month (February):**
- (No holidays in February)

**Total:** 3 holidays shown

## Example: December 20, 2025

**Current Month (December):**
- ✅ Christmas (Dec 25)

**Next Month (January):**
- ✅ New Year (Jan 1)
- ✅ Uttarayan - Day 1 (Jan 14)
- ✅ Uttarayan - Day 2 (Jan 15)
- ✅ Republic Day (Jan 26)

**Total:** 5 holidays shown

## Holidays Included

The system tracks these Indian holidays:

| Holiday | Month | Date |
|---------|-------|------|
| New Year | January | 1 |
| Uttarayan - Day 1 | January | 14 |
| Uttarayan - Day 2 | January | 15 |
| Republic Day | January | 26 |
| Holi | March | 14* |
| Independence Day | August | 15 |
| Gandhi Jayanti | October | 2 |
| Diwali | October | 31* |
| Christmas | December | 25 |

*Note: Holi and Diwali dates are approximate and vary by lunar calendar

## Special Features

### 1. **Today's Holiday Highlighting**
If today is a holiday:
```
🎊 Republic Day - Today!
Happy Republic Day! Office is closed today. Enjoy the holiday!
```

### 2. **Upcoming Holiday Format**
For future holidays:
```
📅 Republic Day
Republic Day on Jan 26. Office will be closed.
```

### 3. **Multi-Day Holidays**
For holidays like Uttarayan:
```
📅 Uttarayan - Day 1
Uttarayan - Day 1 on Jan 14. Office will be closed. Enjoy the kite festival! 🪁
```

### 4. **Smart Filtering**
- Skips holidays that have already passed in the current month
- Only shows current month + next month
- Automatically updates as months change

### 5. **Automatic Sorting**
Holidays are sorted chronologically:
1. Current month holidays (earliest first)
2. Next month holidays (earliest first)

## How It Works

```typescript
// Get current month and next month
const currentMonth = today.getMonth() + 1; // 1-12
const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

// Filter holidays
Object.entries(allHolidays).forEach(([key, holiday]) => {
    const isCurrentMonth = holiday.month === currentMonth;
    const isNextMonth = holiday.month === nextMonth;
    
    if (isCurrentMonth || isNextMonth) {
        // Skip past holidays in current month
        if (isCurrentMonth && holiday.day < today.getDate()) {
            return;
        }
        
        // Add to upcoming holidays list
        upcomingHolidays.push({ ... });
    }
});
```

## Testing

### Test 1: Mid-Month (January 12)
Expected holidays:
- Uttarayan - Day 1 (Jan 14)
- Uttarayan - Day 2 (Jan 15)
- Republic Day (Jan 26)

### Test 2: End of Month (January 30)
Expected holidays:
- (None from January - all passed)
- New Year (Feb 1) - if it was in February
- (Actually February has no holidays, so would show March holidays)

### Test 3: On a Holiday (January 14)
Expected:
- 🎊 Uttarayan - Day 1 - Today! (highlighted)
- Uttarayan - Day 2 (Jan 15)
- Republic Day (Jan 26)

### Test 4: Month Transition (December 31)
Expected holidays:
- (None from December - all passed)
- New Year (Jan 1)
- Uttarayan - Day 1 (Jan 14)
- Uttarayan - Day 2 (Jan 15)
- Republic Day (Jan 26)

## Console Logs

When holidays are loaded, you'll see:
```
📅 Using local holiday configuration
✅ Found 3 calendar events
✅ Loaded 3 calendar events
```

## Benefits

✅ **Better Planning** - See upcoming holidays 2 months ahead  
✅ **No Surprises** - Know all office closures in advance  
✅ **Automatic Updates** - List updates daily as months progress  
✅ **Smart Filtering** - Only shows relevant future holidays  
✅ **Visual Clarity** - Today's holiday is highlighted  

## Future Enhancements

To make this even better, consider:

1. **API Integration** - Fetch holidays from backend API
2. **Lunar Calendar** - Accurate dates for Holi, Diwali, etc.
3. **Regional Holidays** - State-specific holidays
4. **Optional Holidays** - Mark which holidays are optional
5. **3-Month View** - Extend to show 3 months instead of 2

## Summary

The notification calendar now provides **2 months of holiday visibility**, showing all upcoming holidays in the current and next month. This gives employees better visibility into office closures and helps with planning. 🎉
