# MainUhubFeatureV001 - Complete Documentation Guide

Welcome! This is the comprehensive documentation for the MainUhubFeatureV001 application. All code names and features are prefixed with "MainUhubFeatureV001" to prevent conflicts when merging with other codebases.

---

## 📚 Documentation Structure

This project includes four comprehensive README files:

### 1. **Environment Setup & Configuration**
📄 `README_MAINUHUBFEATUREV001_ENVIRONMENT_SETUP.md`

**What to read first** - Start here to understand:
- How to set up environment variables (.env files)
- Development vs Production configuration
- Database configuration options (SQLite, MySQL, PostgreSQL)
- Port configuration and API setup
- Verification checklist

**For beginners:** This guide explains what each environment variable does and why it matters.

---

### 2. **Docker Volumes & Container Networking**
📄 `README_MAINUHUBFEATUREV001_DOCKER_VOLUMES_NETWORKING.md`

**Read this for Docker** - Learn about:
- What Docker volumes are and why they matter
- How to persist data with SQLite and MySQL
- Container networking and service discovery
- How containers communicate with each other
- Real-world Docker Compose examples
- Volume backup and restore procedures
- Troubleshooting Docker issues

**For Docker users:** Complete guide to managing data in containers and connecting multiple services.

---

### 3. **Code Comments & Architecture**
📄 `README_MAINUHUBFEATUREV001_CODE_COMMENTS.md`

**Read this to understand code** - Includes:
- Line-by-line comments on all major files
- Detailed explanations of authentication flow
- Database schema and types
- API routes documentation
- Real-time chat system (Socket.io)
- Custom React hooks
- Debugging tips and techniques

**For developers:** Deep dive into how the code works with extensive comments.

---

### 4. **Deployment Guide** (Original)
📄 `MAINUHUBFEATUREV001_DEPLOYMENT_GUIDE.md`

**Read this for deployment** - Covers:
- Step-by-step Docker setup
- Dockerfile creation
- Docker Compose configurations (SQLite, MySQL, PostgreSQL)
- Nginx configuration
- SSL certificate setup
- Production deployment instructions

**For DevOps:** Complete deployment instructions for production environments.

---

## 🚀 Quick Start Guide

### Option 1: Local Development (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start

# 3. Open browser
# Frontend: http://localhost:3000
# API: http://localhost:3001
```

### Option 2: Docker Development (3 minutes)

```bash
# 1. Build and start containers
docker-compose up --build

# 2. Open browser
# http://localhost:80
```

### Option 3: Production (Read deployment guide first)

```bash
# 1. Build application
npm run build

# 2. Start production server
NODE_ENV=production npm run start:prod

