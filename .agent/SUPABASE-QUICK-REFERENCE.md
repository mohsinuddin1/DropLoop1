# 🚀 Supabase Setup - Quick Reference Card

## 1️⃣ Create Bucket (2 minutes)

**Location:** Supabase Dashboard → Storage → "New bucket"

```
Bucket Name:     id-verifications
Public Bucket:   ❌ OFF (must be PRIVATE)
```

Click **"Create bucket"**

---

## 2️⃣ Create Upload Policy (1 minute)

**Location:** Storage → Policies → "New Policy" → "For full customization"

```
Policy Name:      Users can upload ID images
Operation:        ✅ INSERT only
Target Roles:     authenticated
Policy SQL:       bucket_id = 'id-verifications'
```

Click **"Save policy"**

---

## 3️⃣ Create Read Policy (1 minute)

**Location:** Storage → Policies → "New Policy" → "For full customization"

```
Policy Name:      Users can read ID images  
Operation:        ✅ SELECT only
Target Roles:     authenticated
Policy SQL:       bucket_id = 'id-verifications'
```

Click **"Save policy"**

---

## 4️⃣ Verify .env File

**Location:** `c:\Users\mohsi\code\antiGravity\DropLoop1oringinal\.env`

```env
VITE_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ Get these from: Supabase Dashboard → Settings → API

---

## ✅ Done!

Total time: **~4 minutes**

Test by uploading an ID in your app!

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Upload fails | Check INSERT policy exists |
| Can't view images | Check SELECT policy exists |
| "Permission denied" | Verify user is logged in |
| Wrong bucket error | Bucket name must be `id-verifications` exactly |

---

## 📱 Where to Find Things in Supabase

```
Supabase Dashboard
├── Storage (left sidebar)
│   ├── Create bucket here
│   └── View uploaded files here
│
├── Policies (inside Storage)
│   └── Create policies here
│
└── Settings (bottom-left)
    └── API (to get credentials)
```

---

**Full Guide:** See `SUPABASE-SETUP-GUIDE.md` for detailed instructions with screenshots.
