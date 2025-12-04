# Deploy Firestore Security Rules

The Firestore security rules need to be deployed to Firebase for them to take effect.

## Option 1: Using Firebase CLI

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Use the existing `firestore.rules` file

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Option 2: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `droploop-1b7ff`
3. Go to **Firestore Database** → **Rules** tab
4. Copy the contents from `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

## Verify Rules

After deploying, the rules should allow:
- ✅ **Posts**: Public read access (anyone can browse)
- ✅ **Users**: Public read access (for profiles)
- ✅ **Reviews**: Public read access (for viewing reviews)
- ✅ **Bids**: Authenticated users only
- ✅ **Chats**: Participants only

## Current Rules Summary

- **Posts**: `allow read: if true;` - Anyone can read posts
- **Users**: `allow read: if true;` - Anyone can read user profiles
- **Reviews**: `allow read: if true;` - Anyone can read reviews
- **Bids**: `allow read: if isAuthenticated();` - Only authenticated users
- **Chats**: Only participants can access

