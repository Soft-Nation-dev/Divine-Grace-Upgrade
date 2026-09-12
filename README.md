# Divine Grace UNN - Upgrade Branch 🙏

A standalone branch of the Divine Grace UNN platform with its own backend infrastructure but shared authentication.

## 📦 What's Inside

- **Frontend**: Static HTML/JavaScript pages (Divine-Grace-Upgrade/)
- **Backend**: Express.js server with isolated data storage (backend/)
- **Auth**: Shared Supabase JWT (same as parent project)
- **Storage**: Branch-isolated Cloudflare KV + R2 storage

---

## 🚀 Getting Started

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your Supabase and Cloudflare credentials
# (See BACKEND_SETUP.md for detailed instructions)

# Start development server
npm run dev

# Server runs on http://localhost:3002
```

### Frontend Access

Once backend is running, open:

- **Index Page**: `Divine-Grace-Upgrade/index.html`
- **Register/Login**: `Divine-Grace-Upgrade/registerlogin/index.html`
- **LSTS Registration**: `Divine-Grace-Upgrade/lstsregistrationpage/index.html`

---

## 🔐 Key Differences from Parent Project

| Feature            | Parent            | Branch                      |
| ------------------ | ----------------- | --------------------------- |
| **Backend**        | Express.js        | Express.js ✓                |
| **Auth**           | Supabase (shared) | Supabase (shared) ✓         |
| **LSTS Storage**   | Supabase DB       | Isolated KV ✓               |
| **Prayer Storage** | Supabase DB       | Isolated KV ✓               |
| **Summit Storage** | Supabase DB       | Isolated KV ✓               |
| **File Storage**   | R2 `/uploads/`    | R2 `/branch-dgu-upgrade/` ✓ |
| **Admin Access**   | Admin table       | Env variable ✓              |

---

## 📋 Backend Endpoints

All endpoints require `Authorization: Bearer {token}` header (after login).

### Authentication

- `POST /api/auth/signup` - Register new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Send a password recovery link
- `POST /api/auth/reset-password` - Set a new password using a recovery session
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### LSTS (Leadership Training & Service)

- `POST /api/lsts` - Submit LSTS form
- `GET /api/lsts/user/week` - Get this week's registration
- `GET /api/lsts/user/all` - Get all registrations
- `GET /api/lsts` - Get all submissions (admin only)

### Prayers

- `POST /api/prayers` - Submit prayer request
- `GET /api/prayers/:id` - Get specific prayer

### Summit

- `POST /api/summit` - Summit registration
- `GET /api/summit/user/all` - Get user's registrations

### Messages (Audio)

- `POST /api/messages/upload` - Upload audio (admin only)
- `GET /api/messages/public/all` - Get public messages

### Admin

- `GET /api/admin/check` - Check if user is admin
- `GET /api/admin/dashboard` - Dashboard statistics

---

## 🗂️ Project Structure

```
Divine-Grace-Upgrade/
├── backend/                    # Express.js server
│   ├── server.js              # Main app
│   ├── config/                # Configs (Supabase, Cloudflare)
│   ├── middleware/            # Auth middleware
│   ├── routes/                # API endpoints
│   ├── utils/                 # Storage helpers
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── scripts/                   # Frontend JavaScript
│   ├── registerlogin.js       # Auth pages
│   ├── lsts.js                # LSTS registration
│   ├── utils.js               # Shared utilities
│   ├── prayerrequest.js
│   ├── messages.js
│   └── ...
│
├── css folder/                # Stylesheets
├── images/                    # Images and media
│
├── registerlogin/             # Auth pages (HTML)
├── lstsregistrationpage/      # LSTS form (HTML)
├── prayerequest/              # Prayer form (HTML)
├── Messages/                  # Messages page (HTML)
├── home/                      # Home page (HTML)
├── Administrator/             # Admin dashboard (HTML)
│
├── BACKEND_SETUP.md          # Backend setup guide
└── index.html                # Landing page
```

---

## 🔧 Environment Variables

Create `backend/.env`:

```env
# Supabase (SHARED)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=xxxxx
CLOUDFLARE_R2_ACCESS_KEY=xxxxx
CLOUDFLARE_R2_SECRET_KEY=xxxxx
CLOUDFLARE_R2_BUCKET=divine-grace-storage
CLOUDFLARE_R2_PUBLIC_URL=https://divine-grace-storage.xxxx.r2.cloudflarestorage.com

# Branch Config
BRANCH_PREFIX=branch-dgu-upgrade
BRANCH_ADMIN_EMAILS=admin@example.com

# Server
PORT=3002
NODE_ENV=development
```

---

## 🧪 Testing the Backend

Without authentication:

```bash
curl http://localhost:8787/health
```

With authentication:

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}' | jq -r '.token')

# 2. Use token for authenticated request
curl -X GET http://localhost:8787/api/lsts/user/all \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚀 Deployment

See [BACKEND_SETUP.md](BACKEND_SETUP.md) for detailed deployment options:

- **Render** (recommended for free tier)
- **Railway**
- **Heroku** (paid)
- **Netlify/Vercel** (frontend only)

---

## 🔄 Data Isolation

This branch stores its data separately from the parent project:

### What's SHARED:

- User authentication
- User profile information

### What's ISOLATED:

- ✅ LSTS registrations (separate KV namespace or memory store)
- ✅ Prayer requests (separate storage)
- ✅ Summit registrations (separate storage)
- ✅ Audio files (R2 with `/branch-dgu-upgrade/` prefix)

This prevents data contamination between projects while keeping authentication centralized.

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check Node.js version
node --version  # Should be 16+

# Check port is not in use
netstat -tlnp | grep 3002

# Or kill the process
lsof -i :3002 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### CORS errors

Add your frontend domain to `corsOptions` in `server.js`

### Supabase authentication fails

Verify `.env` has correct `SUPABASE_SERVICE_KEY`

### Cloudflare R2 upload fails

Check R2 credentials and bucket name

---

## 📖 Documentation

- **[Backend Setup Guide](BACKEND_SETUP.md)** - Detailed setup, testing, deployment
- **[API Reference](backend/)** - Endpoint documentation in route files
- **Architecture** - See BACKEND_SETUP.md "Architecture Overview" section

---

## 🎯 Next Steps

1. ✅ **Install Dependencies**: `cd backend && npm install`
2. ✅ **Configure Credentials**: Copy `.env.example` to `.env` and fill in
3. ✅ **Start Server**: `npm run dev`
4. ✅ **Test Endpoints**: Use curl commands in BACKEND_SETUP.md
5. ✅ **Deploy**: Follow deployment guide

---

## 📞 Support

For issues:

1. Check BACKEND_SETUP.md Troubleshooting section
2. Review console logs for error messages
3. Verify all environment variables are set
4. Check Supabase & Cloudflare credentials

---

**Made with ❤️ for Divine Grace UNN**
