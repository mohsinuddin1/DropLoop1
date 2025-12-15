# 🔍 ID Upload Error - Debugging Guide

## Error: "Failed to upload images. Please try again."

Let's find out what's wrong step-by-step.

---

## Step 1: Check Browser Console (MOST IMPORTANT)

### Open Browser Console:
1. **Chrome/Edge:** Press `F12` or `Ctrl + Shift + J`
2. **Firefox:** Press `F12` or `Ctrl + Shift + K`

### Look for Error Messages:
In the Console tab, you should see error messages when upload fails.

**Common errors you might see:**

### Error 1: "Invalid API key" or "unauthorized"
```
Error uploading image: {statusCode: 401, error: "Invalid API key"}
```
**Solution:** Your `.env` file is missing or has wrong Supabase credentials

### Error 2: "new row violates row-level security policy"
```
Error uploading image: {statusCode: 403, error: "new row violates row-level security policy"}
```
**Solution:** You haven't created the INSERT policy in Supabase

### Error 3: "Bucket not found"
```
Error uploading image: {statusCode: 404, error: "Bucket not found"}
```
**Solution:** The bucket `id-verifications` doesn't exist

### Error 4: Network error
```
Error uploading image: TypeError: Failed to fetch
```
**Solution:** Check your internet connection or Supabase is down

---

## Step 2: Verify .env File

Open your `.env` file:
```
c:\Users\mohsi\code\antiGravity\DropLoop1oringinal\.env
```

It should contain:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
```

### Check:
- [ ] File exists
- [ ] Has `VITE_SUPABASE_URL` (not just `SUPABASE_URL`)
- [ ] Has `VITE_SUPABASE_ANON_KEY` (not just `SUPABASE_ANON_KEY`)
- [ ] URL starts with `https://`
- [ ] Anon key is a long string (JWT token)

### If .env is missing or wrong:
1. Go to Supabase Dashboard → Settings → API
2. Copy **Project URL** → paste in `.env` as `VITE_SUPABASE_URL`
3. Copy **anon public** key → paste in `.env` as `VITE_SUPABASE_ANON_KEY`
4. **Restart dev server:** Stop and run `npm run dev` again

---

## Step 3: Check Supabase Bucket

1. Go to Supabase Dashboard
2. Storage → Check if `id-verifications` bucket exists
3. Click on the bucket → Check it's **Private** (Public: OFF)

---

## Step 4: Check Policies

1. Storage → Policies
2. Verify you have these policies for `id-verifications`:

```
✅ Users can upload own ID images (INSERT)
✅ Users can read own ID images (SELECT)
```

If missing, create them using the steps I provided earlier.

---

## Step 5: Test Supabase Connection

Create this test file to verify Supabase is working:

**File:** `src/test-supabase.js`
```javascript
import { supabase } from './supabase/client';

export const testSupabaseConnection = async () => {
    console.log('🔍 Testing Supabase connection...');
    
    // Check if credentials are loaded
    console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    // Test bucket access
    try {
        const { data, error } = await supabase.storage
            .from('id-verifications')
            .list();
        
        if (error) {
            console.error('❌ Bucket access error:', error);
        } else {
            console.log('✅ Bucket accessible! Files:', data);
        }
    } catch (err) {
        console.error('❌ Connection error:', err);
    }
};

// Run test
testSupabaseConnection();
```

Run this in your browser console after importing it.

---

## Step 6: Check File Upload Function

The upload happens in `src/utils/uploadImage.js`. 

**Current code uploads to:**
```javascript
await supabase.storage
    .from(bucket)  // bucket = 'id-verifications'
    .upload(filePath, file);
```

**Make sure:**
- Bucket name is exactly `id-verifications`
- File is a valid image
- File size < 5MB

---

## Step 7: Add Better Error Logging

Let's improve the error message to see what's actually failing.

Update `src/components/IDUpload.jsx`:

Find this section (around line 97):
```javascript
} catch (err) {
    console.error('Upload error:', err);
    setError('Failed to upload images. Please try again.');
}
```

Change it to:
```javascript
} catch (err) {
    console.error('Upload error:', err);
    
    // Show more detailed error
    let errorMessage = 'Failed to upload images. ';
    if (err.message) {
        errorMessage += err.message;
    } else if (err.error) {
        errorMessage += err.error;
    } else {
        errorMessage += 'Please try again.';
    }
    
    setError(errorMessage);
}
```

This will show the actual error message.

---

## Step 8: Common Issues Checklist

| Issue | Check | Solution |
|-------|-------|----------|
| 🔴 No .env file | File exists? | Create `.env` with Supabase credentials |
| 🔴 Wrong env vars | Starts with `VITE_`? | Rename to `VITE_SUPABASE_URL` |
| 🔴 Dev server not restarted | Restarted after .env change? | Stop and restart `npm run dev` |
| 🔴 Bucket missing | Bucket exists in Supabase? | Create `id-verifications` bucket |
| 🔴 No policies | Policies created? | Create INSERT and SELECT policies |
| 🔴 User not authenticated | Logged in? | Sign in first, then try upload |
| 🔴 File too large | File < 5MB? | Use smaller image |
| 🔴 Wrong file type | Is it an image? | Use PNG, JPG, or JPEG |

---

## Quick Debug Commands

### Check if .env is loaded:
Open browser console and type:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

Should show your Supabase URL and key (not `undefined`)

### Check Supabase client:
```javascript
import { supabase } from './supabase/client';
console.log(supabase);
```

Should show Supabase client object (not `undefined`)

---

## Most Likely Causes (Ranked):

1. **Missing or incorrect .env file** (80% of cases)
   - Solution: Add/fix `.env` and restart server

2. **Policies not created** (10% of cases)
   - Solution: Create INSERT policy in Supabase

3. **Bucket doesn't exist** (5% of cases)
   - Solution: Create `id-verifications` bucket

4. **Dev server not restarted** (3% of cases)
   - Solution: Restart `npm run dev`

5. **User not logged in** (2% of cases)
   - Solution: Sign in before uploading

---

## 🎯 Quick Fix Steps

Try these in order:

1. **Check browser console** - See actual error message
2. **Verify .env file** - Has correct Supabase credentials
3. **Restart dev server** - Stop and run `npm run dev`
4. **Check Supabase bucket** - `id-verifications` exists
5. **Check policies** - INSERT policy created
6. **Test with small image** - Use PNG < 1MB
7. **Try in incognito** - Rule out browser cache issues

---

## Need More Help?

**Tell me:**
1. What error message you see in browser console?
2. Does `.env` file exist with Supabase credentials?
3. Can you see `id-verifications` bucket in Supabase?
4. Did you create the policies?
5. Are you logged in when trying to upload?

**Share the error message from browser console** and I'll help you fix it!
