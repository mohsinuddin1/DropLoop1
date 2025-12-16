# User Signup Fix - Summary

## Problem
New users signing up were **not being added to the Firestore database**, even though the signup appeared to succeed.

## Root Causes Identified

### 1. **Firestore Security Rules Issue** ❌
The security rule for the `users` collection was trying to access `resource.data` during **creation**, but this field only exists during **updates**, not creation:

```javascript
// OLD RULE (BROKEN)
allow write: if isOwner(userId) 
             && (!request.resource.data.diff(resource.data).affectedKeys().hasAny([...]))
```

When a new user tried to sign up, `resource.data` was `null`, causing a permission denied error.

### 2. **Silent Error Handling** ⚠️
In `AuthContext.jsx`, Firestore errors during signup were caught and logged but **not thrown**, so:
- The signup appeared successful to the user
- But the user document was never created in Firestore
- Users could authenticate but had no profile data

```javascript
// OLD CODE (BROKEN)
try {
    await setDoc(doc(db, "users", user.uid), {...});
} catch (firestoreError) {
    console.error("Firestore Error during signup (proceeding anyway):", firestoreError);
    // ❌ Error swallowed - signup continues even though DB write failed!
}
```

## Fixes Applied ✅

### Fix #1: Updated Firestore Security Rules
**File:** `firestore.rules`

Split the `write` permission into separate `create` and `update` rules:

```javascript
match /users/{userId} {
  allow read: if true;
  
  // ✅ NEW: Allow authenticated users to create their own profile
  allow create: if isOwner(userId);
  
  // ✅ NEW: Allow users to update their profile, but protect admin-only fields
  allow update: if isOwner(userId) 
                && (!request.resource.data.diff(resource.data).affectedKeys()
                    .hasAny(['idVerification.status', 'idVerification.approvedAt', ...]));
  
  // Admin can do anything
  allow write: if isAdmin();
  allow delete: if isAdmin();
}
```

**Why this works:**
- `create` rule doesn't reference `resource.data` (which doesn't exist yet)
- `update` rule can safely use `resource.data.diff()` since the document exists
- Admin rules remain unchanged

### Fix #2: Proper Error Handling in AuthContext
**File:** `src/context/AuthContext.jsx`

Removed the nested try-catch that was suppressing Firestore errors:

```javascript
// ✅ NEW CODE
const signupWithEmail = async (email, password, name, phoneNumber) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        await sendEmailVerification(user);
        await updateProfile(user, { displayName: name });

        // If this fails, the entire signup fails
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            displayName: name,
            email: email,
            phoneNumber: phoneNumber || null,
            photoURL: null,
            createdAt: new Date().toISOString()
        });

        return user;
    } catch (error) {
        console.error("Signup Error", error);
        if (error.code === 'permission-denied') {
            throw new Error('Failed to create user profile. Please contact support if this persists.');
        }
        throw error;
    }
};
```

**Benefits:**
- Errors are now properly propagated to the UI
- Users see a clear error message if signup fails
- No partial signups where auth succeeds but database write fails

## Deployment Steps 🚀

### Step 1: Deploy Firestore Rules
Since there's no `firebase.json` file, deploy manually through Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file
5. Paste into the Firebase Console rules editor
6. Click **Publish**

### Step 2: Test the Fix
1. Clear your browser cache and local storage
2. Try signing up with a new test email
3. Check the Firestore console to verify the user document was created in the `users` collection

### Step 3: Verify Existing Users
Check if any existing users are missing from the Firestore `users` collection:
- Look for authenticated users in Firebase Authentication
- Cross-reference with the `users` collection in Firestore
- If any are missing, they'll need to be manually added or asked to re-register

## Expected Behavior After Fix ✓

**Successful Signup:**
- User enters email, password, name
- Firebase Authentication creates the auth account
- Firestore creates user document in `users` collection
- Email verification sent
- User redirected to dashboard

**Failed Signup (if Firestore rules still deny):**
- Clear error message shown to user
- Auth account may be created, but user cannot proceed
- Error logged in console for debugging

## Testing Checklist

- [ ] Deploy Firestore rules to production
- [ ] Test email signup with new account
- [ ] Verify user document created in Firestore `users` collection
- [ ] Test Google Sign-In with new account
- [ ] Verify existing users can still log in
- [ ] Check admin dashboard can see all users

## Additional Notes

- The fix also applies to Google Sign-In (`loginWithGoogle`)
- Admin privileges remain unchanged (email: mohsinuddin64@gmail.com)
- ID verification rules are still protected from user modification
