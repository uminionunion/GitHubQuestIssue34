# MainUhubFeatureV001 - Docker Volumes & Container Networking

Complete guide for managing Docker volumes, container networking, and inter-container communication.

---

## Table of Contents

1. [Docker Volumes Overview](#docker-volumes-overview)
2. [Data Persistence](#data-persistence)
3. [Container Networking](#container-networking)
4. [Inter-Container Communication](#inter-container-communication)
5. [Volume Management Commands](#volume-management-commands)
6. [Real-World Examples](#real-world-examples)

---

## Docker Volumes Overview

### What Are Docker Volumes?

**Volumes** are Docker's mechanism for persisting data generated and used by containers. Without volumes, data inside a container is lost when the container stops.

```
Without Volumes:
Container running → Container stops → All data deleted ❌

With Volumes:
Container running → Container stops → Data still exists on host ✓
```

### Three Ways to Mount Data in Docker

#### 1. Named Volumes (Recommended for Databases)

```yaml
# In docker-compose.yml
volumes:
  # Create a named volume that persists across container restarts
  mysql_data:

services:
  mysql:
    volumes:
      # This mounts the named volume 'mysql_data' to /var/lib/mysql inside the container
      # Data is automatically managed by Docker
      - mysql_data:/var/lib/mysql
```

**Advantages:**
- Easy to manage
- Automatically created and removed
- Data survives container deletion
- Can be backed up easily
- Works on all platforms

#### 2. Bind Mounts (Recommended for Development)

```yaml
# In docker-compose.yml
services:
  app:
    volumes:
      # This mounts a host directory to a container directory
      # Format: /host/path:/container/path
      - ./data:/app/data
      - ./src:/app/src
```

**Advantages:**
- See and edit files on your computer
- Live code changes reflected in container
- Easy to understand (direct file mapping)

**Disadvantages:**
- Path dependencies can vary between systems
- Performance overhead on some systems

#### 3. Anonymous Volumes

```yaml
services:
  database:
    volumes:
      # Anonymous volume created at /var/lib/postgresql/data
      # Data survives, but harder to manage
      - /var/lib/postgresql/data
```

---

## Data Persistence

### SQLite Data Persistence (Development)

```yaml
# docker-compose.yml - SQLite Configuration

version: '3.8'

services:
  app:
    build: .
    ports:
      - "4000:4000"
    # Bind mount for SQLite database
    # This maps your local ./data folder to /app/data in container
    volumes:
      # Format: HOST_PATH:CONTAINER_PATH
      - ./data:/app/data
    environment:
      # Database will be stored in /app/data/database.sqlite
      DATA_DIRECTORY: /app/data
```

**How it works:**
1. Container starts, creates `/app/data/database.sqlite`
2. Because of the volume mount, file also appears at `./data/database.sqlite` on your computer
3. When container stops, data remains in `./data/` folder
4. Next time container starts, it reads existing data from `./data/`

**Verify data persists:**

```bash
# Start container
docker-compose up -d

# Create some data in app...

# List files in local data folder (should see database.sqlite)
ls -la data/

# Stop container
docker-compose stop

# Files still exist locally
ls -la data/database.sqlite

# Start container again - data is still there
docker-compose up -d
```

### MySQL Data Persistence (Production)

```yaml
# docker-compose.yml - MySQL Configuration

version: '3.8'

volumes:
  # Define a named volume for MySQL data
  mysql_data:
    # Driver determines how Docker manages the volume
    driver: local
    # Driver options for the volume
    driver_opts:
      # Mount type - can be 'nfs', 'tmpfs', etc.
      type: none
      # Options for the mount
      o: bind
      # Path on host where data is stored
      device: /var/lib/docker/volumes/mysql-data

services:
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: mainuhubfeaturev001
      MYSQL_USER: uhubuser
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    
    # Mount the named volume
    volumes:
      # Format: VOLUME_NAME:CONTAINER_PATH
      # This maps 'mysql_data' volume to /var/lib/mysql in container
      - mysql_data:/var/lib/mysql
      # Copy init script into container
      - ./mysql-init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```

**Data Persistence Flow:**

```
1. MySQL container starts
2. Initialization script runs → creates database and tables
3. All data written to /var/lib/mysql in container
4. Docker persists this to named volume 'mysql_data'
5. Container stops → data still in 'mysql_data' volume
6. Container starts again → volume mounted → data restored
```

**Verify MySQL persistence:**

```bash
# Start containers
docker-compose up -d

# Check MySQL data in named volume
docker volume inspect mysql_data
# Shows: "Mountpoint": "/var/lib/docker/volumes/mysql_data/_data"

# View actual files
ls -la /var/lib/docker/volumes/mysql_data/_data/

# Stop and remove container (but keep volume)
docker-compose down

# Start again - data preserved
docker-compose up -d

# Verify data exists
docker-compose exec mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "SELECT * FROM mainuhubfeaturev001.users;"
```

### PostgreSQL Data Persistence

```yaml
volumes:
  postgres_data:
    driver: local

services:
  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres-init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```

---

## Container Networking

### Docker Network Types

Docker creates a network for containers to communicate with each other.

#### 1. Bridge Network (Default in Compose)

```
Host Machine
├── Bridge Network (mainuhubfeaturev001-network)
│   ├── Container 1 (app) - IP: 172.18.0.2
│   ├── Container 2 (mysql) - IP: 172.18.0.3
│   └── Container 3 (nginx) - IP: 172.18.0.4
```

**Advantages:**
- Isolated from other networks
- Containers can communicate by name or IP
- Default for Docker Compose

```yaml
version: '3.8'

networks:
  # Define a bridge network
  mainuhubfeaturev001-network:
    driver: bridge
    # Optional: specify subnet
    ipam:
      config:
        - subnet: 172.20.0.0/16

services:
  app:
    networks:
      - mainuhubfeaturev001-network
  
  mysql:
    networks:
      - mainuhubfeaturev001-network
```

#### 2. Host Network

```yaml
services:
  app:
    network_mode: host
    # Container shares host network - can access ports directly
    # WARNING: Conflicts if multiple containers use same port
```

#### 3. None Network

```yaml
services:
  isolated:
    network_mode: none
    # Container has no network access (very isolated)
```

### Service Discovery

Docker Compose automatically enables **service discovery** - containers can reach each other by service name.

```yaml
services:
  app:
    # Service name: 'app'
    container_name: mainuhubfeaturev001-app
  
  mysql:
    # Service name: 'mysql'
    container_name: mainuhubfeaturev001-mysql
```

**From within app container, connect to MySQL:**

```typescript
// In server/db.ts
// Instead of: 'localhost' or '127.0.0.1'
// Use the service name: 'mysql'

const pool = mysql.createPool({
  host: 'mysql',        // Service name in docker-compose
  user: 'uhubuser',
  password: 'uhubpassword',
  database: 'mainuhubfeaturev001'
});

// Docker DNS resolves 'mysql' → 172.18.0.3 (MySQL container IP)
```

**How it works:**

```
Inside app container:
1. App makes request to 'mysql:3306'
2. Docker's embedded DNS server resolves 'mysql' → 172.18.0.3
3. Request sent to that IP
4. MySQL container receives request
5. MySQL container responds
```

---

## Inter-Container Communication

### Complete Example: App → MySQL → Nginx

```yaml
version: '3.8'

# Define volumes
volumes:
  # Named volume for MySQL data persistence
  mysql_data:
    driver: local

# Define networks
networks:
  # Bridge network for container communication
  mainuhubfeaturev001-network:
    driver: bridge

services:
  # MySQL Database Container
  mysql:
    image: mysql:8.0
    container_name: mainuhubfeaturev001-mysql
    
    # Environment variables for MySQL
    environment:
      MYSQL_ROOT_PASSWORD: rootpass123
      MYSQL_DATABASE: mainuhubfeaturev001
      MYSQL_USER: uhubuser
      MYSQL_PASSWORD: uhubpass123
    
    # Expose port (only on host, not to other containers)
    ports:
      - "3306:3306"
    
    # Persistent storage for database files
    volumes:
      # Mount named volume
      - mysql_data:/var/lib/mysql
      # Copy initialization script
      - ./mysql-init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    
    # Assign to network
    networks:
      - mainuhubfeaturev001-network
    
    # Health check for container readiness
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Express App Container
  app:
    build: .
    container_name: mainuhubfeaturev001-app
    
    # Environment variables for app
    environment:
      NODE_ENV: production
      PORT: 4000
      # Connect to MySQL using service name (NOT localhost)
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: uhubuser
      DB_PASSWORD: uhubpass123
      DB_NAME: mainuhubfeaturev001
      JWT_SECRET: ${JWT_SECRET}
    
    # Port mapping: HOST:CONTAINER
    ports:
      - "4000:4000"
    
    # Files from host computer
    volumes:
      # Bind mount for SQLite (if also using SQLite)
      - ./data:/app/data
    
    # Depends on MySQL - wait for it to be healthy
    depends_on:
      mysql:
        condition: service_healthy
    
    # Assign to network
    networks:
      - mainuhubfeaturev001-network

  # Nginx Reverse Proxy Container
  nginx:
    image: nginx:alpine
    container_name: mainuhubfeaturev001-nginx
    
    # Port mapping: PORT 80 on host to port 80 in container
    ports:
      - "80:80"
      - "443:443"
    
    # Nginx configuration files
    volumes:
      # Mount nginx config from host
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      # Mount SSL certificates
      - ./ssl:/etc/nginx/ssl:ro
    
    # Depends on app container
    depends_on:
      - app
    
    # Assign to network
    networks:
      - mainuhubfeaturev001-network
```

### Communication Flow

```
Request Path:
1. User → nginx:80 (external internet)
2. Nginx reverse proxy → app:4000 (internal network, using DNS 'app')
3. App → mysql:3306 (internal network, using DNS 'mysql')
4. MySQL processes request
5. MySQL → App (same internal network)
6. App → Nginx (same internal network)
7. Nginx → User (external internet)
```

### Code Example: App Connecting to MySQL

```typescript
// server/db.ts
// This code runs INSIDE the app container

import { createPool } from 'mysql2/promise';

// Create connection pool to MySQL
const pool = createPool({
  // Use service name 'mysql' instead of localhost
  // Docker's embedded DNS resolves this to MySQL container IP
  host: process.env.DB_HOST || 'mysql',
  
  // MySQL port (internal container port, not host port)
  port: parseInt(process.env.DB_PORT || '3306'),
  
  // Credentials from environment variables
  user: process.env.DB_USER || 'uhubuser',
  password: process.env.DB_PASSWORD || 'uhubpass123',
  database: process.env.DB_NAME || 'mainuhubfeaturev001',
  
  // Connection pooling settings
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const db = new Kysely({
  dialect: new MysqlDialect({ pool }),
  log: ['query', 'error'],
});
```

### Code Example: Nginx Connecting to App

```nginx
# nginx.conf
# This configuration runs INSIDE the nginx container

# Upstream group (backend servers)
upstream app_backend {
  # Use service name 'app' instead of localhost
  # Docker's embedded DNS resolves this to app container IP
  server app:4000 max_fails=3 fail_timeout=30s;
}

server {
  listen 80;
  
  # Route API requests to the app container
  location /api/ {
    # Proxy to 'app' service via internal network
    proxy_pass http://app_backend;
    
    # Headers to pass through
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

---

## Volume Management Commands

### List Volumes

```bash
# List all volumes
docker volume ls

# Output:
# DRIVER    VOLUME NAME
# local     mysql_data
# local     app_data
# local     postgres_data
```

### Inspect a Volume

```bash
# Get detailed information about a volume
docker volume inspect mysql_data

# Output includes:
# {
#   "Name": "mysql_data",
#   "Driver": "local",
#   "Mountpoint": "/var/lib/docker/volumes/mysql_data/_data",
#   "Labels": {},
#   "Scope": "local"
# }
```

### Access Volume Data

```bash
# View files in a volume
ls -la /var/lib/docker/volumes/mysql_data/_data/

# Copy file from volume to host
docker cp mainuhubfeaturev001-mysql:/var/lib/mysql/mainuhubfeaturev001/ ./backup/

# Copy file from host to volume
docker cp ./backup.sql mainuhubfeaturev001-mysql:/tmp/
```

### Backup a Volume

```bash
# Method 1: Tar backup
docker run --rm \
  -v mysql_data:/dbdata \
  -v $(pwd):/backup \
  ubuntu tar czf /backup/mysql_data_backup.tar.gz -C /dbdata .

# Method 2: Database dump (MySQL)
docker-compose exec mysql mysqldump \
  -u uhubuser -puhubpass123 \
  mainuhubfeaturev001 > backup.sql

# Method 3: Copy entire volume
docker run --rm \
  -v mysql_data:/dbdata \
  -v $(pwd)/backup:/backup \
  ubuntu cp -r /dbdata /backup/mysql_data
```

### Restore a Volume

```bash
# From tar backup
docker run --rm \
  -v mysql_data:/dbdata \
  -v $(pwd):/backup \
  ubuntu tar xzf /backup/mysql_data_backup.tar.gz -C /dbdata

# From SQL dump
docker-compose exec -T mysql mysql \
  -u uhubuser -puhubpass123 \
  mainuhubfeaturev001 < backup.sql

# From copied folder
docker run --rm \
  -v mysql_data:/dbdata \
  -v $(pwd)/backup:/backup \
  ubuntu cp -r /backup/mysql_data/* /dbdata/
```

### Delete Volumes

```bash
# Delete a specific volume
# WARNING: This deletes all data in the volume
docker volume rm mysql_data

# Delete all unused volumes
docker volume prune

# Confirm deletion
docker volume ls
```

### Persist volumes across container recreation

```bash
# When you run: docker-compose down
# It removes containers but keeps volumes

# To also delete volumes: (WARNING - deletes data)
docker-compose down -v

# To keep volumes and stop containers only:
docker-compose stop
```

---

## Real-World Examples

### Example 1: Local Development with SQLite

**Goal:** Run app locally with hot reload and SQLite database

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"    # Vite frontend
      - "3001:3001"    # Express API
    
    # Bind mount for live code changes
    volumes:
      # Source code updates reflect in container
      - ./client:/app/client
      - ./server:/app/server
      # Persistent SQLite database
      - ./data:/app/data
    
    environment:
      NODE_ENV: development
      PORT: 3001
      VITE_PORT: 3000
      DATABASE_TYPE: sqlite
      DATA_DIRECTORY: /app/data

# Run with:
# docker-compose up --build
```

### Example 2: Production with MySQL and Backup

**Goal:** Production setup with daily backups

```bash
#!/bin/bash
# backup.sh - Daily backup script

# Create backup directory
mkdir -p ./backups

# Backup MySQL
docker-compose exec -T mysql mysqldump \
  -u uhubuser -puhubpass123 \
  mainuhubfeaturev001 \
  > ./backups/mysql_$(date +%Y%m%d_%H%M%S).sql

# Compress backup
gzip ./backups/mysql_*.sql

# Keep only last 30 days of backups
find ./backups -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed at $(date)"
```

**Add to crontab for daily execution:**

```bash
# Edit crontab
crontab -e

# Add line to run backup every day at 2 AM
0 2 * * * /home/app/backup.sh
```

### Example 3: Multiple Apps Sharing Network

**Goal:** Run multiple isolated applications on same host

```yaml
# docker-compose.yml
version: '3.8'

networks:
  # Shared network
  mainuhubfeaturev001-network:
    driver: bridge

services:
  # App 1: MainUhubFeatureV001
  mainuhub-app:
    build: ./mainuhub
    networks:
      - mainuhubfeaturev001-network
    environment:
      DB_HOST: mainuhub-mysql
  
  mainuhub-mysql:
    image: mysql:8.0
    networks:
      - mainuhubfeaturev001-network
    volumes:
      - mainuhub_data:/var/lib/mysql

volumes:
  mainuhub_data:
```

### Example 4: Development with Multiple Services

**Goal:** Full local development with database, cache, and API

```yaml
version: '3.8'

volumes:
  mysql_data:
  redis_data:

networks:
  dev-network:
    driver: bridge

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: mainuhubfeaturev001
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - dev-network
    ports:
      - "3306:3306"

  # Redis Cache
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - dev-network
    ports:
      - "6379:6379"

  # Node App
  app:
    build: .
    volumes:
      - ./:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
      DB_HOST: mysql
      REDIS_HOST: redis
    networks:
      - dev-network
    ports:
      - "3001:3001"
    depends_on:
      - mysql
      - redis
```

---

## Troubleshooting

### Container Can't Connect to MySQL

```bash
# 1. Check if MySQL container is running
docker-compose ps

# 2. Check MySQL is healthy
docker-compose logs mysql

# 3. Verify network connection
docker-compose exec app ping mysql

# 4. Test MySQL connection
docker-compose exec app mysql -h mysql -u uhubuser -p

# 5. Check environment variables in app
docker-compose exec app env | grep DB_
```

### Volume Not Persisting Data

```bash
# 1. Check volume exists
docker volume ls

# 2. Check volume path
docker volume inspect mysql_data

# 3. Verify volume is mounted
docker inspect mainuhubfeaturev001-mysql | grep -A 5 Mounts

# 4. Check file permissions
ls -la /var/lib/docker/volumes/mysql_data/_data/

# 5. Remount volume
docker-compose down
docker-compose up -d
```

### Port Conflicts

```bash
# 1. Check which process uses the port
lsof -i :3306

# 2. Change port in docker-compose.yml
# FROM: - "3306:3306"
# TO:   - "3307:3306"

# 3. Recreate containers
docker-compose down
docker-compose up -d
```

### Slow Volume Performance (Mac/Windows)

Docker for Mac/Windows has slower file access. Solutions:

```bash
# 1. Use named volumes instead of bind mounts for data
volumes:
  data:
    driver: local

# 2. Use delegated mount for development
volumes:
  - ./src:/app/src:delegated

# 3. Or use cached mount
volumes:
  - ./data:/app/data:cached
```
