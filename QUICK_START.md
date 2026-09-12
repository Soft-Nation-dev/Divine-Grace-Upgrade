# Divine Grace UNN (Branch) - Quick Start Guide

## ⚡ Setup in 3 Minutes

### 1. Install Backend

```bash
# Terminal 1 - Start backend
cd Divine-Grace-Upgrade/backend
npm install
cp .env.example .env

# Edit .env with your credentials
# Then start server:
npm run dev
```

You should see:

```
🙏 Divine Grace UNN (Branch) Backend
   Running on http://localhost:3002
```

### 2. Frontend Access

Open in browser:

```
http://localhost:3000  (or wherever you're serving frontend)
```

### 3. Test Login

1. Go to "Register/Login" page
2. Create account: `test@example.com` / `SecurePass123`
3. Should see dashboard after login

---

## 📋 What You Need

Before starting, gather these credentials:

### Supabase (use parent project)

- [ ] `SUPABASE_URL` (from Settings → API)
- [ ] `SUPABASE_ANON_KEY` (from Settings → API)
- [ ] `SUPABASE_SERVICE_KEY` (from Settings → API)

### Cloudflare R2

- [ ] `CLOUDFLARE_ACCOUNT_ID` (from R2 → API tokens)
- [ ] `CLOUDFLARE_R2_ACCESS_KEY` (from R2 → API tokens)
- [ ] `CLOUDFLARE_R2_SECRET_KEY` (from R2 → API tokens)
- [ ] `CLOUDFLARE_R2_BUCKET` (bucket name)
- [ ] `CLOUDFLARE_R2_PUBLIC_URL` (R2 public URL)

---

## 🔑 .env Template

Create `backend/.env`:

```env
# Supabase (SHARED with parent)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Cloudflare R2 (SHARED bucket, isolated files)
CLOUDFLARE_ACCOUNT_ID=xxxxx
CLOUDFLARE_R2_ACCESS_KEY=xxxxx
CLOUDFLARE_R2_SECRET_KEY=xxxxx
CLOUDFLARE_R2_BUCKET=divine-grace-storage
CLOUDFLARE_R2_PUBLIC_URL=https://divine-grace-storage.xxxx.r2.cloudflarestorage.com

# Branch Config
BRANCH_PREFIX=branch-dgu-upgrade
BRANCH_ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Server
PORT=3002
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## 🧪 Quick Tests

### Health Check

```bash
curl http://localhost:3002/health
```

### Create Account

```bash
curl -X POST http://localhost:3002/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "fullName": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

Response:

```json
{
  "message": "✅ Logged in successfully",
  "token": "eyJhbGc...",
  "user": {...}
}
```

---

## 📁 Key Files

| File                     | Purpose             |
| ------------------------ | ------------------- |
| `backend/server.js`      | Main Express.js app |
| `backend/routes/auth.js` | Login/signup        |
| `backend/routes/lsts.js` | LSTS registrations  |
| `backend/.env.example`   | Config template     |
| `BACKEND_SETUP.md`       | Detailed guide      |
| `README.md`              | Project overview    |

---

## ✅ Checklist

- [ ] Clone/download Divine-Grace-Upgrade folder
- [ ] Get Supabase credentials (from parent project)
- [ ] Get Cloudflare R2 credentials
- [ ] Run `npm install` in backend folder
- [ ] Create `.env` file with credentials
- [ ] Run `npm run dev`
- [ ] Test health endpoint
- [ ] Test login
- [ ] Deploy to production

---

## 🚀 Deploy to Production

### Render (Recommended)

1. Push to GitHub
2. Go to [render.com](https://render.com)
3. Create Web Service
4. Connect your repo
5. Set startup: `npm start`
6. Add env variables
7. Deploy

More details in [BACKEND_SETUP.md](BACKEND_SETUP.md)

---

## ⚠️ Common Issues

### Port 3002 already in use

```bash
# Kill the process
lsof -i :3002 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### "Cannot find module" error

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### CORS error

Add your frontend domain to `corsOptions` in `server.js`

### Authentication fails

Check `.env` has correct Supabase keys

---

## 📖 Full Documentation

See **[BACKEND_SETUP.md](BACKEND_SETUP.md)** for:

- Detailed setup instructions
- API endpoint reference
- Deployment options
- Troubleshooting guide
- Architecture overview

---

**That's it! You're ready to go. 🚀**
