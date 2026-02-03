# Dark Mode Fix Plan

## Files to Fix

### ✅ Already Fixed (Home Screen Components)
1. ✅ components/Home/EmployeesWFHToday.tsx
2. ✅ components/Home/UpcomingLeaves.tsx
3. ✅ components/Home/UpcomingWFHs.tsx
4. ✅ components/Home/EmployeeOfTheMonthSection.tsx

### 🔧 To Fix (User Requested)
1. ⏳ app/Attendance/AttendenceList.tsx - Attendance History
2. ⏳ app/Attendance/LeaveApprovalList.tsx - Leave Approval List
3. ⏳ app/Requests/Earlycheckoutreq.tsx - Early Checkout/Late Checkin Request
4. ⏳ app/Requests/Wfhapplyreq.tsx - Apply WFH
5. ⏳ app/Support/About.tsx - About
6. ⏳ app/Resources/TeamDirectory.tsx - Team Directory
7. ⏳ app/Support/Helpandfaq.tsx - Help & FAQ

## Standard Fix Pattern

For each file:
1. Add import: `import { ThemeColors, useTheme } from '@/contexts/ThemeContext';`
2. In component: Add `const { colors } = useTheme();`
3. Convert styles from `StyleSheet.create({...})` to `const createStyles = (colors: ThemeColors) => StyleSheet.create({...})`
4. In component: Add `const styles = createStyles(colors);`
5. Replace hardcoded colors:
   - `backgroundColor: '#FFF'` or `'#FFFFFF'` → `backgroundColor: colors.card`
   - `backgroundColor: '#F5F5F5'` or `'#F8F9FA'` → `backgroundColor: colors.background`
   - `color: '#000'` or `'#333'` or `'#1a1a1a'` → `color: colors.text`
   - `color: '#666'` or `'#888'` → `color: colors.textSecondary`
   - `color: '#999'` or `'#aaa'` → `color: colors.textTertiary`
   - `borderColor: '#E0E0E0'` or `'#DDD'` → `borderColor: colors.border`
   - Keep status colors (success, error, warning) as is

## Progress
- Home Screen: 4/4 ✅
- User Requested: 0/7 ⏳
