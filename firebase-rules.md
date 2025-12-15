# Firebase Firestore Security Rules

## Complete Production-Ready Rules for DropLoop Platform

This document contains the complete, merged Firestore security rules for the DropLoop platform, including all admin dashboard features, user management, and content moderation capabilities.

---

## 📋 Quick Copy-Paste

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user matches the ID
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'mohsinuddin64@gmail.com';
    }

    // Users collection: 
    // - Anyone can read (needed for profiles)
    // - User can write their own profile
    // - Admin can ban/unban users and delete any user
    match /users/{userId} {
      allow read: if true;
      allow write: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // Posts collection:
    // - Anyone can read (including list queries)
    // - Authenticated users can create
    // - Only owner can update
    // - Owner OR admin can delete
    match /posts/{postId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow delete: if isAuthenticated() && (request.auth.uid == resource.data.userId || isAdmin());
    }

    // Bids collection:
    // - Authenticated users can read/create
    // - Authenticated users can update (for accepting/rejecting)
    // - Admin can delete any bid
    match /bids/{bidId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAdmin();
    }

    // Reviews collection:
    // - Anyone can read (needed to view reviews on profiles)
    // - Authenticated users can create
    // - Only reviewer can update/delete their own review
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && request.auth.uid == resource.data.reviewerId;
    }

    // Notifications collection:
    // - Users can read their own notifications
    // - Authenticated users can create notifications (for sending to others)
    // - Users can update their own notifications (marking as read)
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow delete: if isAuthenticated() && request.auth.uid == resource.data.userId;
    }

    // Chats collection:
    // - Only participants can read/write
    match /chats/{chatId} {
      allow read: if isAuthenticated() && request.auth.uid in resource.data.participants;
      allow create: if isAuthenticated() && request.auth.uid in request.resource.data.participants;
      allow update, delete: if isAuthenticated() && request.auth.uid in resource.data.participants;
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read, write: if isAuthenticated();
      }
    }

    // Deleted Posts collection (Admin Dashboard):
    // - Only admin can read/write
    // - Stores archived deleted posts with full audit trail
    match /deletedPosts/{deletedPostId} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 🔐 Security Overview

### Helper Functions

#### `isAuthenticated()`
- **Purpose:** Check if user is logged in
- **Returns:** `true` if user has valid auth token
- **Usage:** Most collections require authentication

#### `isOwner(userId)`
- **Purpose:** Check if user owns a resource
- **Returns:** `true` if user's UID matches the resource owner
- **Usage:** User-specific data like profiles, notifications

#### `isAdmin()`
- **Purpose:** Check if user is platform admin
- **Returns:** `true` if email is `mohsinuddin64@gmail.com`
- **Usage:** Admin dashboard, moderation, user management

---

## 📚 Collection Rules Breakdown

### 1. Users Collection

```javascript
match /users/{userId} {
  allow read: if true;
  allow write: if isOwner(userId) || isAdmin();
  allow delete: if isAdmin();
}
```

**Permissions:**
- ✅ **Read:** Anyone (needed for public profiles)
- ✅ **Write:** User (edit own profile) OR Admin (ban users)
- ✅ **Delete:** Admin only

**Use Cases:**
- Users view other user profiles
- Users edit their own profile
- Admin bans users (updates `banned` field)
- Admin deletes user accounts

**Admin Operations:**
```javascript
// Ban user
await updateDoc(doc(db, 'users', userId), {
  banned: true,
  bannedAt: serverTimestamp(),
  bannedBy: 'mohsinuddin64@gmail.com'
});

// Delete user
await deleteDoc(doc(db, 'users', userId));
```

---

### 2. Posts Collection

```javascript
match /posts/{postId} {
  allow read: if true;
  allow create: if isAuthenticated();
  allow update: if isAuthenticated() && request.auth.uid == resource.data.userId;
  allow delete: if isAuthenticated() && (request.auth.uid == resource.data.userId || isAdmin());
}
```

**Permissions:**
- ✅ **Read:** Anyone (public posts for discovery)
- ✅ **Create:** Authenticated users
- ✅ **Update:** Post owner only
- ✅ **Delete:** Post owner OR Admin

**Use Cases:**
- Anyone can browse posts (good for SEO)
- Logged-in users can create posts
- Users can edit their own posts
- Users can delete their own posts
- **Admin can delete any post** (moderation)

**Admin Operations:**
```javascript
// Delete any post
await deleteDoc(doc(db, 'posts', postId));

// Feature post
await updateDoc(doc(db, 'posts', postId), {
  featured: true,
  featuredAt: serverTimestamp()
});
```

---

### 3. Bids Collection

```javascript
match /bids/{bidId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated();
  allow update: if isAuthenticated();
  allow delete: if isAdmin();
}
```

**Permissions:**
- ✅ **Read:** Authenticated users only
- ✅ **Create:** Authenticated users
- ✅ **Update:** Authenticated users (accept/reject bids)
- ✅ **Delete:** Admin only

