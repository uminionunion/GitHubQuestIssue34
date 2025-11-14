# MainUhubFeatureV001 - Deployment & Database Configuration Guide

This guide provides comprehensive instructions for deploying the MainUhubFeatureV001 application with Docker, configuring databases (MySQL, SQLite, or Express), and ensuring all components work seamlessly together.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Docker Setup](#docker-setup)
3. [Database Configuration](#database-configuration)
4. [Code Namespace](#code-namespace)
5. [Quick Start](#quick-start)

---

## Project Overview

**MainUhubFeatureV001** is a full-stack web application with:
- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js 5 with Node.js, TypeScript
- **Database Options**: SQLite (default), MySQL, or Express + SQLite

All code is prefixed with `MainUhubFeatureV001` to prevent namespace collisions during merges.

---

## Docker Setup

### Step 1: Create Dockerfile

Create a `Dockerfile` in the project root:

```dockerfile
# Multi-stage build for optimal image size
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Expose port (default 4000 for production)
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIRECTORY=/app/data

CMD ["node", "dist/server/index.js"]
```

### Step 2: Create .dockerignore

Create a `.dockerignore` file to exclude unnecessary files:

```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
dist
coverage
.vscode
.idea
*.log
.DS_Store
data/database.sqlite
client/public/assets/*
!client/public/assets/.gitkeep
```

### Step 3: Create docker-compose.yml

Create a `docker-compose.yml` file for easy orchestration:

```yaml
version: '3.8'

services:
  # Main application (SQLite backend)
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mainuhubfeaturev001-app
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      PORT: 4000
      DATA_DIRECTORY: /app/data
      JWT_SECRET: ${JWT_SECRET:-change-this-secret-key}
    volumes:
      - app_data:/app/data
    restart: unless-stopped
    networks:
      - mainuhubfeaturev001-network

  # Optional: MySQL service (for MySQL configuration)
  mysql:
    image: mysql:8.0
    container_name: mainuhubfeaturev001-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-rootpassword}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-mainuhubdb}
      MYSQL_USER: ${MYSQL_USER:-uhubuser}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-uhubpassword}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./migrations:/docker-entrypoint-initdb.d
    restart: unless-stopped
    networks:
      - mainuhubfeaturev001-network
    profiles:
      - mysql  # Only run with --profile mysql

  # Optional: Redis for caching/sessions
  redis:
    image: redis:7-alpine
    container_name: mainuhubfeaturev001-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - mainuhubfeaturev001-network
    profiles:
      - redis  # Only run with --profile redis

volumes:
  app_data:
    driver: local
  mysql_data:
    driver: local
  redis_data:
    driver: local

networks:
  mainuhubfeaturev001-network:
    driver: bridge
```

### Step 4: Build and Run with Docker

#### SQLite Configuration (Default)

```bash
# Build the Docker image
docker build -t mainuhubfeaturev001:latest .

# Run with docker-compose (SQLite only)
docker-compose up -d app

# View logs
docker-compose logs -f app

# Stop the application
docker-compose down

# Clean up volumes
docker-compose down -v
```

#### MySQL Configuration

```bash
# Run with MySQL
docker-compose --profile mysql up -d

# Run migrations (create tables)
docker-compose exec mysql mysql -u uhubuser -puhubpassword mainuhubdb < migrations/init.sql

# Stop all services
docker-compose down
```

---

## Database Configuration

### Option 1: SQLite (Default) ✓ Recommended for Development

SQLite is the default database. No additional setup required.

**Files involved:**
- `/server/db.ts` - Kysely database connection
- `/data/database.sqlite` - SQLite database file (auto-created)

**Configuration:**

```typescript
// server/db.ts
import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');
const sqliteDb = new Database(dbPath);

export const db = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: ['query', 'error'],
});
```

**Advantages:**
- No external dependencies
- Works in Docker without additional services
- Perfect for development and small deployments
- Data persists in `/app/data/database.sqlite`

---

### Option 2: MySQL (For Production Scaling)

To use MySQL instead of SQLite:

#### Step 1: Install MySQL Driver

```bash
npm install mysql2
npm install -D @types/mysql2
```

#### Step 2: Update Database Connection

Replace `/server/db.ts`:

```typescript
import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2/promise';
import type { DB } from './db-types.js';

const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'uhubuser',
  password: process.env.DB_PASSWORD || 'uhubpassword',
  database: process.env.DB_NAME || 'mainuhubdb',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = new Kysely<DB>({
  dialect: new MysqlDialect({
    pool: pool,
  }),
  log: ['query', 'error'],
});
```

#### Step 3: Create MySQL Database

Run migrations:

```bash
# Using docker-compose
docker-compose --profile mysql up -d mysql

# Create database and tables
docker-compose exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD < migrations/mysql_init.sql
```

#### Step 4: Update Environment Variables

Create `.env` or update your docker-compose:

```env
NODE_ENV=production
PORT=4000

# MySQL Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=uhubuser
DB_PASSWORD=uhubpassword
DB_NAME=mainuhubdb

JWT_SECRET=your-secret-key-here
```

#### Step 5: Run with MySQL

```bash
docker-compose --profile mysql up -d
```

---

### Option 3: Express + SQLite (Custom Implementation)

If you prefer to manage the database layer directly in Express:

#### Step 1: Create Database Service

Create `/server/database-service.ts`:

```typescript
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) return db;

  const dataDir = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');
  
  db = await open({
    filename: path.join(dataDir, 'database.sqlite'),
    driver: sqlite3.Database,
  });

  await db.exec('PRAGMA foreign_keys = ON');
  return db;
}

export async function initializeDatabase() {
  const database = await getDatabase();
  
  // Create tables
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone_number TEXT,
      profile_image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id1 INTEGER NOT NULL,
      user_id2 INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id1) REFERENCES users(id),
      FOREIGN KEY (user_id2) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      room TEXT NOT NULL,
      content TEXT NOT NULL,
      is_anonymous BOOLEAN DEFAULT 0,
      anonymous_username TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  console.log('Database initialized');
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}
```

#### Step 2: Update Express Routes

Use the database service in your Express routes:

```typescript
import { getDatabase } from './database-service.js';

router.get('/api/users/:id', async (req, res) => {
  const db = await getDatabase();
  const user = await db.get('SELECT * FROM users WHERE id = ?', req.params.id);
  
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  
  res.json(user);
});
```

---

## Database Endpoints & API Integration

### Authentication Endpoints

All authentication endpoints are in `/server/auth.ts` and use the `db` instance:

```typescript
// Signup
POST /api/auth/signup
Body: { username, password, email, phoneNumber }

// Login
POST /api/auth/login
Body: { username, password }

// Logout
POST /api/auth/logout

// Get Current User
GET /api/auth/me
```

### Friends Endpoints

Friends are managed in `/server/friends.ts`:

```typescript
// Get friends list
GET /api/friends

// Get pending requests
GET /api/friends/requests/pending

// Send friend request
POST /api/friends/request
Body: { userId }

// Accept request
POST /api/friends/accept
Body: { requestId }

// Block user
POST /api/friends/block
Body: { userId }
```

### Chat Endpoints (WebSocket)

Chat uses Socket.io in `/server/chat.ts`:

```typescript
// Join room
socket.emit('joinRoom', 'SisterUnion001NewEngland');

// Send message
socket.emit('sendMessage', { 
  room: 'SisterUnion001NewEngland',
  content: 'Hello',
  isAnonymous: false 
});

// Listen for messages
socket.on('receiveMessage', (message) => console.log(message));
```

---

## Code Namespace (MainUhubFeatureV001)

All identifiers use the `MainUhubFeatureV001` prefix:

### TypeScript/JavaScript Files

```typescript
// App Component
function MainUhubFeatureV001App() { ... }
const MainUhubFeatureV001MainLayout = () => { ... }

// Database Instance
const db = new Kysely<DB>({ ... }); // Exported as mainUhubDb

// API Routers
const mainUhubAuthRouter = Router(); // /api/auth
const mainUhubFriendsRouter = Router(); // /api/friends

// Hooks
export const useMainUhubAuth = () => { ... }
```

### CSS Classes

```jsx
<div className="MainUhubFeatureV001-min-h-screen MainUhubFeatureV001-flex">
  {/* All Tailwind classes prefixed */}
</div>
```

### Environment Variables

```env
MAINUHUBFEATUREV001_PORT=4000
MAINUHUBFEATUREV001_DB_PATH=/app/data/database.sqlite
MAINUHUBFEATUREV001_JWT_SECRET=your-secret
```

---

## Quick Start

### 1. Local Development (SQLite)

```bash
# Install dependencies
npm install

# Start development server
npm run start

# App runs on http://localhost:3000 (frontend)
# API runs on http://localhost:3001 (backend)
```

### 2. Production with Docker (SQLite)

```bash
# Build and run
docker build -t mainuhubfeaturev001:latest .
docker run -p 4000:4000 -v app_data:/app/data mainuhubfeaturev001:latest

# Or with docker-compose
docker-compose up -d
```

### 3. Production with Docker (MySQL)

```bash
# Set environment variables
export MYSQL_ROOT_PASSWORD=secure_password
export MYSQL_PASSWORD=uhub_password
export JWT_SECRET=your_jwt_secret

# Run with MySQL
docker-compose --profile mysql up -d

# View logs
docker-compose logs -f app
```

### 4. Health Check

```bash
# Local
curl http://localhost:3001/api/auth/me

# Docker
curl http://localhost:4000/api/auth/me
```

---

## Troubleshooting

### SQLite Database Locked

```bash
# Check file permissions
ls -la data/database.sqlite

# Fix permissions
chmod 666 data/database.sqlite
```

### MySQL Connection Failed

```bash
# Check MySQL is running
docker-compose logs mysql

# Verify credentials
docker-compose exec mysql mysql -u uhubuser -puhubpassword mainuhubdb

# Create database manually
docker-compose exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD \
  -e "CREATE DATABASE mainuhubdb;"
```

### Port Already in Use

```bash
# Change Docker port mapping
docker-compose.yml:
  ports:
    - "4001:4000"  # Map to 4001 instead
```

---

## Environment Variables Reference

```env
# Application
NODE_ENV=production|development
PORT=4000
DATA_DIRECTORY=/app/data

# JWT
JWT_SECRET=your-secret-key-here

# SQLite (Default)
# No additional config needed

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=uhubuser
DB_PASSWORD=uhubpassword
DB_NAME=mainuhubdb

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Vite (Frontend)
VITE_PORT=3000
VITE_API_URL=http://localhost:3001
```

---

## File Structure After Setup

```
/home/app/
├── Dockerfile                    # Docker build config
├── .dockerignore                 # Docker exclude rules
├── docker-compose.yml            # Docker Compose orchestration
├── client/                       # React frontend
│   └── src/
│       └── App.tsx              # MainUhubFeatureV001App
├── server/                       # Express backend
│   ├── index.ts                 # Server entry point
│   ├── db.ts                    # Database connection
│   ├── auth.ts                  # Authentication routes
│   ├── friends.ts               # Friends management
│   └── chat.ts                  # WebSocket chat
├── data/
│   └── database.sqlite          # SQLite database (auto-created)
├── migrations/
│   ├── mysql_init.sql           # MySQL schema
│   └── sqlite_init.sql          # SQLite schema
└── package.json                 # Dependencies
```

---

## Next Steps

1. **Deploy to Production**: Use Kubernetes, AWS ECS, or Heroku
2. **Add SSL/TLS**: Use Let's Encrypt with Nginx reverse proxy
3. **Set Up Monitoring**: Add Prometheus, Grafana, or DataDog
4. **Implement CI/CD**: GitHub Actions, GitLab CI, or Jenkins
5. **Database Backups**: Automate SQLite/MySQL backups

---

**Version**: MainUhubFeatureV001  
**Last Updated**: 2025  
**License**: Proprietary
