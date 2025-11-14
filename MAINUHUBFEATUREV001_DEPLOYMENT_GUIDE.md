# MainUhubFeatureV001 - Complete Deployment Guide

This guide covers Docker setup, database configuration (MySQL/SQLite), Express server setup, and Nginx configuration for the MainUhubFeatureV001 application.

---

## Table of Contents
1. [Project Structure](#project-structure)
2. [Docker Setup](#docker-setup)
3. [Database Configuration](#database-configuration)
4. [Package.json Dependencies](#packagejson-dependencies)
5. [Express Server Configuration](#express-server-configuration)
6. [Nginx Configuration](#nginx-configuration)
7. [Deployment Instructions](#deployment-instructions)

---

## Project Structure

```
/home/app/
├── client/                    # React frontend (Vite)
│   ├── src/
│   │   ├── components/ui/    # shadcn/ui components
│   │   ├── features/         # Feature modules (auth, profile, uminion)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── index.html
│   └── package.json (shared)
│
├── server/                    # Express backend
│   ├── index.ts              # Main server file
│   ├── db.ts                 # Database initialization
│   ├── db-types.ts           # Database types
│   ├── auth.ts               # Authentication routes
│   ├── friends.ts            # Friends routes
│   ├── chat.ts               # Chat routes
│   └── auth-middleware.ts    # JWT middleware
│
├── data/                      # Persistent data (created at runtime)
│   └── database.sqlite        # SQLite database
│
├── Dockerfile                 # Docker image configuration
├── .dockerignore              # Docker build ignore file
├── docker-compose.yml         # Docker Compose configuration
└── package.json               # Root dependencies
```

---

## Docker Setup

### Step 1: Create .dockerignore File

Create a file named `.dockerignore` in the root directory (`/home/app/.dockerignore`):

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env.local
.vscode
dist
build
.DS_Store
*.log
coverage
.next
out
```

### Step 2: Create Dockerfile

Create a file named `Dockerfile` in the root directory (`/home/app/Dockerfile`):

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIRECTORY=/app/data

# Create data directory for SQLite
RUN mkdir -p /app/data

# Copy package files from builder
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Expose the port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the server
CMD ["node", "--loader", "tsx", "server/index.ts"]
```

### Step 3: Create docker-compose.yml

Create a file named `docker-compose.yml` in the root directory (`/home/app/docker-compose.yml`):

#### Option A: SQLite Configuration (Recommended for Development)

```yaml
version: '3.8'

services:
  # Express API + React Frontend
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      PORT: 4000
      DATA_DIRECTORY: /app/data
      VITE_PORT: 3000
      JWT_SECRET: ${JWT_SECRET:-your-secret-key-change-in-production}
    volumes:
      - app_data:/app/data
    networks:
      - mainuhubfeaturev001-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - mainuhubfeaturev001-network

volumes:
  app_data:

networks:
  mainuhubfeaturev001-network:
    driver: bridge
```

#### Option B: MySQL Configuration (Production)

```yaml
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-rootpassword}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-mainuhubfeaturev001}
      MYSQL_USER: ${MYSQL_USER:-uhubuser}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-uhubpassword}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql-init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - mainuhubfeaturev001-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Express API + React Frontend
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      PORT: 4000
      DATABASE_URL: mysql://uhubuser:uhubpassword@mysql:3306/mainuhubfeaturev001
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: ${MYSQL_USER:-uhubuser}
      DB_PASSWORD: ${MYSQL_PASSWORD:-uhubpassword}
      DB_NAME: ${MYSQL_DATABASE:-mainuhubfeaturev001}
      VITE_PORT: 3000
      JWT_SECRET: ${JWT_SECRET:-your-secret-key-change-in-production}
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - mainuhubfeaturev001-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - mainuhubfeaturev001-network

volumes:
  mysql_data:

networks:
  mainuhubfeaturev001-network:
    driver: bridge
```

#### Option C: PostgreSQL Configuration (Alternative)

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-mainuhubfeaturev001}
      POSTGRES_USER: ${POSTGRES_USER:-uhubuser}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-uhubpassword}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres-init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - mainuhubfeaturev001-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U uhubuser"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Express API + React Frontend
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      PORT: 4000
      DATABASE_URL: postgresql://uhubuser:uhubpassword@postgres:5432/mainuhubfeaturev001
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${POSTGRES_USER:-uhubuser}
      DB_PASSWORD: ${POSTGRES_PASSWORD:-uhubpassword}
      DB_NAME: ${POSTGRES_DB:-mainuhubfeaturev001}
      VITE_PORT: 3000
      JWT_SECRET: ${JWT_SECRET:-your-secret-key-change-in-production}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - mainuhubfeaturev001-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - mainuhubfeaturev001-network

volumes:
  postgres_data:

networks:
  mainuhubfeaturev001-network:
    driver: bridge
```

---

## User Authentication & Database Integration

### Connecting Signed-Up and Logged-In Users to Avatar and Timeline Features

#### Step 1: Update User Table Schema

Ensure your users table includes avatar and timeline columns:

```sql
-- SQLite Version (server/db.ts schema)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,  -- Avatar profile picture URL
  bio TEXT,         -- User bio
  timeline TEXT,    -- User timeline/status
  is_online BOOLEAN DEFAULT 0,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Step 2: Update Authentication Flow

In `server/auth.ts`, when user logs in, attach user data with avatar and timeline:

```typescript
// After successful login
const user = await db
  .selectFrom('users')
  .selectAll()
  .where('email', '=', email)
  .executeTakeFirst();

// Return user data including avatar and timeline
if (user) {
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      username: user.username,
      avatar_url: user.avatar_url,  // Include avatar
      bio: user.bio                   // Include bio
    },
    process.env.JWT_SECRET || 'dev-secret'
  );
  
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      bio: user.bio,
      timeline: user.timeline,
      is_online: user.is_online
    }
  });
  return;
}
```

#### Step 3: Show Logged-In Status in Chat

In `client/src/features/uminion/MainUhubFeatureV001ForChatModal.tsx`, display user's logged-in status:

```typescript
// Use useAuth hook to get current user
const { user } = useAuth();

// In the chat header, show current user's avatar and status
{user && (
  <div className="flex items-center gap-2">
    <img 
      src={user.avatar_url || '/default-avatar.png'} 
      alt={user.username}
      className="w-8 h-8 rounded-full"
    />
    <span className="text-sm font-medium">{user.username}</span>
    <span className="text-xs text-green-500">● Online</span>
  </div>
)}
```

#### Step 4: Update User Profile on Login

In `client/src/hooks/useAuth.tsx`, store complete user data:

```typescript
export function useAuth() {
  const [user, setUser] = useState<{
    id: number;
    username: string;
    email: string;
    avatar_url?: string;
    bio?: string;
    timeline?: string;
    is_online?: boolean;
  } | null>(null);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    // Store complete user data
    setUser({
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      avatar_url: data.user.avatar_url,
      bio: data.user.bio,
      timeline: data.user.timeline,
      is_online: true
    });
    
    localStorage.setItem('token', data.token);
  };

  return { user, login };
}
```

#### Step 5: Sync Avatar and Timeline to Chat

When user opens a chatroom, their avatar appears in the "users online" section:

```typescript
// In MainUhubFeatureV001ForChatModal.tsx
const [usersOnline, setUsersOnline] = useState<Array<{
  id: number;
  username: string;
  avatar_url?: string;
}>>([]);

// Listen for online users via Socket.io
useEffect(() => {
  socket.on('users:online', (users) => {
    setUsersOnline(users.map(u => ({
      id: u.id,
      username: u.username,
      avatar_url: u.avatar_url
    })));
  });
}, []);

// Render avatars in users online section
<div className="flex flex-col gap-2">
  {usersOnline.map((u) => (
    <div key={u.id} className="flex items-center gap-2">
      <img 
        src={u.avatar_url || '/default-avatar.png'}
        alt={u.username}
        className="w-6 h-6 rounded-full"
      />
      <span className="text-sm">{u.username}</span>
    </div>
  ))}
</div>
```

#### Step 6: Broadcast User Online Status

In `server/chat.ts`, emit user avatar and online status:

```typescript
io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  
  // Get user with avatar
  const user = await db
    .selectFrom('users')
    .select(['id', 'username', 'avatar_url', 'bio'])
    .where('id', '=', userId)
    .executeTakeFirst();
  
  // Update user online status
  await db
    .updateTable('users')
    .set({ is_online: true, last_seen: new Date() })
    .where('id', '=', userId)
    .execute();
  
  // Broadcast online users with avatars
  const onlineUsers = await db
    .selectFrom('users')
    .select(['id', 'username', 'avatar_url'])
    .where('is_online', '=', true)
    .execute();
  
  io.emit('users:online', onlineUsers);
});
```

---

## Anonymous Posting Feature

### Enable Anonymous Messages in Chatrooms

#### Step 1: Add Anonymous Column to Messages Table

```sql
-- Update messages table
ALTER TABLE messages ADD COLUMN is_anonymous BOOLEAN DEFAULT 0;
ALTER TABLE messages ADD COLUMN anonymous_name TEXT;
```

#### Step 2: Update Message Sending in Frontend

In `MainUhubFeatureV001ForChatModal.tsx`, add anonymous posting button:

```typescript
const [isAnonymous, setIsAnonymous] = useState(false);

const handleSendMessage = async () => {
  await fetch('/api/chat/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatroom_id: activeChatroom,
      content: message,
      is_anonymous: isAnonymous,  // Send anonymous flag
      anonymous_name: isAnonymous ? 'Anonymous' : user?.username
    })
  });
};

// Render anonymous toggle
<button 
  onClick={() => setIsAnonymous(!isAnonymous)}
  className={isAnonymous ? 'bg-gray-500' : 'bg-blue-500'}
>
  {isAnonymous ? 'Posting as Anonymous' : 'Post Anonymously'}
</button>
```

#### Step 3: Update Backend to Handle Anonymous Messages

In `server/chat.ts`:

```typescript
app.post('/api/chat/message', async (req, res) => {
  const { chatroom_id, content, is_anonymous, anonymous_name } = req.body;
  const userId = req.user?.id;
  
  const message = await db
    .insertInto('messages')
    .values({
      sender_id: is_anonymous ? null : userId,  // null for anonymous
      chatroom_id,
      content,
      is_anonymous,
      anonymous_name: is_anonymous ? anonymous_name : null,
      created_at: new Date()
    })
    .returningAll()
    .executeTakeFirst();
  
  // Emit message with anonymous flag
  io.to(`chatroom_${chatroom_id}`).emit('message', {
    id: message.id,
    username: message.is_anonymous ? 'Anonymous' : user.username,
    avatar_url: message.is_anonymous ? null : user.avatar_url,
    content: message.content,
    is_anonymous: message.is_anonymous,
    created_at: message.created_at
  });
  
  res.json(message);
});
```

#### Step 4: Display Anonymous Messages in Chat

In `MainUhubFeatureV001ForChatModal.tsx`, render messages with anonymous styling:

```typescript
{messages.map((msg) => (
  <div key={msg.id} className="flex gap-2 p-2 border-b">
    {msg.is_anonymous ? (
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs">
        A
      </div>
    ) : (
      <img 
        src={msg.avatar_url || '/default-avatar.png'}
        alt={msg.username}
        className="w-8 h-8 rounded-full"
      />
    )}
    <div className="flex-1">
      <div className="font-semibold">
        {msg.username}
        {msg.is_anonymous && <span className="text-gray-500 text-xs ml-2">(Anonymous)</span>}
      </div>
      <div className="text-sm text-gray-700">{msg.content}</div>
    </div>
  </div>
))}
```

---

## Database Configuration

### SQLite Configuration (Default/Development)

**Location:** `/home/app/data/database.sqlite`

**Current Setup:**
- Uses `better-sqlite3` driver
- Kysely query builder with logging enabled
- Automatically created if doesn't exist

**How to Connect in Code:**

```typescript
// In server/db.ts (already configured)
import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import type { DB } from './db-types.js';
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

**Running SQLite in Docker:**
- SQLite will automatically use `/app/data/database.sqlite` inside the container
- Data persists via Docker volume `app_data`

---

### MySQL Configuration (Production)

#### Step 1: Install MySQL Driver

```bash
npm install mysql2
npm install --save-dev @types/mysql2
```

#### Step 2: Create MySQL Init Script

Create `mysql-init.sql` in the root directory:

```sql
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS mainuhubfeaturev001;

-- Use the database
USE mainuhubfeaturev001;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_picture VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
);

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  friend_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_friendship (user_id, friend_id),
  INDEX idx_user_id (user_id),
  INDEX idx_friend_id (friend_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sender_id (sender_id),
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_created_at (created_at)
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Create broadcasts table
CREATE TABLE IF NOT EXISTS broadcasts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  theme VARCHAR(50) DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  privacy_level VARCHAR(50) DEFAULT 'public',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Step 3: Update server/db.ts for MySQL

Create a new file `server/db-mysql.ts`:

```typescript
import { Kysely, MysqlDialect } from 'kysely';
import { createPool } from 'mysql2/promise';
import type { DB } from './db-types.js';

const dialect = new MysqlDialect({
  pool: createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'uhubuser',
    password: process.env.DB_PASSWORD || 'uhubpassword',
    database: process.env.DB_NAME || 'mainuhubfeaturev001',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }),
});

export const db = new Kysely<DB>({
  dialect,
  log: ['query', 'error'],
});
```

#### Step 4: Update server/index.ts to use correct database

Modify `server/index.ts` to conditionally import the correct database:

```typescript
// Import the correct database based on environment
const dbModule = process.env.DATABASE_TYPE === 'mysql' 
  ? await import('./db-mysql.js')
  : await import('./db.js');
const { db } = dbModule;

// Then use db in your routes
```

#### Step 5: Update Environment Variables

Create `.env` or `.env.production` file:

```env
# Database - MySQL
DATABASE_TYPE=mysql
DB_HOST=mysql
DB_PORT=3306
DB_USER=uhubuser
DB_PASSWORD=uhubpassword
DB_NAME=mainuhubfeaturev001

# Server
NODE_ENV=production
PORT=4000
VITE_PORT=3000
JWT_SECRET=your-secret-key-change-in-production

# Optional
DATABASE_LOGGING=true
```

#### Step 6: Connecting to MySQL in Code

All database queries use the same Kysely syntax:

```typescript
// In any route file (auth.ts, friends.ts, chat.ts)
import { db } from './db.js'; // or './db-mysql.js' for MySQL

// Example: Create a user
const user = await db
  .insertInto('users')
  .values({
    username: 'johndoe',
    email: 'john@example.com',
    password_hash: hashedPassword,
  })
  .returningAll()
  .executeTakeFirst();

// Example: Query users
const users = await db
  .selectFrom('users')
  .selectAll()
  .execute();

// Example: Update user
await db
  .updateTable('users')
  .set({ profile_picture: 'url' })
  .where('id', '=', userId)
  .execute();
```

---

## Package.json Dependencies

Here's the complete `package.json` with all required dependencies:

```json
{
  "name": "mainuhubfeaturev001",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "build": "vite build && tsc --project tsconfig.server.json",
    "start": "tsx watch scripts/dev.ts",
    "start:prod": "node --loader tsx server/index.ts",
    "start:dev": "node scripts/dev.ts",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "1.1.3",
    "@radix-ui/react-dialog": "1.1.5",
    "@radix-ui/react-label": "2.1.1",
    "@radix-ui/react-popover": "1.1.5",
    "@radix-ui/react-progress": "1.1.1",
    "@radix-ui/react-select": "2.1.5",
    "@radix-ui/react-slider": "1.2.2",
    "@radix-ui/react-slot": "1.1.1",
    "@radix-ui/react-switch": "1.1.2",
    "@radix-ui/react-toggle": "1.1.1",
    "@radix-ui/react-tooltip": "1.1.7",
    "@types/bcryptjs": "^3.0.0",
    "@types/cookie-parser": "^1.4.10",
    "@types/jsonwebtoken": "^9.0.10",
    "bcryptjs": "^3.0.2",
    "better-sqlite3": "^12.4.1",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "1.1.1",
    "cookie-parser": "^1.4.7",
    "dotenv": "16.4.7",
    "esbuild": "0.25.1",
    "express": "5.1.0",
    "jsonwebtoken": "^9.0.2",
    "kysely": "^0.28.8",
    "kysely-codegen": "^0.19.0",
    "lucide-react": "^0.548.0",
    "mysql2": "^3.6.0",
    "react": "18.2.0",
    "react-day-picker": "^9.11.1",
    "react-dom": "18.2.0",
    "react-rnd": "^10.5.2",
    "react-router-dom": "^6.30.1",
    "socket.io": "^4.8.1",
    "socket.io-client": "^4.8.1",
    "tailwind-merge": "3.2.0",
    "tailwindcss-animate": "1.0.7"
  },
  "devDependencies": {
    "@types/express": "5.0.0",
    "@types/mysql2": "^3.0.0",
    "@types/node": "22.13.5",
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "@vitejs/plugin-react": "4.3.4",
    "autoprefixer": "10.4.18",
    "ignore": "7.0.3",
    "postcss": "8.4.35",
    "tailwindcss": "3.4.17",
    "tsx": "4.19.3",
    "typescript": "5.8.2",
    "vite": "6.3.1"
  }
}
```

---

## Express Server Configuration

### Main Server File (server/index.ts)

The Express server is configured to:
- Run on port 4000 (production) or 3001 (development)
- Serve static files in production
- Handle CORS for Socket.io
- Provide API routes for authentication and friends

Key environment variables:
```env
PORT=4000              # Server port
NODE_ENV=production    # Environment type
VITE_PORT=3000        # Frontend port for CORS
JWT_SECRET=xxx        # JWT signing secret
DATA_DIRECTORY=/app/data  # SQLite data directory
```

### Authentication Routes (server/auth.ts)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Friends Routes (server/friends.ts)

- `GET /api/friends` - Get user's friends
- `POST /api/friends/add` - Add a friend
- `DELETE /api/friends/:id` - Remove a friend
- `GET /api/friends/requests` - Get friend requests

### Chat Routes (server/chat.ts)

- Uses Socket.io for real-time communication
- Event: `message` - Send/receive messages
- Event: `typing` - User typing indicator
- Event: `online` - User online status

---

## Nginx Configuration

### Create nginx.conf

Create a file named `nginx.conf` in the root directory:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                  '$status $body_bytes_sent "$http_referer" '
                  '"$http_user_agent" "$http_x_forwarded_for"';

  access_log /var/log/nginx/access.log main;

  sendfile on;
  tcp_nopush on;
  tcp_nodelay on;
  keepalive_timeout 65;
  types_hash_max_size 2048;
  client_max_body_size 20M;

  # Gzip compression
  gzip on;
  gzip_vary on;
  gzip_min_length 1000;
  gzip_types text/plain text/css text/xml text/javascript 
             application/x-javascript application/xml+rss;

  # Rate limiting
  limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
  limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

  # Upstream backend
  upstream app_backend {
    server app:4000 max_fails=3 fail_timeout=30s;
    keepalive 32;
  }

  # HTTP redirect to HTTPS
  server {
    listen 80;
    server_name _;
    
    location /.well-known/acme-challenge/ {
      root /var/www/certbot;
    }
    
    location / {
      return 301 https://$host$request_uri;
    }
  }

  # HTTPS server
  server {
    listen 443 ssl http2;
    server_name _;

    # SSL certificates (change paths if using Letsencrypt)
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Root location
    root /usr/share/nginx/html;
    index index.html;

    # API routes
    location /api/ {
      limit_req zone=api burst=100 nodelay;
      
      proxy_pass http://app_backend;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_cache_bypass $http_upgrade;
      proxy_connect_timeout 60s;
      proxy_send_timeout 60s;
      proxy_read_timeout 60s;
    }

    # Socket.io
    location /socket.io {
      limit_req zone=api burst=100 nodelay;
      
      proxy_pass http://app_backend;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
      limit_req zone=general burst=50 nodelay;
      
      expires 30d;
      add_header Cache-Control "public, immutable";
      
      proxy_pass http://app_backend;
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }

    # SPA fallback
    location / {
      limit_req zone=general burst=20 nodelay;
      
      # Try file, then directory, then fallback to index.html for SPA
      try_files $uri $uri/ /index.html;
      
      # Don't cache HTML
      add_header Cache-Control "public, max-age=0";
    }

    # Deny access to hidden files
    location ~ /\. {
      deny all;
    }
  }
}
```

### Nginx SSL Setup

To use self-signed certificates for development:

```bash
# Create ssl directory
mkdir -p ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

For production with Let's Encrypt:

```bash
# Use certbot with docker
docker run -it --rm -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/lib/letsencrypt:/var/lib/letsencrypt \
  certbot/certbot certonly --standalone \
  -d yourdomain.com -d www.yourdomain.com
```

---

## Deployment Instructions

### Local Development with SQLite

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm start

# Frontend: http://localhost:3000
# API: http://localhost:3001
```

### Docker with SQLite (Recommended for Testing)

```bash
# 1. Build and start containers
docker-compose up --build

# 2. Access the application
# http://localhost/

# 3. View logs
docker-compose logs -f app

# 4. Stop containers
docker-compose down
```

### Docker with MySQL (Production)

```bash
# 1. Create .env file
cat > .env << EOF
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=mainuhubfeaturev001
MYSQL_USER=uhubuser
MYSQL_PASSWORD=uhubpassword
JWT_SECRET=your-production-secret-key
DATABASE_TYPE=mysql
EOF

# 2. Start containers
docker-compose -f docker-compose.yml up --build

# 3. Wait for MySQL to be ready (check logs)
docker-compose logs mysql

# 4. Access the application
# http://localhost/
```

### Manual Production Deployment

```bash
# 1. Clone repository
git clone <repo-url>
cd mainuhubfeaturev001

# 2. Install dependencies
npm install

# 3. Create .env
cat > .env.production << EOF
NODE_ENV=production
PORT=4000
VITE_PORT=3000
JWT_SECRET=your-production-secret-key
DATABASE_TYPE=mysql
DB_HOST=your-mysql-host
DB_USER=uhubuser
DB_PASSWORD=uhubpassword
DB_NAME=mainuhubfeaturev001
EOF

# 4. Build application
npm run build

# 5. Start server
NODE_ENV=production npm run start:prod
```

### Kubernetes Deployment

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mainuhubfeaturev001-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mainuhubfeaturev001
  template:
    metadata:
      labels:
        app: mainuhubfeaturev001
    spec:
      containers:
      - name: app
        image: mainuhubfeaturev001:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "4000"
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: db-config
              key: host
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: mainuhubfeaturev001-service
spec:
  selector:
    app: mainuhubfeaturev001
  ports:
  - protocol: TCP
    port: 80
    targetPort: 4000
  type: LoadBalancer
```

### Health Checks

```bash
# Check API health
curl http://localhost:4000/

# Check database connection
curl http://localhost:4000/api/auth/profile

# View server logs
docker-compose logs -f app

# View nginx logs
docker-compose logs -f nginx
```

---

## Troubleshooting

### MySQL Connection Issues
```bash
# Test MySQL connection from app container
docker-compose exec app mysql -h mysql -u uhubuser -p mainuhubfeaturev001

# Check MySQL logs
docker-compose logs mysql
```

### Port Already in Use
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9

# Or use different port in docker-compose
# Change "4000:4000" to "4001:4000"
```

### SSL Certificate Issues
```bash
# Regenerate self-signed certificate
rm ssl/cert.pem ssl/key.pem
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Org/CN=localhost"
```

### Database Migration
```bash
# For SQLite to MySQL migration
# Export SQLite data and import to MySQL
# Use tools like: https://github.com/transferwise/pipelinedb
```

---

## Security Checklist

- [ ] Change `JWT_SECRET` in production
- [ ] Use strong MySQL passwords
- [ ] Enable SSL/TLS certificates
- [ ] Set up firewall rules
- [ ] Enable rate limiting in Nginx
- [ ] Regular database backups
- [ ] Monitor application logs
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Implement CORS properly

---

## Store Creation & Product Management

### User Store Feature Overview

Logged-in users can create and manage their own store with product listings. Products are stored in the database and connected to user profiles.

### Step 1: Create Products Table Schema

In `server/db.ts`, ensure the products table exists:

```sql
-- SQLite Version
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  price REAL,
  website TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
```

For MySQL:

```sql
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  price DECIMAL(10, 2),
  website VARCHAR(255),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

### Step 2: Create Store API Routes

Create a new file `server/store.ts`:

```typescript
import express, { Router } from 'express';
import { db } from './db.js';
import { requireAuth } from './auth-middleware.js';

const router = Router();

// Get all products for a user's store
router.get('/store/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const products = await db
      .selectFrom('products')
      .selectAll()
      .where('user_id', '=', parseInt(userId))
      .orderBy('created_at', 'desc')
      .execute();

    res.json(products);
  } catch (error) {
    console.error('Error fetching store products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Create a new product (requires authentication)
router.post('/products', requireAuth, async (req, res) => {
  try {
    const { title, subtitle, description, price, website, image_url } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const product = await db
      .insertInto('products')
      .values({
        user_id: userId,
        title,
        subtitle,
        description,
        price: price ? parseFloat(price) : null,
        website,
        image_url,
      })
      .returningAll()
      .executeTakeFirst();

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
});

// Update a product (requires authentication)
router.put('/products/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, price, website, image_url } = req.body;
    const userId = req.user?.id;

    // Verify product belongs to user
    const product = await db
      .selectFrom('products')
      .select('user_id')
      .where('id', '=', parseInt(id))
      .executeTakeFirst();

    if (!product || product.user_id !== userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const updatedProduct = await db
      .updateTable('products')
      .set({
        title,
        subtitle,
        description,
        price: price ? parseFloat(price) : null,
        website,
        image_url,
        updated_at: new Date(),
      })
      .where('id', '=', parseInt(id))
      .returningAll()
      .executeTakeFirst();

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
});

// Delete a product (requires authentication)
router.delete('/products/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Verify product belongs to user
    const product = await db
      .selectFrom('products')
      .select('user_id')
      .where('id', '=', parseInt(id))
      .executeTakeFirst();

    if (!product || product.user_id !== userId) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    await db
      .deleteFrom('products')
      .where('id', '=', parseInt(id))
      .execute();

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

export default router;
```

### Step 3: Register Store Routes in server/index.ts

Add these lines to `server/index.ts`:

```typescript
import storeRouter from './store.js';

// After other API routes
app.use('/api', storeRouter);
```

### Step 4: Frontend - Create Store Product Management Component

The file `client/src/features/profile/MainUhubFeatureV001ForAddProductModal.tsx` is already created for adding products.

Update it to connect to the backend:

```typescript
// In MainUhubFeatureV001ForAddProductModal.tsx
const handleSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('website', website);
    if (image) {
      formData.append('image', image);
    }

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (response.ok) {
      const newProduct = await response.json();
      console.log('Product created:', newProduct);
      onClose();
      // Refresh products list
    } else {
      console.error('Error creating product');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Step 5: Frontend - Display Store Products

Create a new component `client/src/features/profile/MainUhubFeatureV001ForStoreView.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import MainUhubFeatureV001ForProductDetailModal from './MainUhubFeatureV001ForProductDetailModal';

interface Product {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  price?: number;
  image_url?: string;
  website?: string;
}

export default function MainUhubFeatureV001ForStoreView() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchProducts();
    }
  }, [user?.id]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/store/${user?.id}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {products.length === 0 ? (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500">No products in your store yet</p>
          <Button onClick={() => console.log('Add product')}>Add First Product</Button>
        </div>
      ) : (
        products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition"
            onClick={() => setSelectedProduct(product)}
          >
            {product.image_url && (
              <img 
                src={product.image_url} 
                alt={product.title}
                className="w-full h-40 object-cover rounded mb-2"
              />
            )}
            <h3 className="font-bold">{product.title}</h3>
            {product.subtitle && <p className="text-sm text-gray-600">{product.subtitle}</p>}
            {product.price && <p className="text-lg font-semibold">${product.price}</p>}
          </div>
        ))
      )}

      {selectedProduct && (
        <MainUhubFeatureV001ForProductDetailModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
```

### Step 6: Docker Volumes for Product Images

Update `docker-compose.yml` to persist product images:

```yaml
services:
  app:
    # ... existing config ...
    volumes:
      - app_data:/app/data
      - product_images:/app/public/uploads  # Add this for images
      
volumes:
  app_data:
  product_images:  # Add this volume
```

### Step 7: Enable File Uploads in Express

Update `server/index.ts` to handle file uploads:

```typescript
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.env.DATA_DIRECTORY || 'data', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Update product creation route to handle file uploads
app.post('/api/products', requireAuth, upload.single('image'), async (req, res) => {
  // ... existing code ...
  // image_url will be req.file?.filename
});
```

### Step 8: Connect Products to MySQL/SQLite

For production deployments, ensure your Docker volumes are properly configured:

```bash
# View data volumes
docker volume ls

# Backup database
docker run --rm -v app_data:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/database-backup.tar.gz -C /data .

# Restore database
docker run --rm -v app_data:/data -v $(pwd):/backup \
  ubuntu tar xzf /backup/database-backup.tar.gz -C /data
```

---

## Database Connection Verification

### Test SQLite Connection

```bash
# Inside Docker container
docker-compose exec app sqlite3 /app/data/database.sqlite

# Check tables
.tables

# Query users
SELECT * FROM users;

# Exit
.quit
```

### Test MySQL Connection

```bash
# Inside Docker container
docker-compose exec mysql mysql -u uhubuser -puhubpassword mainuhubfeaturev001

# Check tables
SHOW TABLES;

# Query users
SELECT * FROM users;

# Exit
exit
```

### Test API Endpoints

```bash
# Register user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create product (replace TOKEN with actual token)
curl -X POST http://localhost:4000/api/products \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Product","price":"29.99"}'

# Get store products
curl http://localhost:4000/api/store/1
```

---

## Support & Documentation

- Express Docs: https://expressjs.com
- Kysely Docs: https://kysely.dev
- Socket.io Docs: https://socket.io
- Docker Docs: https://docs.docker.com
- Nginx Docs: https://nginx.org/en/docs/
- Multer (File Uploads): https://github.com/expressjs/multer