# 3. Access at
# http://localhost:4000
```

---

## 📖 Which Document Should I Read?

### "I want to..."

#### ...set up the application locally
→ Read `README_MAINUHUBFEATUREV001_ENVIRONMENT_SETUP.md` (Development Setup section)

#### ...understand what environment variables do
→ Read `README_MAINUHUBFEATUREV001_ENVIRONMENT_SETUP.md` (Environment Variables section)

#### ...use Docker to run the application
→ Read `MAINUHUBFEATUREV001_DEPLOYMENT_GUIDE.md` (Docker Setup section)

#### ...persist data with MySQL
→ Read `README_MAINUHUBFEATUREV001_ENVIRONMENT_SETUP.md` (Database Configuration section)

#### ...manage Docker volumes and containers
→ Read `README_MAINUHUBFEATUREV001_DOCKER_VOLUMES_NETWORKING.md`

#### ...understand how the code works
→ Read `README_MAINUHUBFEATUREV001_CODE_COMMENTS.md`

#### ...understand authentication flow
→ Read `README_MAINUHUBFEATUREV001_CODE_COMMENTS.md` (Authentication System section)

#### ...see API documentation
→ Read `README_MAINUHUBFEATUREV001_CODE_COMMENTS.md` (API Routes section)

#### ...deploy to production
→ Read `MAINUHUBFEATUREV001_DEPLOYMENT_GUIDE.md` (Deployment Instructions section)

#### ...set up SSL/HTTPS
→ Read `MAINUHUBFEATUREV001_DEPLOYMENT_GUIDE.md` (Nginx SSL Setup section)

#### ...troubleshoot issues
→ Each guide has a troubleshooting section

---

## 🗂️ Project Structure

```
/home/app/
├── README_MAINUHUBFEATUREV001_COMPLETE_GUIDE.md       ← You are here
├── README_MAINUHUBFEATUREV001_ENVIRONMENT_SETUP.md     ← Environment & config
├── README_MAINUHUBFEATUREV001_DOCKER_VOLUMES_NETWORKING.md ← Docker guide
├── README_MAINUHUBFEATUREV001_CODE_COMMENTS.md         ← Code documentation
├── MAINUHUBFEATUREV001_DEPLOYMENT_GUIDE.md             ← Deployment guide
│
├── client/                                  # React Frontend (Vite)
│   ├── src/
│   │   ├── App.tsx                          # Main app component
│   │   ├── main.tsx                         # Entry point
│   │   ├── index.css                        # Global styles
│   │   ├── components/ui/                   # shadcn/ui components (15 UI components)
│   │   ├── features/
│   │   │   ├── auth/                        # Authentication modal
│   │   │   ├── profile/                     # User profile features
│   │   │   │   ├── MainUhubFeatureV001ForMyProfileModal.tsx
│   │   │   │   ├── MainUhubFeatureV001ForUserProfileModal.tsx
│   │   │   │   ├── MainUhubFeatureV001ForFriendsView.tsx
│   │   │   │   ├── MainUhubFeatureV001ForSettingsView.tsx
│   │   │   │   ├── MainUhubFeatureV001ForProductDetailModal.tsx
│   │   │   │   └── MainUhubFeatureV001ForAddProductModal.tsx
│   │   │   └── uminion/                     # Chat/messaging features
│   │   │       ├── MainUhubFeatureV001ForChatModal.tsx
│   │   │       └── MainUhubFeatureV001ForSisterUnionRoutes.tsx
│   │   └── hooks/
│   │       └── useAuth.tsx                  # Auth custom hook
│   ├── index.html
│   └── package.json (shared with server)
│
├── server/                                  # Express Backend
│   ├── index.ts                             # Main server entry
│   ├── db.ts                                # SQLite database setup
│   ├── db-types.ts                          # Database schema types
│   ├── auth.ts                              # Authentication routes
│   ├── auth-middleware.ts                   # JWT verification
│   ├── friends.ts                           # Friends routes
│   ├── chat.ts                              # Socket.io chat setup
│   └── static-serve.ts                      # Production static serving
│
├── data/                                    # Persistent Data (created at runtime)
│   └── database.sqlite                      # SQLite database file
│
├── scripts/
│   └── dev.ts                               # Development script
│
├── nginx.conf                               # Nginx reverse proxy config
├── docker-compose.yml                       # Docker Compose configuration
├── Dockerfile                               # Docker image definition
├── .dockerignore                            # Docker build exclusions
├── package.json                             # Root dependencies
├── tsconfig.json                            # TypeScript config
├── tsconfig.server.json                     # TypeScript server config
├── vite.config.js                           # Vite bundler config
├── tailwind.config.js                       # Tailwind CSS config
├── postcss.config.js                        # PostCSS config
├── components.json                          # shadcn/ui config
└── .env                                     # Environment variables (local)
```

---

## 🔧 Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast bundler
- **Tailwind CSS** - Styling
- **shadcn/ui** - 15 pre-built UI components
- **React Router** - Navigation
- **Socket.io Client** - Real-time messaging

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Web server framework
- **TypeScript** - Type safety
- **Kysely** - SQL query builder
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Socket.io** - Real-time communication
- **better-sqlite3** - SQLite driver (default)
- **mysql2** - MySQL driver (optional)

### Database
- **SQLite** - Development (default)
- **MySQL 8** - Production (optional)
- **PostgreSQL 15** - Alternative (optional)

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy & static serving

---

## 🎯 Key Features Explained

### 1. Authentication (MainUhubFeatureV001)
- User registration and login
- JWT token-based sessions
- HTTP-only secure cookies
- Protected API routes

**Files:** `server/auth.ts`, `server/auth-middleware.ts`, `hooks/useAuth.tsx`

### 2. User Profiles (MainUhubFeatureV001)
- View own profile
- Edit profile information
- Upload profile pictures
- User bio and settings

**Files:** `features/profile/MainUhubFeatureV001ForMyProfileModal.tsx`

### 3. Friends System (MainUhubFeatureV001)
- Add/remove friends
- Friend requests
- Friends list

**Files:** `server/friends.ts`, `features/profile/MainUhubFeatureV001ForFriendsView.tsx`

### 4. Real-Time Chat (MainUhubFeatureV001)
- Direct messaging
- Typing indicators
- Online status

**Files:** `server/chat.ts`, `features/uminion/MainUhubFeatureV001ForChatModal.tsx`

### 5. Products (MainUhubFeatureV001)
- List products
- Create product listings
- View product details

**Files:** `features/profile/MainUhubFeatureV001ForAddProductModal.tsx`

---

## 📋 Environment Variables Checklist

### Development
```env
NODE_ENV=development
PORT=3001
VITE_PORT=3000
DATABASE_TYPE=sqlite
DATA_DIRECTORY=./data
JWT_SECRET=dev-secret-key
```

### Production
```env
NODE_ENV=production
PORT=4000
DATABASE_TYPE=mysql
DB_HOST=mysql
DB_USER=uhubuser
DB_PASSWORD=<secure-password>
DB_NAME=mainuhubfeaturev001
JWT_SECRET=<secure-key>
```

See `README_MAINUHUBFEATUREV001_ENVIRONMENT_SETUP.md` for complete details.

---

## 🐳 Docker Quick Reference

### Common Commands

```bash
# Build and start containers
docker-compose up --build

# Start containers (without rebuilding)
docker-compose up -d

# Stop containers
docker-compose stop

