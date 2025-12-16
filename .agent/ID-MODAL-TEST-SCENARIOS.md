# ID Verification Modal - Test Scenarios

## How the Modal Trigger Works

The modal is triggered in `FirstTimeIDVerificationModal.jsx` which is rendered globally in `Layout.jsx`.

### Trigger Logic
```javascript
// Checks on every user authentication
useEffect(() => {
    if (!user) return;
    
    checkFirstTimeUser(); // Runs every time user object changes
}, [user]);
```

### Show Modal Conditions
```javascript
// For existing users (document exists):
const shouldShow = !userData.idVerification && !userData.idVerificationSkipped;

// For new users (document doesn't exist):
setShowModal(true);
```

---

## Test Scenarios

### ✅ Scenario 1: Brand New User (Just Signed Up)
**Steps:**
1. Create a new account (email/password or Google)
2. Complete signup process
3. User is redirected to dashboard

**Expected Result:**
- ✅ Modal appears immediately
- User sees "Welcome to DropLoop! 🎉"
- Can upload ID or skip

**Firestore State:**
```javascript
// User document might not exist OR
{
  uid: "abc123",
  email: "newuser@example.com",
  displayName: "New User",
  // No idVerification field
  // No idVerificationSkipped field
}
```

---

### ✅ Scenario 2: Old User Without ID (First Login After Feature Added)
**Steps:**
1. User account created before ID verification feature
2. User logs in
3. Firestore document exists but no `idVerification` field

**Expected Result:**
- ✅ Modal appears after login
- User sees "Welcome to DropLoop! 🎉"
- Can upload ID or skip

**Firestore State:**
```javascript
{
  uid: "old123",
  email: "olduser@example.com",
  displayName: "Old User",
  createdAt: "2024-11-15T...", // Old account
  // No idVerification field
  // No idVerificationSkipped field
}
```

---

### ✅ Scenario 3: Old User Who Previously Skipped (Subsequent Logins)
**Steps:**
1. Old user logged in before and clicked "Skip for Now"
2. User logs out and logs back in
3. Firestore has `idVerificationSkipped: true`

**Expected Result:**
- ❌ Modal does NOT appear
- User can still verify from Profile page
- Respects their previous choice

**Firestore State:**
```javascript
{
  uid: "skip123",
  email: "skipped@example.com",
  displayName: "User Who Skipped",
  idVerificationSkipped: true,
  idVerificationSkippedAt: "2024-12-15T..."
  // No idVerification field
}
```

---

### ✅ Scenario 4: User With Pending Verification
**Steps:**
1. User uploaded ID previously
2. Admin hasn't approved/rejected yet
3. User logs back in

**Expected Result:**
- ❌ Modal does NOT appear
- Their ID is under review
- Can check status on Profile page

**Firestore State:**
```javascript
{
  uid: "pending123",
  email: "pending@example.com",
  idVerification: {
    idType: 'aadhar',
    frontImageUrl: 'https://...',
    backImageUrl: 'https://...',
    status: 'pending',
    submittedAt: Date
  }
}
```

---

### ✅ Scenario 5: Verified User
**Steps:**
1. User uploaded ID and admin approved it
2. User logs back in

**Expected Result:**
- ❌ Modal does NOT appear
- User has verified badge
- Nothing to do

**Firestore State:**
```javascript
{
  uid: "verified123",
  email: "verified@example.com",
  idVerification: {
    idType: 'aadhar',
    status: 'approved',
    approvedAt: Date,
    approvedBy: 'admin@example.com',
    frontImageUrl: 'https://...',
    backImageUrl: 'https://...'
  }
}
```

---

### ✅ Scenario 6: Rejected ID User
**Steps:**
1. User uploaded ID but admin rejected it
2. User logs back in

**Expected Result:**
- ❌ Modal does NOT appear initially
- User can see rejection message on Profile
- Can resubmit from Profile page

