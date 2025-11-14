# MainUhubFeatureV001 - Environment Setup & Configuration

Complete guide for setting up environment variables, configuring the application, and understanding the different deployment options.

---

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Development Setup](#development-setup)
3. [Production Setup](#production-setup)
4. [Database Configuration](#database-configuration)
5. [Port Configuration](#port-configuration)
6. [API Configuration](#api-configuration)

---

## Environment Variables

### Create .env File for Development

Create a `.env` file in the root directory (`/home/app/.env`):

```env
# ============================================
# NODE ENVIRONMENT
# ============================================
# Specifies whether the app is running in development or production mode
# Values: 'development' or 'production'
# In development, the app serves frontend and backend separately
# In production, the app serves built frontend files from the backend
NODE_ENV=development

# ============================================
# SERVER CONFIGURATION
# ============================================
# The port the Express server listens on
# Default: 3001 for development, 4000 for production
PORT=3001

# The port where the Vite dev server runs (frontend)
# Only used in development
# Default: 3000
VITE_PORT=3000

# ============================================
# DATABASE CONFIGURATION
# ============================================
# Type of database to use
# Options: 'sqlite' (default) or 'mysql' or 'postgres'
DATABASE_TYPE=sqlite

# For SQLite (default) - this is the path where the database file will be stored
# The application automatically creates this directory if it doesn't exist
DATA_DIRECTORY=./data

# For MySQL - hostname of the MySQL server
# In Docker, use the service name: 'mysql'
# Locally, use: 'localhost'
DB_HOST=localhost

# For MySQL - port the MySQL server listens on
# Default MySQL port: 3306
DB_PORT=3306

# For MySQL - username to connect to the database
DB_USER=uhubuser

# For MySQL - password for the database user
# IMPORTANT: Change this in production!
DB_PASSWORD=uhubpassword

# For MySQL - the database name to use
DB_NAME=mainuhubfeaturev001

# ============================================
# SECURITY
# ============================================
# Secret key for signing JWT (JSON Web Tokens) for authentication
# This is used to encode/decode user session tokens
# IMPORTANT: Change this to a random string in production!
# Generate a strong key: openssl rand -hex 32
JWT_SECRET=your-secret-key-change-in-production

# ============================================
# LOGGING
# ============================================
# Enable detailed database query logging
# Useful for debugging database issues
# Values: 'true' or 'false'
DATABASE_LOGGING=true

# ============================================
# APPLICATION FEATURES
# ============================================
# Enable chat/messaging feature
ENABLE_CHAT=true

# Enable friends/social feature
ENABLE_FRIENDS=true

# Enable product listings feature
ENABLE_PRODUCTS=true
```

### Create .env.production File for Production

Create a `.env.production` file in the root directory (`/home/app/.env.production`):

```env
# ============================================
# PRODUCTION ENVIRONMENT
# ============================================
# IMPORTANT: These values should be kept SECRET
# Never commit .env.production to version control
# Never share these values publicly

# Set to production mode
NODE_ENV=production

# Server port for the application
PORT=4000

# Frontend port (not used in production)
VITE_PORT=3000

# ============================================
# DATABASE - MySQL (Recommended for Production)
# ============================================
DATABASE_TYPE=mysql

# MySQL server address
# For Docker: use service name 'mysql'
# For managed service: use your provider's host
DB_HOST=mysql

# MySQL port
DB_PORT=3306

# MySQL username
# Should be a strong, unique value
DB_USER=uhubuser

# MySQL password
# GENERATE A STRONG PASSWORD:
# openssl rand -hex 16
DB_PASSWORD=your-super-secure-password-here

# Database name
DB_NAME=mainuhubfeaturev001

# ============================================
# SECURITY (CHANGE THESE!)
# ============================================
# JWT Secret for token signing
# Generate with: openssl rand -hex 32
JWT_SECRET=your-super-secret-jwt-key-change-this

# ============================================
# LOGGING
# ============================================
# Disable verbose logging in production (for performance)
DATABASE_LOGGING=false
```

### Environment Variables for Docker

When using Docker, environment variables can be set in multiple ways:

#### Option 1: .env File (Recommended)

The Docker container will automatically read from `.env` file in the root directory.

```bash
# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=4000
VITE_PORT=3000
DATABASE_TYPE=mysql
DB_HOST=mysql
DB_PORT=3306
DB_USER=uhubuser
DB_PASSWORD=your-password
DB_NAME=mainuhubfeaturev001
JWT_SECRET=your-jwt-secret
EOF
```

#### Option 2: Docker Compose Environment Variables

Add to `docker-compose.yml`:

```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - PORT=4000
      - DB_HOST=mysql
      - DB_USER=uhubuser
      - DB_PASSWORD=${MYSQL_PASSWORD}  # Reference from .env
```

#### Option 3: Command Line

```bash
# Pass variables when running Docker
docker run -e NODE_ENV=production -e PORT=4000 mainuhubfeaturev001:latest
```

---

## Development Setup

### Step 1: Install Node.js

Download from https://nodejs.org/ (v18 or higher recommended)

```bash
# Verify Node.js installation
node --version

# Verify npm installation
npm --version
```

### Step 2: Install Dependencies

```bash
# Navigate to project directory
cd /home/app

# Install all dependencies from package.json
npm install
```

### Step 3: Create Environment File

```bash
# Copy the development environment template
cp .env.example .env

# Edit .env file with your values (or just use defaults for local development)
# The defaults are set up for local SQLite development
```

### Step 4: Start Development Server

```bash
# This runs both frontend (Vite on port 3000) and backend (Express on port 3001)
npm start

# Output should show:
# VITE v6.3.1  ready in 123 ms
# Frontend: http://localhost:3000
# API Server running on port 3001
```

### Step 5: Access the Application

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001/api/*
- **Database:** Stored in `/home/app/data/database.sqlite`

### Development Environment Variables

For local development, default values work fine:

```env
NODE_ENV=development
PORT=3001
VITE_PORT=3000
DATABASE_TYPE=sqlite
DATA_DIRECTORY=./data
JWT_SECRET=dev-secret-key
```

---

## Production Setup

### Step 1: Install Dependencies

```bash
# Install production dependencies only
npm install --production
```

### Step 2: Build the Application

```bash
# Builds both frontend (Vite) and backend (TypeScript)
npm run build

# This creates:
# - /home/app/dist/          (React frontend compiled files)
# - /home/app/server/*.js    (Express backend compiled files)
```

### Step 3: Create Production Environment File

```bash
# Create .env.production with secure values
cat > .env.production << EOF
NODE_ENV=production
PORT=4000
VITE_PORT=3000
DATABASE_TYPE=mysql
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=uhubuser
DB_PASSWORD=your-secure-password
DB_NAME=mainuhubfeaturev001
JWT_SECRET=$(openssl rand -hex 32)
DATABASE_LOGGING=false
EOF
```

### Step 4: Start Production Server

```bash
# Start the production server
# The app will use .env.production or fallback to .env
NODE_ENV=production npm run start:prod

# Output:
# API Server running on port 4000
# Production frontend files served from ./dist/
```

### Production Environment Variables

```env
NODE_ENV=production
PORT=4000
VITE_PORT=3000
DATABASE_TYPE=mysql
DB_HOST=mysql.example.com
DB_PORT=3306
DB_USER=uhubuser
DB_PASSWORD=<secure-password>
DB_NAME=mainuhubfeaturev001
JWT_SECRET=<random-secret-from-openssl>
DATABASE_LOGGING=false
```

---

## Database Configuration

### SQLite (Default/Development)

```env
# SQLite uses a local file-based database
# No network connection needed

DATABASE_TYPE=sqlite
DATA_DIRECTORY=./data

# Database file will be at: ./data/database.sqlite
```

**Advantages:**
- No setup required
- Perfect for development and testing
- Single file, easy to backup

**Disadvantages:**
- Limited for high-concurrency applications
- Not ideal for distributed systems

### MySQL (Production)

```env
DATABASE_TYPE=mysql
DB_HOST=mysql              # Docker service name or IP
DB_PORT=3306               # Default MySQL port
DB_USER=uhubuser           # Created during MySQL setup
DB_PASSWORD=uhubpassword   # Must be changed in production
DB_NAME=mainuhubfeaturev001
```

**Advantages:**
- Production-ready
- Supports multiple concurrent connections
- Better performance at scale
- Network accessible

**Disadvantages:**
- Requires external service setup
- More complex deployment

### PostgreSQL (Alternative)

```env
DATABASE_TYPE=postgres
DB_HOST=postgres           # Docker service name or IP
DB_PORT=5432               # Default PostgreSQL port
DB_USER=uhubuser
DB_PASSWORD=uhubpassword
DB_NAME=mainuhubfeaturev001
```

---

## Port Configuration

### Development Ports

| Service | Port | Purpose |
|---------|------|---------|
| Vite Frontend | 3000 | React dev server with hot reload |
| Express API | 3001 | Backend API server |

Access: 
- Frontend: `http://localhost:3000`
- API: `http://localhost:3001/api/*`

### Production Ports

| Service | Port | Purpose |
|---------|------|---------|
| Express API | 4000 | Serves both API and frontend |
| Nginx | 80 | HTTP traffic |
| Nginx | 443 | HTTPS traffic |
| MySQL | 3306 | Database (if running) |

Access:
- Application: `http://localhost:4000` or `https://yourdomain.com`

### Changing Ports

To use different ports:

```env
# For development
PORT=3002          # Express will run on port 3002
VITE_PORT=3001     # Vite will run on port 3001

# For production
PORT=8000          # Express will run on port 8000
```

### Port Conflicts

If a port is already in use:

```bash
# Find what's using the port (Linux/Mac)
lsof -ti:3001

# Kill the process
kill -9 <PID>

# For Docker
docker-compose down  # Stop all containers
```

---

## API Configuration

### Base URL Configuration

The frontend automatically uses the correct API URL based on environment:

**Development:**
```javascript
// Frontend connects to http://localhost:3001/api
const API_BASE_URL = 'http://localhost:3001/api';
```

**Production:**
```javascript
// Frontend connects to the same domain it's served from
const API_BASE_URL = '/api';
```

### CORS Configuration

Currently configured for development. For production:

```typescript
// In server/index.ts, update CORS settings:
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/friends` | Get friends list |
| POST | `/api/friends/add` | Add friend |
| DELETE | `/api/friends/:id` | Remove friend |

### JWT Token Configuration

The JWT secret is used to sign authentication tokens:

```env
# Generate a strong JWT secret
openssl rand -hex 32

# Add to .env
JWT_SECRET=abc123def456...
```

**Token Expiration:**
Tokens expire after 7 days (configurable in `server/auth.ts`)

**How it works:**
1. User logs in → Express creates JWT token
2. Token stored in browser cookies
3. Each API request includes token
4. Express validates token with JWT_SECRET

---

## Verification Checklist

After setting up environment variables, verify everything works:

```bash
# ✓ Check Node.js version
node --version

# ✓ Check npm version
npm --version

# ✓ Check dependencies installed
ls node_modules

# ✓ Check .env file exists
cat .env

# ✓ Start development server
npm start

# ✓ Open browser and test
# http://localhost:3000 (should load)
# http://localhost:3001/api/auth/profile (should show API response)

# ✓ Check database created
ls -la data/database.sqlite

# ✓ Check logs for errors
# Look for any error messages in console
```

---

## Troubleshooting

### Error: "Cannot find module 'dotenv'"

```bash
# Fix: Install missing dependency
npm install dotenv
```

### Error: "PORT 3001 is already in use"

```bash
# Option 1: Change port in .env
echo "PORT=3002" >> .env

# Option 2: Kill the process using the port
lsof -ti:3001 | xargs kill -9
```

### Error: "Cannot connect to database"

```bash
# Check if data directory exists
mkdir -p data

# For MySQL, verify connection
mysql -h localhost -u uhubuser -p mainuhubfeaturev001
```

### Error: "JWT_SECRET not found"

```bash
# Add to .env
echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env

# Verify it was added
grep JWT_SECRET .env
```

### Frontend shows blank page

```bash
# Check browser console for errors (F12)
# Check API is running: curl http://localhost:3001/api/auth/profile
# Check VITE_PORT matches in .env and frontend connection
```

---

## Production Checklist

Before deploying to production:

- [ ] Generate strong JWT_SECRET: `openssl rand -hex 32`
- [ ] Generate strong DB_PASSWORD: `openssl rand -hex 16`
- [ ] Set NODE_ENV=production
- [ ] Change DATABASE_TYPE to mysql (recommended)
- [ ] Configure DB_HOST to your MySQL server
- [ ] Enable SSL certificates for HTTPS
- [ ] Disable DATABASE_LOGGING for performance
- [ ] Set appropriate PORT (default: 4000)
- [ ] Test all environment variables
- [ ] Run `npm run build` successfully
- [ ] Test production build locally first
- [ ] Back up your database before deploying
- [ ] Monitor logs after deployment
