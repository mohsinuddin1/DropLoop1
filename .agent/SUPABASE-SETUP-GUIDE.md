# 📘 Supabase Storage Setup Guide for ID Verification

## Complete Step-by-Step Instructions

### 🎯 Overview
You need to create a **private storage bucket** in Supabase to store user ID images securely. This guide will walk you through every step with exact settings.

---

## Step 1: Access Your Supabase Project

1. Go to **https://supabase.com/dashboard**
2. Sign in with your account
3. Select your **DropLoop project** from the list

---

## Step 2: Create the Storage Bucket

### Navigate to Storage:
1. In the left sidebar, click **"Storage"**
2. You'll see existing buckets (like `profile-pictures`, `item-images`, etc.)
3. Click the **"New bucket"** button (green button, top-right)

### Create Bucket Settings:
Fill in the following:

**Bucket Name:**
```
id-verifications
```
⚠️ **Important:** Type exactly as shown above (no spaces, lowercase, with hyphen)

**Public Bucket:**
```
❌ OFF (Toggle should be GRAY/OFF, NOT green)
```
⚠️ **Critical:** Make sure this is **OFF** for privacy and security!

**File Size Limit:**
```
52428800 (50 MB)
```
Or leave default - we validate 5MB in the app anyway

**Allowed MIME types:**
```
image/*
```
Or leave empty (leave blank to allow all images)

Click **"Create bucket"** button

✅ **Result:** You should now see `id-verifications` in your buckets list

---

## Step 3: Configure Bucket Policies

After creating the bucket, you need to set up access policies so users can upload and view their IDs.

### Navigate to Policies:

**Option 1: Quick Access**
1. In the Storage section, find `id-verifications` bucket
2. Click the **three dots (⋮)** next to the bucket name
3. Select **"Manage policies"**

**Option 2: From Policies Tab**
1. Click **"Policies"** in the Storage section
2. Find the `id-verifications` bucket in the list

---

## Step 4: Create Upload Policy

### Click "New Policy" button

You'll see two options:
- "Get started quickly" (templates)
- "For full customization" (custom policy)

Choose: **"For full customization"**

### Policy Settings:

**Policy Name:**
```
Users can upload ID images
```

**Allowed Operation:**
- ✅ Check **INSERT** only
- ❌ Leave SELECT, UPDATE, DELETE unchecked

**Target Roles:**
- Select: **authenticated**
- (This means only logged-in users can upload)

**Policy Definition (USING expression):**

Click the **"Show USING expression"** toggle or scroll down to the policy editor

Paste this SQL:
```sql
bucket_id = 'id-verifications'
```

**What this does:** Allows any authenticated user to upload files to the `id-verifications` bucket

### Alternative (Stricter Policy):
If you want users to only upload to their own folder:
```sql
bucket_id = 'id-verifications' AND auth.uid()::text = (storage.foldername(name))[1]
```

Click **"Save policy"** button

✅ **Result:** Upload policy created!

---

## Step 5: Create Read/Download Policy

### Click "New Policy" button again

Choose: **"For full customization"**

### Policy Settings:

**Policy Name:**
```
Users can read ID images
```

**Allowed Operation:**
- ✅ Check **SELECT** only
- ❌ Leave INSERT, UPDATE, DELETE unchecked

**Target Roles:**
- Select: **authenticated**

**Policy Definition (USING expression):**
```sql
bucket_id = 'id-verifications'
```

**What this does:** Allows authenticated users to view/download ID images

### Alternative (Stricter - Own Files Only):
```sql
bucket_id = 'id-verifications' AND auth.uid()::text = (storage.foldername(name))[1]
```

Click **"Save policy"** button

✅ **Result:** Read policy created!

---

## Step 6: Optional - Admin Access Policy

If you want admins to access all ID images:

### Create another policy:

**Policy Name:**
```
Admins can read all ID images
```

**Allowed Operation:**
- ✅ SELECT

**Target Roles:**
- Select: **authenticated**

**Policy Definition:**
```sql
bucket_id = 'id-verifications' AND auth.email() = 'mohsinuddin64@gmail.com'
```

Replace `mohsinuddin64@gmail.com` with your admin email

✅ **Result:** Admin can view all submitted IDs!

---

## Step 7: Verify Your Setup

### Check Bucket Settings:
1. Go to **Storage** → `id-verifications`
2. Verify settings:
   - ✅ Public: **OFF** (shows lock icon 🔒)
   - ✅ Policies: Shows **2 policies** (or 3 if you added admin policy)