**Firestore State:**
```javascript
{
  uid: "rejected123",
  email: "rejected@example.com",
  idVerification: {
    idType: 'aadhar',
    status: 'rejected',
    rejectedAt: Date,
    rejectedBy: 'admin@example.com',
    rejectionReason: 'Image not clear',
    frontImageUrl: 'https://...',
    backImageUrl: 'https://...'
  }
}
```

---

## When Modal Shows - Summary

| Condition | Modal Shows? |
|-----------|--------------|
| `!userData.idVerification && !userData.idVerificationSkipped` | ✅ YES |
| `!userData.idVerification && userData.idVerificationSkipped` | ❌ No (user skipped) |
| `userData.idVerification?.status === 'pending'` | ❌ No (under review) |
| `userData.idVerification?.status === 'approved'` | ❌ No (verified) |
| `userData.idVerification?.status === 'rejected'` | ❌ No (can resubmit from profile) |

---

## How to Test Locally

### Test 1: Simulate Old User Without ID
1. Go to Firebase Console → Firestore Database
2. Find an existing user document
3. Make sure it DOES NOT have:
   - `idVerification` field
   - `idVerificationSkipped` field
4. Log in with that user
5. **Expected:** Modal should appear ✅

### Test 2: Simulate User Who Skipped
1. Go to Firebase Console → Firestore Database
2. Find/create a user document
3. Add field: `idVerificationSkipped: true`
4. Remove `idVerification` field if it exists
5. Log in with that user
6. **Expected:** Modal should NOT appear ❌

### Test 3: Check Modal Doesn't Re-appear
1. Log in as a user without ID
2. Modal appears → Click "Skip for Now"
3. Modal closes
4. Log out
5. Log back in
6. **Expected:** Modal should NOT appear ❌ (because skip was saved)

---

## Browser Console Logs

When testing, check browser console for helpful logs:

### For New Users:
```
New user detected - showing ID verification modal
```

### For Existing Users:
```javascript
// No special log, but you can add one:
console.log('Checking user:', userData);
console.log('Should show modal:', !userData.idVerification && !userData.idVerificationSkipped);
```

---

## Troubleshooting

### Issue: Modal not showing for old users

**Possible causes:**
1. User has `idVerificationSkipped: true` in Firestore
2. User has `idVerification` object (even if empty)
3. Modal component not mounted (check Layout.jsx)
4. User not authenticated properly

**How to check:**
```javascript
// Add temporary logging in FirstTimeIDVerificationModal.jsx
console.log('User data:', userData);
console.log('Has idVerification:', !!userData?.idVerification);
console.log('Has skipped:', !!userData?.idVerificationSkipped);
console.log('Should show:', !userData?.idVerification && !userData?.idVerificationSkipped);
```

### Issue: Modal showing when it shouldn't

**Possible causes:**
1. User document doesn't exist (treated as new user)
2. `idVerification` field was deleted
3. Firestore rules preventing read

**How to check:**
```javascript
// Check if document exists
const userDoc = await getDoc(doc(db, 'users', user.uid));
console.log('Document exists:', userDoc.exists());
console.log('Document data:', userDoc.data());
```

---

## Migration for Existing Users

If you have many existing users without ID verification:

### Option 1: Let them see modal on next login
- No action needed
- Modal will appear for all users without `idVerification`
- Users can skip if they want

### Option 2: Bulk mark all as skipped (if optional)
```javascript
// Run once in Firebase Console or admin script
const usersRef = collection(db, 'users');
const snapshot = await getDocs(usersRef);

snapshot.forEach(async (doc) => {
  const data = doc.data();
  if (!data.idVerification && !data.idVerificationSkipped) {
    await updateDoc(doc.ref, {
      idVerificationSkipped: true,
      idVerificationSkippedAt: new Date()
    });
  }
});
```

### Option 3: Gradual rollout
- Only show to users created after a certain date
- Add logic like:
```javascript
const accountAge = new Date() - new Date(userData.createdAt);
const showForOldUsers = accountAge < 30 * 24 * 60 * 60 * 1000; // 30 days
const shouldShow = !userData.idVerification && !userData.idVerificationSkipped && showForOldUsers;
```