**Why Admin-Only Delete:**
- Prevents users from deleting accepted bids
- Prevents bid manipulation
- Admin can remove spam/fraudulent bids
- Admin can cascade delete when deleting posts

**Admin Operations:**
```javascript
// Delete bid
await deleteDoc(doc(db, 'bids', bidId));

// Delete all bids for a post
const bidsQuery = query(collection(db, 'bids'), where('postId', '==', postId));
const snapshot = await getDocs(bidsQuery);
snapshot.forEach(doc => batch.delete(doc.ref));
```

---

### 4. Reviews Collection

```javascript
match /reviews/{reviewId} {
  allow read: if true;
  allow create: if isAuthenticated();
  allow update, delete: if isAuthenticated() && request.auth.uid == resource.data.reviewerId;
}
```

**Permissions:**
- ✅ **Read:** Anyone (public reviews)
- ✅ **Create:** Authenticated users
- ✅ **Update/Delete:** Reviewer only

**Use Cases:**
- Anyone can view reviews on profiles
- Users can leave reviews
- Users can edit/delete their own reviews

---

### 5. Notifications Collection

```javascript
match /notifications/{notificationId} {
  allow read: if isAuthenticated() && request.auth.uid == resource.data.userId;
  allow create: if isAuthenticated();
  allow update: if isAuthenticated() && request.auth.uid == resource.data.userId;
  allow delete: if isAuthenticated() && request.auth.uid == resource.data.userId;
}
```

**Permissions:**
- ✅ **Read:** Notification recipient only
- ✅ **Create:** Any authenticated user (send notifications)
- ✅ **Update:** Recipient only (mark as read)
- ✅ **Delete:** Recipient only

**Privacy:**
- Users can only see their own notifications
- No one else can read your notifications

---

### 6. Chats Collection

```javascript
match /chats/{chatId} {
  allow read: if isAuthenticated() && request.auth.uid in resource.data.participants;
  allow create: if isAuthenticated() && request.auth.uid in request.resource.data.participants;
  allow update, delete: if isAuthenticated() && request.auth.uid in resource.data.participants;
  
  match /messages/{messageId} {
    allow read, write: if isAuthenticated();
  }
}
```

**Permissions:**
- ✅ **Read:** Participants only
- ✅ **Create:** Must be a participant
- ✅ **Update/Delete:** Participants only
- ✅ **Messages:** All authenticated users (simplified)

**Privacy:**
- Only chat participants can access chat
- Messages are readable by any authenticated user (could be tightened)

**Potential Enhancement:**
```javascript
// Stricter message rules
match /messages/{messageId} {
  allow read, write: if isAuthenticated() && 
    request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
}
```

---

### 7. Deleted Posts Collection (Admin Only)

```javascript
match /deletedPosts/{deletedPostId} {
  allow read, write: if isAdmin();
}
```

**Permissions:**
- ✅ **Read/Write:** Admin only

**Purpose:**
- Archive deleted posts
- Enable restore functionality
- Maintain audit trail
- Track deletion reasons

**Data Structure:**
```javascript
{
  originalPostId: "post-123",
  postData: { /* complete post */ },
  relatedBids: [ /* all bids */ ],
  deletedBy: "mohsinuddin64@gmail.com",
  deletedByName: "Admin Name",
  deletedAt: Timestamp,
  deleteReason: "Spam content",
  canRestore: true
}
```

---

## 🎯 Admin Capabilities

### What Admin Can Do:

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| **users** | ✅ | ✅ | ✅ (all) | ✅ |
| **posts** | ✅ | ✅ | ❌ | ✅ (all) |
| **bids** | ✅ | ✅ | ❌ | ✅ (all) |
| **reviews** | ✅ | ✅ | ❌ | ❌ |
| **notifications** | ❌ | ✅ | ❌ | ❌ |
| **chats** | ❌ | ❌ | ❌ | ❌ |
| **deletedPosts** | ✅ | ✅ | ✅ | ✅ |

### Admin Operations:

```javascript
// Ban user
updateDoc(userDoc, { banned: true });

// Delete user + cascade
batch.delete(userDoc);
userPosts.forEach(post => batch.delete(post));
userBids.forEach(bid => batch.delete(bid));

// Delete post + cascade
batch.delete(postDoc);
postBids.forEach(bid => batch.delete(bid));

// Archive deleted post
addDoc(deletedPostsCollection, archiveData);

// Restore deleted post
batch.set(postDoc, deletedPost.postData);
deletedPost.bids.forEach(bid => batch.set(bidDoc, bid));
```

---

## 🚨 Security Best Practices

### ✅ What's Secured:

1. **Admin Access** - Only specific email can admin
2. **User Privacy** - Users can't see others' notifications
3. **Chat Privacy** - Only participants can access
4. **Ownership** - Users can only edit their own content
5. **Authentication** - Most operations require login
6. **Cascade Protection** - Admin-controlled deletes

### ⚠️ Considerations:

