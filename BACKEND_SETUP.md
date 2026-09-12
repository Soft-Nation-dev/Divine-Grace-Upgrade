# Divine Grace UNN (Branch) - Backend Setup Guide

## 🎯 Overview

This backend serves the **Divine-Grace-Upgrade** branch with:

- **Shared Authentication**: Supabase JWT tokens (same as parent project)
- **Isolated Data Storage**: Branch-specific Cloudflare KV storage for LSTS, prayers, and summit
- **Branch-Prefixed Files**: R2 uploads use `/branch-dgu-upgrade/` prefix for separation
- **Independent Admin List**: Branch-specific admin email configuration

---

## 📋 Prerequisites

Before setting up, ensure you have:

- **Node.js** 16+ and **npm** installed
- **Supabase Account** (shared with parent project)
- **Cloudflare Account** with:
  - R2 bucket created (`divine-grace-storage`)
  - R2 API credentials (Access Key ID & Secret Key)
  - Account ID

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Navigate to Backend Directory

```bash
cd Divine-Grace-Upgrade/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:

- **express**: Web framework
- **@supabase/supabase-js**: Database & auth
- **@aws-sdk/client-s3**: Cloudflare R2 (S3-compatible)
- **multer**: File uploads
- **uuid**: Unique IDs
- **cors**: Cross-origin requests
- **nodemon**: Auto-reload during development

### Step 3: Create .env File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then update with your credentials:

```env
# Supabase (SHARED - same as parent)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Cloudflare R2 (SHARED bucket, but isolated prefix)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY=your_access_key
CLOUDFLARE_R2_SECRET_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET=divine-grace-storage
CLOUDFLARE_R2_PUBLIC_URL=https://divine-grace-storage.your-domain.r2.cloudflarestorage.com

# Branch-Specific Configuration
BRANCH_PREFIX=branch-dgu-upgrade
BRANCH_ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Server
PORT=3002
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BRANCH_FRONTEND_URL=http://localhost:3000
```

### Step 4: Start the Server

**Development** (with auto-reload):

```bash
npm run dev
```

**Production**:

```bash
npm start
```

You should see:

```
╔════════════════════════════════════════════╗
║  🙏 Divine Grace UNN (Branch) Backend     ║
║     Running on http://localhost:3002      ║
║                                            ║
║  ✅ Supabase Auth: Connected             ║
║  ✅ Cloudflare KV: Connected             ║
╚════════════════════════════════════════════╝
```

Visit http://localhost:3002/health to verify health status.

---

## 📁 Project Structure

```
backend/
├── server.js                      # Main Express app
├── config/
│   ├── supabase.js               # Supabase client (auth & profiles)
│   └── cloudflare.js             # R2 client (with branch prefix)
├── middleware/
│   └── auth.js                   # JWT auth + admin checks
├── routes/
│   ├── auth.js                   # Login, signup, profile
│   ├── lsts.js                   # LSTS registrations (isolated)
│   ├── prayers.js                # Prayer requests (isolated)
│   ├── summit.js                 # Summit forms (isolated)
│   ├── messages.js               # Audio uploads (R2 + branch prefix)
│   └── admin.js                  # Admin dashboard
├── utils/
│   └── storage.js                # In-memory storage (dev only)
├── package.json
├── .env.example
└── .gitignore
```

---

## 🔄 Data Flow Architecture

### Shared Components (with Parent)

```
Frontend (Divine-Grace-Upgrade)
            ↓
Backend (localhost:3002)
            ↓ (JWT Auth)
Supabase Project
  ├── users table (SHARED)
  ├── admin_assignments (SHARED - but branch uses BRANCH_ADMIN_EMAILS env var)
  └── audio_messages table (with branch identifier)
