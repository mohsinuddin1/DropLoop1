# How to Apply Firestore Security Rules

## Updated Rules File: `firestore.rules`

Your Firestore security rules have been updated to include support for the admin dashboard's soft delete system.

## What Was Added:

### 1. Admin Helper Function
```javascript
function isAdmin() {
  return request.auth != null && request.auth.token.email == 'mohsinuddin64@gmail.com';
}
```

### 2. Deleted Posts Collection
```javascript
match /deletedPosts/{deletedPostId} {
  allow read, write: if isAdmin();
}
```

### 3. Enhanced Posts & Bids Rules
- Posts: Admin can delete any post (needed for soft delete)
- Bids: Admin can delete any bid (needed for cascade delete)

## How to Apply Rules to Firebase:

### Method 1: Firebase Console (Recommended)

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com
   - Select your project

2. **Navigate to Firestore Rules:**
   - Click **Firestore Database** in left sidebar
   - Click **Rules** tab at the top

3. **Copy & Paste Rules:**
   - Open `firestore.rules` file
   - Copy all content
   - Paste into Firebase Console editor
   - **OR** just copy the deletedPosts section if you want to keep your existing rules

4. **Publish:**
   - Click **Publish** button
   - Wait for confirmation (usually instant)

5. **Verify:**
   - Rules should now be active
   - Try using admin dashboard

### Method 2: Firebase CLI (Advanced)

If you have Firebase CLI installed:

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## What Each Rule Does:

### Users Collection
```javascript
match /users/{userId} {
  allow read: if true;  // Anyone can view profiles
  allow write: if isOwner(userId);  // Users can edit their own
}
```

### Posts Collection
```javascript
match /posts/{postId} {
  allow read: if true;  // Public posts
  allow create: if isAuthenticated();  // Logged-in users can create
  allow update: if isAuthenticated() && request.auth.uid == resource.data.userId;  // Owner can edit
  allow delete: if isAuthenticated() && (request.auth.uid == resource.data.userId || isAdmin());  // Owner OR admin can delete
}
```

### Bids Collection
```javascript
match /bids/{bidId} {
  allow read: if isAuthenticated();  // Logged-in users see bids
  allow create: if isAuthenticated();  // Logged-in users can bid
  allow update: if isAuthenticated();  // Can accept/reject
  allow delete: if isAdmin();  // ADMIN ONLY can delete (for cascade)
}
```

### Deleted Posts Collection (NEW!)
```javascript
match /deletedPosts/{deletedPostId} {
  allow read, write: if isAdmin();  // ADMIN ONLY
}
```

## Security Features:

✅ **Admin-Only Access:**
- Only `mohsinuddin64@gmail.com` can access deletedPosts
- Admin can delete any post/bid (needed for moderation)

✅ **User Privacy:**
- Users can only edit their own profiles
- Users can only delete their own posts (unless admin)

✅ **Public Access:**
- Posts are publicly viewable (good for SEO and discovery)
- Profiles are publicly viewable
- Reviews are publicly viewable

✅ **Authentication Required:**
- Creating posts requires login
- Bidding requires login
- Messaging requires login

## Testing After Applying Rules:

### 1. Test Admin Dashboard
```bash
1. Go to /admin
2. Try deleting a post
3. Check console for success messages:
   ✅ "Successfully saved to deletedPosts"
   ✅ "Batch delete completed successfully"
```

### 2. Test Normal User
```bash
1. Login as regular user
2. Try to access /admin
   ✅ Should redirect to home
3. Try to create post
   ✅ Should work
4. Try to delete own post
   ✅ Should work
5. Try to delete someone else's post
   ❌ Should fail (only admin can)
```

### 3. Test Public Access
```bash
1. Logout completely
2. Visit /posts
   ✅ Should see all posts
3. Try to create post
   ❌ Should require login
```

## Troubleshooting:

### "Permission Denied" Error

If you still get permission denied:

1. **Wait 1-2 minutes** after publishing rules
2. **Sign out and sign back in** as admin
3. **Clear browser cache**
4. **Check email** - must be exactly `mohsinuddin64@gmail.com`
5. **Verify rules** - check they're published in Firebase Console

### Rules Not Updating

1. Go to Firebase Console
2. Click **Rules** tab
3. Confirm your changes are there
4. Click **Publish** again
5. Wait 1 minute and try again

### Still Having Issues?

Check these:

1. **Firebase Project:**
   - Confirm correct project in Firebase Console
   - Check `.env` file matches project

2. **Authentication:**
   - Verify logged in as admin email
   - Check user token in DevTools > Application > IndexedDB

3. **Console Errors:**
   - Open browser console (F12)
   - Look for specific error messages
   - Share error codes for help

## Quick Verification:

After applying rules, run this checklist:

- [ ] Rules published in Firebase Console
- [ ] Waited 1-2 minutes
- [ ] Logged in as `mohsinuddin64@gmail.com`
- [ ] Can access `/admin`
- [ ] Can delete a post (check console for success)
- [ ] Post appears in "Deleted Posts" tab
- [ ] Can restore deleted post
- [ ] Regular users can still create posts
- [ ] Regular users can still bid

## Firestore Rules Simulator:

You can test rules in Firebase Console:

1. Go to **Firestore Database** > **Rules** tab
2. Click **Rules Playground** button (top right)
3. Test scenarios:
   - Read `/deletedPosts/{postId}` as admin email ✅ Should allow
   - Read `/deletedPosts/{postId}` as regular user ❌ Should deny
   - Delete `/posts/{postId}` as admin ✅ Should allow
   - Delete `/bids/{bidId}` as admin ✅ Should allow

## Complete Rules Summary:

```
✅ deletedPosts - Admin only (read/write)
✅ posts - Public read, auth create, owner/admin delete
✅ bids - Auth read/create/update, admin delete
✅ users - Public read, owner write
✅ reviews - Public read, auth create, owner modify
✅ notifications - Owner only
✅ chats - Participants only
```

## Next Steps:

1. **Copy content from `firestore.rules`**
2. **Paste into Firebase Console**
3. **Click Publish**
4. **Test admin dashboard**
5. **Success! 🎉**

Your admin dashboard will now work properly with full soft delete support!
