# ID Verification Modal for New Users - Implementation

## Changes Made

Updated the `FirstTimeIDVerificationModal` component to ensure it shows for:
1. **Brand new users** who just signed up (and might not have a Firestore document yet)
2. **Existing users** who haven't added their government ID

## What Was Changed

### File: `src/components/FirstTimeIDVerificationModal.jsx`

#### 1. Enhanced New User Detection ✅

**Before:**
```javascript
const userDoc = await getDoc(doc(db, 'users', user.uid));
if (userDoc.exists()) {
    const userData = userDoc.data();
    // Only checked existing users
    const shouldShow = !userData.idVerification && !userData.idVerificationSkipped;
    setShowModal(shouldShow);
}
// Did nothing if user document didn't exist
```

**After:**
```javascript
const userDoc = await getDoc(doc(db, 'users', user.uid));

if (userDoc.exists()) {
    const userData = userDoc.data();
    // Check existing users
    const shouldShow = !userData.idVerification && !userData.idVerificationSkipped;
    setShowModal(shouldShow);
} else {
    // NEW: Handle brand new users without a Firestore document
    console.log('New user detected - showing ID verification modal');
    setShowModal(true);
}
```

#### 2. Fixed Skip and Upload Handlers ✅

Changed from `updateDoc()` to `setDoc()` with `merge: true` option to handle both:
- **New users** (no document exists yet)
- **Existing users** (document already exists)

**Before:**
```javascript
// This would FAIL for new users without a document
await updateDoc(doc(db, 'users', user.uid), {
    idVerificationSkipped: true,
    idVerificationSkippedAt: new Date()
});
```

**After:**
```javascript
// This works for BOTH new and existing users
await setDoc(doc(db, 'users', user.uid), {
    idVerificationSkipped: true,
    idVerificationSkippedAt: new Date()
}, { merge: true }); // ← Key: merge option preserves existing fields
```

#### 3. Updated Imports ✅
```javascript
// Before
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// After
import { doc, getDoc, setDoc } from 'firebase/firestore';
```

## How It Works Now

### Scenario 1: Brand New User (Just Signed Up)
1. User completes signup → Auth account created
2. User document **might not exist yet** (due to timing/errors)
3. Modal detects missing document → Shows ID verification modal
4. User can either:
   - Upload ID → Creates/updates user document with ID data
   - Skip → Creates/updates user document with skip flag

### Scenario 2: Existing User Without ID
1. User logs in → Auth account exists
2. User document exists but `idVerification` is null/missing
3. Modal detects no ID verification → Shows modal
4. User can upload ID or skip

### Scenario 3: User Who Skipped Before
1. User logs in → User document exists
2. `idVerificationSkipped` is `true`
3. Modal does **NOT** show (respects their choice)

### Scenario 4: User With ID Already
1. User logs in → User document exists
2. `idVerification` data exists
3. Modal does **NOT** show (already verified)

## Benefits

✅ **Handles all edge cases:**
- New signups with/without Firestore documents
- Existing users who never verified
- Users who previously skipped
- Users already verified

✅ **No errors:**
- `setDoc` with `merge: true` never fails due to missing documents
- Works whether document exists or not

✅ **Respects user choice:**
- Only shows once for new users
- Doesn't repeatedly prompt users who skipped
- Doesn't show for verified users

## Testing

After deploying the Firestore rules, test these scenarios:

### Test 1: New Email Signup
```
1. Create a brand new account with email/password
2. Verify the ID verification modal appears immediately after signup
3. Try skipping → Should work without errors
4. Check Firestore → User document should be created with skip flag
```

### Test 2: New Google Sign-In
```
1. Sign in with a Google account that's never been used before
2. Verify the ID verification modal appears
3. Try uploading ID → Should work without errors
4. Check Firestore → User document should have idVerification data
```

### Test 3: Existing User Logging In
```
1. Log in with an existing account that has no ID
2. Modal should appear
3. Skip or upload → Should update existing document
```

### Test 4: User Who Previously Skipped
```
1. Log in with an account that skipped before
2. Modal should NOT appear
3. User can still verify from Profile page
```

## Files Modified

1. `src/components/FirstTimeIDVerificationModal.jsx` - Enhanced logic for new users
2. `src/context/AuthContext.jsx` - Fixed error handling (from previous changes)
3. `firestore.rules` - Added create rule for users (from previous changes)

## Related Documentation

See also:
- `.agent/USER-SIGNUP-FIX.md` - Details on the Firestore rules fix