```

### Isolated Storage (Branch-Specific)

```
LSTS Registrations     → Memory (in utils/storage.js) or Cloudflare KV
Prayers                → Memory (in utils/storage.js) or Cloudflare KV
Summit Registrations   → Memory (in utils/storage.js) or Cloudflare KV
Audio Files            → R2 bucket with /branch-dgu-upgrade/ prefix
```

---

## 🔐 Authentication

### Login Flow

1. **Frontend** sends email + password to `POST /api/auth/login`
2. **Backend** verifies with shared Supabase
3. **Supabase** returns JWT token + user ID
4. **Frontend** stores token in `sessionStorage.authToken`
5. **All requests** include `Authorization: Bearer {token}` header

### Admin Access

Currently uses environment variable `BRANCH_ADMIN_EMAILS`:

```env
BRANCH_ADMIN_EMAILS=admin@example.com,manager@example.com
```

Any request to `/api/admin/*` checks if user's email is in this list.

---

## 📊 API Endpoints

### Auth Routes

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Send a password recovery link
- `POST /api/auth/reset-password` - Set a new password using a recovery session
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### LSTS Routes (Branch-Isolated)

- `POST /api/lsts` - Submit registration
- `GET /api/lsts` - Get all (admin only)
- `GET /api/lsts/weekly` - Get this week's (admin only)
- `GET /api/lsts/user/week` - Get user's this week
- `GET /api/lsts/user/all` - Get user's all
- `GET /api/lsts/:id` - Get specific

### Prayer Routes (Branch-Isolated)

- `POST /api/prayers` - Submit prayer request
- `GET /api/prayers` - Get all (admin only)
- `GET /api/prayers/:id` - Get specific

### Summit Routes (Branch-Isolated)

- `POST /api/summit` - Submit registration
- `GET /api/summit` - Get all (admin only)
- `GET /api/summit/user/all` - Get user's registrations
- `GET /api/summit/:id` - Get specific

### Messages Routes (Branch-Prefixed R2)

- `POST /api/messages/upload` - Upload audio (admin only)
- `GET /api/messages` - Get all (admin only)
- `GET /api/messages/public/all` - Get public messages
- `DELETE /api/messages/:id` - Delete (admin only)

### Admin Routes

- `GET /api/admin/check` - Is user admin?
- `GET /api/admin/dashboard` - Dashboard data
- `GET /api/admin/users/all` - All users
- `GET /api/admin/lsts/all` - All LSTS
- `GET /api/admin/prayers/all` - All prayers
- `GET /api/admin/summit/all` - All summit

---

## 🧪 Testing the Backend

### 1. Create Account

```bash
curl -X POST http://localhost:8787/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "fullName": "Test User"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

You'll get a response like:

```json
{
  "message": "✅ Logged in successfully",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "fullName": "Test User"
  },
  "token": "eyJhbGc..."
}
```

### 3. Submit LSTS Registration

```bash
curl -X POST http://localhost:3002/api/lsts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "surname": "Smith",
    "otherNames": "John",
    "phoneNumber": "08012345678",
    "email": "test@example.com",
    "residentialAddress": "123 Main St",
    "gender": "Male"
  }'
```

---

## 🚀 Deployment

### Option 1: Render (Free Tier)

```bash
# 1. Push code to GitHub
# 2. Go to render.com
# 3. Create new Web Service
# 4. Connect GitHub repo
# 5. Set startup command: npm start
# 6. Add environment variables in dashboard
# 7. Deploy
```

### Option 2: Railway

```bash
# 1. Install Railway CLI: https://docs.railway.app/
# 2. railway login
# 3. railway init
# 4. railway up
# 5. Set environment variables via dashboard
```

### Option 3: Heroku (Paid)

```bash
heroku create divine-grace-branch
heroku config:set SUPABASE_URL=...
git push heroku main
```

---

## 🔍 Troubleshooting

### Issue: "Missing Supabase credentials"

**Fix**: Check `.env` file has `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

### Issue: "CORS error"

**Fix**: Add your frontend URL to `corsOptions` in `server.js`:

```javascript
origin: [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://yourdomain.com", // Add your domain
];
```

### Issue: "Cloudflare upload fails"

**Fix**: Verify R2 credentials:

```bash
# Test from terminal
curl -X PUT \
  -H "Authorization: Bearer {R2_TOKEN}" \
  https://{ACCOUNT_ID}.r2.cloudflarestorage.com/{BUCKET}/{KEY}
```

### Issue: "Unauthorized" on admin routes

**Fix**: Check `BRANCH_ADMIN_EMAILS` env var contains your email

---

## 📝 Frontend Integration

Update `Divine-Grace-Upgrade/scripts/` to call backend:

```javascript
// registerlogin.js
fetch("http://localhost:3002/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

// lsts.js
fetch("http://localhost:3002/api/lsts", {
  method: "POST",
  headers: authHeaders(),
  body: JSON.stringify(payload),
});
```

✅ Frontend scripts have been auto-updated to use `http://localhost:3002`

---

## 🔄 Data Isolation Strategy

| Data               | Storage                         | Isolation                    |
| ------------------ | ------------------------------- | ---------------------------- |
| User Accounts      | Supabase Auth                   | Shared (same project)        |
| User Profiles      | Supabase `users` table          | Shared (same table)          |
| LSTS Registrations | In-Memory (dev) / Cloudflare KV | Branch namespace             |
| Prayers            | In-Memory (dev) / Cloudflare KV | Branch namespace             |
| Summit Forms       | In-Memory (dev) / Cloudflare KV | Branch namespace             |
| Audio Files        | Cloudflare R2                   | `branch-dgu-upgrade/` prefix |
| Admin List         | Environment Variable            | Branch-specific emails       |

### Why This Design?

- **Shared Auth**: Reduces redundancy, single user database
- **Isolated Data**: No LSTS mix-up between parent and branch
- **Shared R2**: Cost-efficient, all files in one bucket
- **Prefix Isolation**: Easy to see which files belong to branch

---

## 🎓 Next Steps

1. **Install & Run**: `npm install && npm run dev`
2. **Test Locally**: Try the curl commands above
3. **Deploy**: Choose a hosting service from Deployment section
4. **Monitor**: Check logs regularly for errors
5. **Scale**: As user base grows, migrate from in-memory to Cloudflare KV

---

## 📞 Support

For issues or questions:

1. Check `.env` configuration first
2. Review logs in terminal
3. Verify Supabase & Cloudflare credentials
4. Check network tab in browser DevTools

**Happy coding! 🚀**