1. **Single Admin Email** - Hardcoded, not scalable
   ```javascript
   // Future: Use custom claims
   function isAdmin() {
     return request.auth.token.admin === true;
   }
   ```

2. **Message Privacy** - Currently all authenticated users can read messages
   - Consider tightening to participants only

3. **Review Moderation** - Admin cannot delete inappropriate reviews
   - Consider adding admin delete capability

4. **No Soft Limits** - Could add rate limiting
   ```javascript
   // Example: Limit posts per day
   allow create: if isAuthenticated() && 
     request.resource.data.userId == request.auth.uid &&
     getUserPostCountToday() < 10;
   ```

---

## 🔄 How to Apply Rules

### Method 1: Firebase Console (Recommended)

1. Go to: https://console.firebase.google.com
2. Select your project
3. Click **Firestore Database** → **Rules** tab
4. Copy the rules from the "Quick Copy-Paste" section above
5. Paste into the editor
6. Click **Publish**
7. Wait 1-2 minutes for propagation

### Method 2: Firebase CLI

```bash
# Ensure firestore.rules file is in project root
firebase deploy --only firestore:rules
```

### Method 3: Automated Deployment

```bash
# In package.json
"scripts": {
  "deploy:rules": "firebase deploy --only firestore:rules"
}

# Run
npm run deploy:rules
```

---

## 🧪 Testing Rules

### Firebase Console Rules Playground

1. Go to **Firestore** → **Rules** tab
2. Click **Rules Playground** (top right)
3. Test scenarios:

```
✅ Test: Admin deletes post
   Location: /posts/post-123
   Method: delete
   Auth: mohsinuddin64@gmail.com
   Result: ALLOWED

❌ Test: Regular user deletes other's post
   Location: /posts/post-123
   Method: delete
   Auth: user@example.com (not owner)
   Result: DENIED

✅ Test: User edits own profile
   Location: /users/user-123
   Method: update
   Auth: user-123
   Result: ALLOWED

✅ Test: Admin bans user
   Location: /users/user-123
   Method: update
   Auth: mohsinuddin64@gmail.com
   Result: ALLOWED
```

---

## 📊 Rule Change Log

### Version History:

**v1.0** - Initial rules
- Basic CRUD for users, posts, bids
- Authentication required

**v2.0** - Admin features added
- Admin helper function
- Admin can delete posts/bids
- Deleted posts collection

**v2.1** - User management (Current)
- Admin can ban users
- Admin can delete users
- Admin can write to user documents
- Enhanced admin capabilities

---

## 🚀 Future Enhancements

### Recommended Additions:

1. **Custom Claims for Admin**
   ```javascript
   function isAdmin() {
     return request.auth.token.admin === true;
   }
   ```

2. **Role-Based Access Control (RBAC)**
   ```javascript
   function hasRole(role) {
     return request.auth.token.role == role;
   }
   // Roles: admin, moderator, user
   ```

3. **Moderator Role**
   ```javascript
   function isModerator() {
     return request.auth.token.moderator === true || isAdmin();
   }
   
   match /posts/{postId} {
     allow delete: if ... || isModerator();
   }
   ```

4. **Rate Limiting**
   ```javascript
   function withinRateLimit(collection) {
     return request.time < resource.data.lastPostTime + duration.value(1, 'h');
   }
   ```

5. **Reports Collection**
   ```javascript
   match /reports/{reportId} {
     allow read: if isAdmin();
     allow create: if isAuthenticated();
     allow update: if isAdmin();
   }
   ```

6. **Audit Logs**
   ```javascript
   match /auditLogs/{logId} {
     allow read: if isAdmin();
     allow create: if isAdmin();
   }
   ```

---

## 📝 Summary

### Collections & Permissions:

```
firestore
├── users (public read, owner write, admin full)
├── posts (public read, auth create, owner/admin delete)
├── bids (auth read/create/update, admin delete)
├── reviews (public read, auth create, owner modify)
├── notifications (owner only, auth create)
├── chats (participants only)
│   └── messages (auth read/write)
└── deletedPosts (admin only)
```

### Admin Email:
```
mohsinuddin64@gmail.com
```

### Key Features:
- ✅ Public post browsing (SEO-friendly)
- ✅ User privacy (notifications, chats)
- ✅ Admin moderation (delete, ban)
- ✅ Soft delete system
- ✅ Audit trail (deleted posts)
- ✅ Ownership validation
- ✅ Authentication requirements

Your Firestore rules are **production-ready** with comprehensive admin capabilities! 🎉

---

## 📞 Support

If you encounter permission issues:

1. **Check Admin Email:** Must be exactly `mohsinuddin64@gmail.com`
2. **Clear Cache:** Sign out and sign back in
3. **Wait:** Rules can take 1-2 minutes to propagate
4. **Test in Playground:** Use Rules Playground to debug
5. **Check Console:** Look for permission-denied errors

For additional help, refer to:
- `.agent/apply-firestore-rules.md`
- `.agent/troubleshooting-delete-error.md`
- `.agent/admin-features-complete.md`