# Stop and remove containers
docker-compose down

# View logs
docker-compose logs -f app

# Connect to container shell
docker-compose exec app sh

# List containers
docker-compose ps

# List volumes
docker volume ls

# Backup MySQL data
docker-compose exec -T mysql mysqldump -u uhubuser -p mainuhubfeaturev001 > backup.sql

# Restore MySQL data
docker-compose exec -T mysql mysql -u uhubuser -p mainuhubfeaturev001 < backup.sql
```

See `README_MAINUHUBFEATUREV001_DOCKER_VOLUMES_NETWORKING.md` for detailed Docker guide.

---

## 🔍 Troubleshooting Guide

### "Port 3001 is already in use"
Change PORT in .env or kill the process:
```bash
lsof -ti:3001 | xargs kill -9
```

### "Cannot connect to database"
Check if data directory exists:
```bash
mkdir -p data
```

### "Frontend shows blank page"
1. Check browser console (F12) for errors
2. Verify API is running: `curl http://localhost:3001`
3. Check VITE_PORT matches in .env

### "Docker container fails to start"
Check logs:
```bash
docker-compose logs app
```

### "MySQL container won't connect"
Verify MySQL is healthy:
```bash
docker-compose logs mysql
docker-compose ps
```

See detailed troubleshooting sections in each README.

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Change DB_PASSWORD to strong value
- [ ] Enable SSL/TLS certificates
- [ ] Set NODE_ENV=production
- [ ] Disable DATABASE_LOGGING in production
- [ ] Use environment variables for secrets
- [ ] Regular database backups
- [ ] Monitor application logs
- [ ] Keep dependencies updated
- [ ] Review CORS settings

---

## 📚 Additional Resources

### Official Documentation
- Express: https://expressjs.com
- Kysely: https://kysely.dev
- Socket.io: https://socket.io
- React: https://react.dev
- Vite: https://vitejs.dev
- Docker: https://docs.docker.com
- Nginx: https://nginx.org/en/docs/

### Learning Resources
- TypeScript: https://typescriptlang.org/docs
- JWT: https://jwt.io
- REST API Best Practices: https://restfulapi.net
- Docker Best Practices: https://docs.docker.com/develop/dev-best-practices

---

## 🚀 Next Steps

### For Development
1. Read `README_MAINUHUBFEATUREV001_ENVIRONMENT_SETUP.md`
2. Run `npm install`
3. Create `.env` file
4. Run `npm start`
5. Open http://localhost:3000

### For Docker
1. Read `MAINUHUBFEATUREV001_DEPLOYMENT_GUIDE.md`
2. Create `docker-compose.yml` (or use existing)
3. Run `docker-compose up --build`
4. Open http://localhost

### For Understanding Code
1. Read `README_MAINUHUBFEATUREV001_CODE_COMMENTS.md`
2. Review `server/index.ts` for server setup
3. Review `client/src/App.tsx` for frontend setup
4. Review `server/auth.ts` for authentication logic
5. Review `server/chat.ts` for real-time chat

### For Production Deployment
1. Read `MAINUHUBFEATUREV001_DEPLOYMENT_GUIDE.md`
2. Generate strong JWT_SECRET: `openssl rand -hex 32`
3. Set up MySQL database
4. Configure Nginx with SSL
5. Set environment variables
6. Run `npm run build`
7. Deploy to server

---

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section** in the relevant README
2. **Check browser console** (F12) for frontend errors
3. **Check server logs** (see `npm start` output)
4. **Check Docker logs** (`docker-compose logs`)
5. **Check environment variables** (compare with examples)

---

## 📝 Important Notes

### Naming Convention
All code in this project uses the prefix **"MainUhubFeatureV001"** to prevent conflicts when merging with other codebases. Examples:
- Component: `MainUhubFeatureV001ForChatModal.tsx`
- File: `MainUhubFeatureV001ForFriendsView.tsx`
- Function: `setupMainUhubFeatureV001Chat()`

This naming ensures the code can be safely merged without variable/function name collisions.

### Database Persistence
- **Development:** Uses SQLite at `./data/database.sqlite`
- **Production:** Use MySQL via Docker or external service
- **Backup:** Always backup database before deploying

### Security
- Never commit `.env` or `.env.production` to version control
- Change `JWT_SECRET` in production
- Change `DB_PASSWORD` to strong value
- Enable SSL/TLS for HTTPS

---

## 📄 Document Version

These guides were created for **MainUhubFeatureV001 v0.1.0**

Last updated: 2024

For the latest information, check the relevant README files.

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] All dependencies installed (`npm install`)
- [ ] Environment variables set (`.env` file)
- [ ] Server starts without errors (`npm start`)
- [ ] Frontend loads (`http://localhost:3000`)
- [ ] API responds (`http://localhost:3001/api/*`)
- [ ] Database connection works
- [ ] Authentication works (login/register)
- [ ] Friends feature works
- [ ] Chat feature works
- [ ] No TypeScript errors (`npm run type-check`)

---

**Ready to get started? Pick a guide from the list above and dive in!**
