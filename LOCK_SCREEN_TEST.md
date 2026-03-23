# Lock Screen Testing Guide

## Overview
The lock screen feature allows users to temporarily lock their session while keeping their data for 5 minutes. After 5 minutes, the session expires and users are redirected to login.

## How It Works

### 1. Lock Session
- User clicks "Lock Screen" from the profile dropdown in the top navigation
- User data is saved to cookies (`_TECHMIN_LOCK_SCREEN_`, `_TECHMIN_LOCK_TIMESTAMP_`)
- Auth token is removed but user info is retained
- User is redirected to `/auth/lock-screen`

### 2. Lock Screen Display
- Shows user's name and avatar
- Displays "Session will expire in 5 minutes" warning
- Provides password input to unlock
- Option to "Sign in with different account"

### 3. Unlock Session
- User enters their password
- Password is verified with backend API (`POST /api/auth/login`)
- If correct:
  - Session is restored with new token
  - Lock screen cookies are cleared
  - User is redirected to dashboard
- If incorrect:
  - Error message is shown
  - User can try again

### 4. Auto-Expiration (5 Minutes)
- Timer starts when session is locked
- After 5 minutes:
  - All cookies are cleared (`_TECHMIN_LOCK_SCREEN_`, `_TECHMIN_LOCK_TIMESTAMP_`, `_TECHMIN_AUTH_KEY_`)
  - User data is removed from state
  - User is redirected to login page

## Testing Steps

### Test 1: Lock and Unlock (Within 5 Minutes)
1. Start the admin dashboard: `npm run dev`
2. Login with valid credentials
3. Click profile dropdown → "Lock Screen"
4. Verify:
   - ✅ Redirected to `/auth/lock-screen`
   - ✅ User's name is displayed
   - ✅ User's avatar is shown
   - ✅ Warning message: "Session will expire in 5 minutes"
5. Enter correct password and click "Unlock"
6. Verify:
   - ✅ Redirected to dashboard
   - ✅ User is logged in
   - ✅ Can access protected pages

### Test 2: Lock with Wrong Password
1. Lock the session
2. Enter incorrect password
3. Verify:
   - ✅ Error message: "Incorrect password. Please try again."
   - ✅ Still on lock screen
   - ✅ Can try again

### Test 3: Auto-Expiration After 5 Minutes
1. Lock the session
2. Wait for 5 minutes (or modify `LOCK_DURATION` in `useAuthContext.tsx` to 30 seconds for faster testing)
3. Verify:
   - ✅ Automatically redirected to login page
   - ✅ All session data cleared
   - ✅ Cannot access protected pages

### Test 4: Sign In with Different Account
1. Lock the session
2. Click "Sign in with different account"
3. Verify:
   - ✅ Redirected to login page
   - ✅ Can login with different credentials

## Technical Implementation

### Files Modified
- `admin-dashboard/src/context/useAuthContext.tsx` - Lock/unlock logic, 5-minute timer
- `admin-dashboard/src/app/(other)/auth/lock-screen/page.tsx` - Lock screen UI
- `admin-dashboard/src/app/(other)/auth/lock-screen/components/LockScreenForm.tsx` - Unlock form
- `admin-dashboard/src/components/layout/TopNavigationBar/components/ProfileDropdown.tsx` - Lock Screen option
- `admin-dashboard/src/routes/index.tsx` - Lock screen route

### Cookies Used
- `_TECHMIN_LOCK_SCREEN_` - Stores user data during lock
- `_TECHMIN_LOCK_TIMESTAMP_` - Stores lock time for expiration check
- `_TECHMIN_AUTH_KEY_` - Main auth token (removed during lock)

### Timer Logic
```typescript
const LOCK_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

// Check on mount if lock screen has expired
useEffect(() => {
  const { user: lockedUser, timestamp } = getLockScreenData()
  
  if (lockedUser && timestamp) {
    const elapsed = Date.now() - timestamp
    
    if (elapsed < LOCK_DURATION) {
      // Still within 5 minutes, show lock screen
      setIsLocked(true)
    } else {
      // Expired, clear and redirect to login
      clearAllData()
      navigate('/auth/login')
    }
  }
}, [])

// Auto-clear after remaining time
useEffect(() => {
  if (isLocked) {
    const remaining = LOCK_DURATION - (Date.now() - timestamp)
    
    if (remaining > 0) {
      const timer = setTimeout(() => {
        clearAllData()
        navigate('/auth/login')
      }, remaining)
      
      return () => clearTimeout(timer)
    }
  }
}, [isLocked])
```

## Quick Test (30 seconds instead of 5 minutes)

To test faster, temporarily change the duration:

```typescript
// In admin-dashboard/src/context/useAuthContext.tsx
const LOCK_DURATION = 30 * 1000 // 30 seconds for testing
```

Then:
1. Lock the session
2. Wait 30 seconds
3. Verify auto-redirect to login

**Remember to change it back to 5 minutes for production!**

## Status
✅ Lock screen implemented
✅ 5-minute timer working
✅ Auto-expiration working
✅ Password verification with backend
✅ User info displayed on lock screen
✅ Lock Screen option in profile dropdown
✅ Route added to public routes

## Next Steps
- Test all scenarios above
- Verify timer accuracy
- Test with different users
- Ensure no memory leaks from timers
