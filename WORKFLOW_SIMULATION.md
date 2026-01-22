# 🔄 Workflow Simulation

This document provides a step-by-step simulation of the key workflows in the `CheckInCard` component, demonstrating how the new logic handles various scenarios, including optimistic updates, API interactions, and state protection.

---

## 1. 🚀 **Initial App Load**

**Scenario:** User opens the app for the first time in the day.

1.  **Mount:** `useEffect` triggers `fetchPunchStatus(true)`.
2.  **API Call:** `GET /dashboard-punch-status/` is called.
3.  **Response:** Backend returns `{ PunchType: 0 }` (Not Punched).
4.  **Guard Check:**
    *   `lastActionTime` is `null` (no local history).
    *   Guard sees `PunchType: 0` -> `0`.
    *   **Allowed** (Initial load/permissive path).
5.  **State Update:** `applyState(0)` is called.
6.  **UI:** Shows **"Swipe to Check-In"**.

---

## 2. ✅ **Check-In Flow (Success Path)**

**Scenario:** User swipes right to check in.

1.  **Action:** User swipes the card.
2.  **Local Update (Optimistic):**
    *   `recordPunch('IN')` is called.
    *   **Success Alert:** "Checked In! ✅" is shown immediately (Optimistic).
    *   **State Update:** `applyState(1)` is called -> `PunchType` becomes `1`.
    *   **Timestamp:** `lastLocalActionTime` is set to `Now`.
3.  **API Call:** `POST /emp-punch/` is sent in the background.
    *   **Response:** `{ status: "Success", PunchType: 1, ... }`.
4.  **Verification (Delayed):**
    *   `fetchPunchStatus` simulates a check after 15s (or next poll).
    *   **API Response:** `{ PunchType: 1 }`.
    *   **Guard Check:** `1` -> `1` (Match).
    *   **Result:** State remains `1`. UI is stable.

---

## 3. 🛡️ **Check-In with Stale Backend (The Guard)**

**Scenario:** User checks in, but backend is slow to update and returns "Not Punched" on the immediate poll.

1.  **Action:** User swipes right.
2.  **Local Update:** `PunchType` set to `1`. `lastLocalActionTime` = `10:00:00`.
3.  **API Call:** `POST /emp-punch/` succeeds.
4.  **Poll/Refresh (Immediate/Background):** `GET /dashboard-punch-status/`.
5.  **Stale Response:** Backend returns `{ PunchType: 0 }` (stale cache/DB lag).
6.  **Guard Logic:**
    *   **Current State:** `1`.
    *   **New State:** `0`.
    *   **Check:** Is this a valid reset?
        *   `forceRefresh`? No.
        *   `isDifferentDay`? No.
        *   `isNewerData`? No (Server ts < `10:00:00`).
    *   **Result:** **BLOCKED** ⛔.
7.  **Console:** `⚠️ BLOCKED: API trying to downgrade to 0 with stale data.`
8.  **UI:** Stays **"Checked In"** (User sees no glitch).
9.  **Resolution:** Next poll (e.g. 5 mins later) returns `{ PunchType: 1 }`. Guard allows `1` -> `1` update. Sync complete.

---

## 4. 🏁 **Check-Out Flow**

**Scenario:** User swipes left to check out.

1.  **Action:** User swipes left.
2.  **Local Update:** `PunchType` set to `2`. `lastLocalActionTime` = `18:00:00`.
3.  **API Call:** `POST /emp-punch/` succeeds.
4.  **UI:** Shows **"Checked Out for Today"**.
5.  **API Verification:**
    *   If backend returns `{ PunchType: 2 }`: Matches local state. UI stable.
    *   If backend returns `{ PunchType: 0 }` (stale): **BLOCKED** by guard. UI stays Checked Out.

---

## 5. ❌ **Check-In Failure (Network Error)**

**Scenario:** User tries to check in with no internet.

1.  **Action:** User swipes right.
2.  **API Call:** `POST /emp-punch/` fails (Network Error).
3.  **Catch Block:**
    *   Logs error.
    *   **Rollback:** `applyState(0)` is called manually to revert optimistic change.
    *   **Alert:** "Check-In Failed".
4.  **Result:** UI reverts to "Swipe to Check-In". User can try again.

---

## 6. 🌅 **Midnight Reset**

**Scenario:** User leaves app open overnight.

1.  **Time passes:** It becomes `00:01` next day.
2.  **Background Poll:** `GET /dashboard-punch-status/`.
3.  **Response:** Backend returns `{ PunchType: 0 }`.
4.  **Guard Logic:**
    *   **Current State:** `2` (Checked Out yesterday).
    *   **New State:** `0`.
    *   **Check:** Is this valid?
        *   `isDifferentDay`? **YES** (Server date != Local punch date).
    *   **Result:** **ALLOWED** ✅.
5.  **State Update:** `applyState(0)`.
6.  **UI:** Resets to **"Swipe to Check-In"** for the new day.

---

## 7. 📱 **App Reopen (State Sync)**

**Scenario:** User checked out, closed app, reopens it.

1.  **Mount:** `fetchPunchStatus(true)`.
2.  **API Call:** `GET /dashboard-punch-status/`.
3.  **Response:** `{ PunchType: 2, WorkingMinutes: 480 }`.
4.  **Guard:**
    *   `lastActionTime` is `null` (app restart).
    *   **Result:** **ALLOWED** (Trust API on fresh load).
5.  **UI:** Immediately shows **"Checked Out for Today"** with correct working hours.

---

## Summary of Guarantees

*   **Trust But Verify:** The UI trusts your swipe immediately (Optimistic).
*   **Stale Data Protection:** If the API tries to "undo" your punch because of DB lag, the Guard blocks it.
*   **Self-Healing:** If the UI gets out of sync, the next valid API poll or App Reopen will correct it based on authoritative server timestamps.
