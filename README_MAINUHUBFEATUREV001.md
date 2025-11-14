# MainUhubFeatureV001

**Production-ready deployment guide for the MainUhubFeatureV001 feature module.**

This module contains a complete React + Express application with integrated authentication, friend management, and real-time chat capabilities.

---

## Quick Links

- **Full Setup Guide**: See `MAINUHUBFEATUREV001_DEPLOYMENT_GUIDE.md`
- **Docker Setup**: Dockerfile, .dockerignore, docker-compose.yml included
- **Database Options**: SQLite (default), MySQL, or custom Express + SQLite

---

## 5-Minute Startup

### Development (SQLite)

```bash
npm install
npm run start
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Production (Docker + SQLite)

```bash
docker-compose up -d app
```

Access at http://localhost:4000

### Production (Docker + MySQL)

```bash
docker-compose --profile mysql up -d
```

---

## Namespace Isolation

All code uses the `MainUhubFeatureV001` prefix to prevent conflicts during merges:

- Components: `MainUhubFeatureV001App`, `MainUhubFeatureV001MainLayout`
- Classes: `MainUhubFeatureV001-{tailwindClass}`
- Routers: `/api/auth`, `/api/friends` (unchanged for API compatibility)
- Database: Standard Kysely instance (compatible with all databases)

---

## Database Options

| Option | Use Case | Setup Time | Complexity |
|--------|----------|-----------|-----------|
| **SQLite** | Development, Small deployments | 0 min | 🟢 Simple |
| **MySQL** | Production, Scaling | 5 min | 🟡 Medium |
| **Express + SQLite** | Custom control | 10 min | 🔴 Advanced |

All are production-ready and fully documented in the main guide.

---

## File Structure

```
/home/app/
├── Dockerfile                             # Production image
├── .dockerignore                          # Docker exclude rules
├── docker-compose.yml                     # Orchestration
├── MAINUHUBFEATUREV001_DEPLOYMENT_GUIDE.md # Complete guide (READ THIS!)
├── README_MAINUHUBFEATUREV001.md          # This file
├── package.json
├── client/
│   └── src/
│       ├── App.tsx                       # MainUhubFeatureV001App component
│       └── features/
│           ├── auth/                     # Authentication
│           ├── profile/                  # User profiles
│           └── uminion/                  # Chat & routing
├── server/
│   ├── index.ts                          # Express server
│   ├── db.ts                             # Database (Kysely)
│   ├── auth.ts                           # Auth routes
│   ├── friends.ts                        # Friends API
│   └── chat.ts                           # WebSocket chat
└── data/
    └── database.sqlite                   # SQLite (auto-created)
```

---

## Key Features

✅ **Authentication**: JWT-based login/signup  
✅ **Friend Management**: Send/accept/block user requests  
✅ **Real-time Chat**: WebSocket-powered messaging  
✅ **Database Flexibility**: SQLite, MySQL, or custom  
✅ **Type-Safe**: Full TypeScript support  
✅ **Production Ready**: Docker, health checks, error handling  

---

## API Endpoints

```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/friends
GET    /api/friends/requests/pending
POST   /api/friends/request
POST   /api/friends/accept
POST   /api/friends/reject
POST   /api/friends/block
POST   /api/friends/report

WS     /socket.io              (Chat via Socket.io)
```

---

## Environment Variables

```env
# Server
NODE_ENV=production
PORT=4000
JWT_SECRET=your-secret-key

# Database (SQLite default)
DATA_DIRECTORY=/app/data

# Or MySQL
DB_HOST=localhost
DB_USER=uhubuser
DB_PASSWORD=password
DB_NAME=mainuhubdb
```

---

## Troubleshooting

**Port already in use?**
```bash
docker-compose.yml → change ports: ["4001:4000"]
```

**Database locked (SQLite)?**
```bash
chmod 666 data/database.sqlite
```

**MySQL connection failed?**
```bash
docker-compose logs mysql
docker-compose exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD mainuhubdb
```

---

## Support & Documentation

For detailed setup instructions, database configuration, and troubleshooting:

👉 **Read: `MAINUHUBFEATUREV001_DEPLOYMENT_GUIDE.md`**

This file contains:
- Complete Docker setup
- SQLite, MySQL, and Express + SQLite configurations
- Database migration scripts
- Environment variable reference
- Production deployment guide
- Troubleshooting tips

---

## Ready to Deploy?

1. ✅ Read the deployment guide
2. ✅ Choose your database (SQLite recommended for start)
3. ✅ Set environment variables
4. ✅ Run `docker-compose up -d`
5. ✅ Access at http://localhost:4000

**Questions?** Check the deployment guide first - it covers 99% of issues.

---

**Version**: MainUhubFeatureV001  
**Status**: Production Ready ✅