### Check Policies:
1. Click **"Policies"** tab
2. You should see:
   - ✅ "Users can upload ID images" - INSERT
   - ✅ "Users can read ID images" - SELECT
   - ✅ (Optional) "Admins can read all ID images" - SELECT

---

## Step 8: Get Your Supabase Credentials

Make sure your `.env` file has the correct credentials:

### Find Your Credentials:
1. In Supabase Dashboard, click **"Settings"** (gear icon, bottom-left)
2. Click **"API"** in the left menu
3. You'll see:

**Project URL:**
```
https://xxxxxxxxxx.supabase.co
```
Copy this value

**Project API keys:**
Find the **`anon` `public`** key:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
Copy this value (it's a long string)

### Update Your .env File:

Open `c:\Users\mohsi\code\antiGravity\DropLoop1oringinal\.env`

Make sure you have:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ Replace with YOUR actual values from the Supabase dashboard

---

## Step 9: Test the Upload

### In Your App:
1. Start dev server: `npm run dev` ✓ (already running)
2. Sign up or log in
3. The ID verification modal should appear
4. Select ID type and upload images
5. Click "Submit for Verification"

### Check Supabase:
1. Go to Supabase Dashboard → **Storage** → `id-verifications`
2. You should see the uploaded images!
3. Click on an image to view it

---

## 📋 Quick Reference - Policy Templates

### Simple Policy (Anyone Authenticated Can Upload/Read):

**INSERT Policy:**
```sql
bucket_id = 'id-verifications'
```

**SELECT Policy:**
```sql
bucket_id = 'id-verifications'
```

### Strict Policy (Users Only Access Their Own Files):

**INSERT Policy:**
```sql
bucket_id = 'id-verifications' AND auth.uid()::text = (storage.foldername(name))[1]
```

**SELECT Policy:**
```sql
bucket_id = 'id-verifications' AND auth.uid()::text = (storage.foldername(name))[1]
```

### Admin Policy (Admin Can Access All):

**SELECT Policy:**
```sql
bucket_id = 'id-verifications' AND auth.email() = 'your-admin-email@gmail.com'
```

---

## 🔧 Troubleshooting

### Error: "new row violates row-level security policy"
**Solution:** Make sure you created the INSERT policy for authenticated users

### Error: "Permission denied"
**Solution:** Check that:
1. User is logged in (authenticated)
2. Policies are enabled for the bucket
3. Policy definition is correct

### Images Not Uploading:
**Check:**
1. ✅ Bucket name is exactly `id-verifications`
2. ✅ `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. ✅ Dev server restarted after changing `.env`
4. ✅ Policies are created and enabled

### Can't View Uploaded Images:
**Solution:** Create the SELECT policy (Step 5)

---

## 📊 Visual Summary

```
┌─────────────────────────────────────────┐
│  Supabase Storage Structure             │
├─────────────────────────────────────────┤
│                                         │
│  📁 profile-pictures (existing)         │
│  📁 item-images (existing)              │
│  🔒 id-verifications (NEW - PRIVATE)    │
│     │                                   │
│     ├─ 📄 0.123456.png (front)         │
│     └─ 📄 0.789012.png (back)          │
│                                         │
│  Policies:                              │
│  ✅ Users can upload (INSERT)           │
│  ✅ Users can read (SELECT)             │
│  ✅ Admin can read all (SELECT)         │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist

Before you're done, verify:

- [ ] Created `id-verifications` bucket
- [ ] Bucket is set to **Private** (Public: OFF)
- [ ] Created INSERT policy for uploads
- [ ] Created SELECT policy for reading
- [ ] (Optional) Created admin policy
- [ ] Updated `.env` with correct credentials
- [ ] Restarted dev server
- [ ] Tested upload in app
- [ ] Verified images appear in Supabase Storage

---

## 🎉 You're Done!

Your Supabase storage is now configured for secure ID verification image uploads!

Users can now:
- ✅ Upload their ID images
- ✅ View their own uploaded images
- ✅ Images are stored securely (private bucket)
- ✅ Admins can review all submissions

### Next Steps:
1. Test the full flow (sign up → modal → upload → admin review)
2. Check Admin Dashboard → ID Verification tab
3. Approve some IDs to see the verified badge appear!

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs: Dashboard → Logs → Storage
3. Verify policy SQL syntax is correct
4. Make sure bucket name matches exactly: `id-verifications`

---

**Last Updated:** 2025-12-15
**Compatible with:** Supabase Dashboard (Latest Version)
