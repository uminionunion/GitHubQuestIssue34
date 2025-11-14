# MainUhubFeatureV001 - Code Comments & Architecture Guide

Complete documentation with line-by-line comments explaining what each piece of code does. Useful for beginners and debugging.

---

## Table of Contents

1. [Server Architecture](#server-architecture)
2. [Database Configuration](#database-configuration)
3. [Authentication System](#authentication-system)
4. [Frontend Architecture](#frontend-architecture)
5. [API Routes](#api-routes)
6. [Socket.io Chat System](#socketio-chat-system)

---

## Server Architecture

### server/index.ts - Main Server Entry Point

```typescript
// ============================================
// IMPORT DEPENDENCIES
// ============================================

// Import Express.js framework - used to create web server
// Express handles HTTP requests, routing, and responses
import express from 'express';

// Import dotenv - loads environment variables from .env file
// Environment variables contain sensitive data like API keys, database passwords
import dotenv from 'dotenv';

// Import 'http' from Node.js core - needed for creating an HTTP server
import http from 'http';

// Import Socket.io server - enables real-time bidirectional communication
// Used for chat/messaging features, real-time notifications
import { Server as SocketIOServer } from 'socket.io';

// Import cookie-parser middleware - parses HTTP cookies from requests
// Cookies are used to store user authentication tokens
import cookieParser from 'cookie-parser';

// Import static file serving setup function
// In production, serves the built React app from /dist folder
import { setupStaticServing } from './static-serve.js';

// Import authentication routes - handles login, register, profile
import authRouter from './auth.js';

// Import friends routes - handles friend requests, friend lists
import friendsRouter from './friends.js';

// Import chat setup function - initializes Socket.io for messaging
import { setupChat } from './chat.js';

// ============================================
// LOAD ENVIRONMENT VARIABLES
// ============================================

// Load environment variables from .env file into process.env
// Allows code to access variables like process.env.PORT, process.env.JWT_SECRET
dotenv.config();

// ============================================
// CREATE EXPRESS APP AND HTTP SERVER
// ============================================

// Create an Express application instance
// This is the main app object that will handle all HTTP requests
const app = express();

// Create an HTTP server using the Express app
// Socket.io needs an HTTP server to attach to
const server = http.createServer(app);

// Create Socket.io server attached to the HTTP server
// Configuration:
// - cors: Configure which domains can connect to Socket.io
// - origin: Allow connections from the frontend (running on VITE_PORT)
// - credentials: Allow sending cookies with Socket.io connections
const io = new SocketIOServer(server, {
  cors: {
    // Allow frontend at this address to connect via Socket.io
    origin: `http://localhost:${process.env.VITE_PORT || 3000}`,
    // Allow credentials (cookies, auth headers) to be sent
    credentials: true,
  },
});

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Middleware: Parse JSON in request body
// When client sends JSON data (POST/PUT requests), this converts it to JavaScript objects
// Example: {"name": "John"} → {name: "John"} in req.body
app.use(express.json());

// Middleware: Parse URL-encoded form data
// When HTML forms are submitted, this parses the data
// Example: "name=John&age=30" → {name: "John", age: "30"} in req.body
app.use(express.urlencoded({ extended: true }));

// Middleware: Parse cookies from request headers
// Extracts cookies sent by client and adds to req.cookies object
// Example: "Set-Cookie: token=abc123" → req.cookies.token = "abc123"
app.use(cookieParser());

// ============================================
// MOUNT API ROUTES
// ============================================

// Mount authentication routes at /api/auth
// Routes like POST /api/auth/login, POST /api/auth/register are defined here
app.use('/api/auth', authRouter);

// Mount friends routes at /api/friends
// Routes like GET /api/friends, POST /api/friends/add are defined here
app.use('/api/friends', friendsRouter);

// ============================================
// SETUP REAL-TIME CHAT
// ============================================

// Initialize Socket.io event handlers for chat/messaging
// This sets up 'message' events, typing indicators, online status, etc.
setupChat(io);

// ============================================
// SERVER STARTUP FUNCTION
// ============================================

/**
 * Asynchronous function that starts the Express/HTTP server
 * 
 * @param port - The port number the server listens on
 *               Example: 3001 (development), 4000 (production)
 */
export async function startServer(port) {
  try {
    // Check if running in production environment
    // NODE_ENV is set to 'production' when deployed
    if (process.env.NODE_ENV === 'production') {
      // In production, setup static file serving
      // This serves the built React app (in /dist folder) from the Express server
      // When user visits /, it serves index.html and all React code
      setupStaticServing(app);
    }

    // Start the HTTP server and listen for incoming requests
    // The server will accept connections on the specified port
    // If port is 3001, server listens at http://localhost:3001
    server.listen(port, () => {
      // Once server is running, log a message to console
      // This confirms the server started successfully
      console.log(`API Server running on port ${port}`);
    });
  } catch (err) {
    // If there's an error starting the server, catch and log it
    // Errors might include: port already in use, permission denied, etc.
    console.error('Failed to start server:', err);

    // Exit the Node.js process with error code (1 = error)
    // 0 = success, 1+ = error
    process.exit(1);
  }
}

// ============================================
// START SERVER
// ============================================

// Check if this script is being run directly (not imported as a module)
// import.meta.url = file path of current file
// process.argv[1] = script being executed
// If they match, this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Print message to indicate server startup is beginning
  console.log('Starting server...');

  // Get port from environment variable or use default 3001
  // process.env.PORT reads from .env file or system environment
  // || 3001 means "if PORT not set, use 3001"
  const port = process.env.PORT || 3001;

  // Call the startServer function with the port
  startServer(port);
}
```

---

## Database Configuration

### server/db.ts - SQLite Database Setup

```typescript
// ============================================
// IMPORTS
// ============================================

// Import Kysely - SQL query builder that helps write database queries safely
// Provides type safety and prevents SQL injection attacks
import { Kysely, SqliteDialect } from 'kysely';

// Import better-sqlite3 - driver that connects Node.js to SQLite databases
// SQLite is a file-based database (stored in a single .sqlite file)
import Database from 'better-sqlite3';

// Import database type definitions
// Defines what tables exist and what columns are in each table
// Provides TypeScript autocomplete when writing queries
import type { DB } from './db-types.js';

// Import path utilities - for working with file paths across different operating systems
import path from 'path';

// Import fs (filesystem) utilities - for checking and creating directories
import fs from 'fs';

// ============================================
// DATABASE DIRECTORY SETUP
// ============================================

// Get the data directory from environment variable or use default
// process.env.DATA_DIRECTORY comes from .env file
// || fallback: 'data' folder in current directory (usually /home/app/data)
const dataDir = process.env.DATA_DIRECTORY || path.join(process.cwd(), 'data');

// Check if the data directory exists
// fs.existsSync() returns true if path exists, false otherwise
if (!fs.existsSync(dataDir)) {
  // If directory doesn't exist, create it
  // { recursive: true } means: create parent directories if needed
  // Example: creates /data and /data/subdir if needed
  fs.mkdirSync(dataDir, { recursive: true });
}

// ============================================
// DATABASE FILE PATH
// ============================================

// Create full path to the SQLite database file
// path.join() combines path segments in OS-appropriate way
// Example: /home/app/data + database.sqlite → /home/app/data/database.sqlite
const dbPath = path.join(dataDir, 'database.sqlite');

// ============================================
// CREATE DATABASE CONNECTION
// ============================================

// Create a connection to the SQLite database
// If file doesn't exist, better-sqlite3 creates it automatically
// This 'sqliteDb' object is the low-level database connection
const sqliteDb = new Database(dbPath);

// ============================================
// CREATE KYSELY INSTANCE
// ============================================

// Create a Kysely instance - this is the query builder we use in code
// Kysely provides safe, type-checked SQL query methods
//
// new Kysely<DB>() - <DB> is the TypeScript type for all tables
//   This enables autocomplete and type checking when writing queries
//
// dialect: SqliteDialect - tells Kysely to use SQLite syntax
//   Different databases (MySQL, PostgreSQL) use different SQL syntax
//   Kysely translates to the appropriate syntax
//
// log: ['query', 'error'] - enable logging
//   'query': Log every SQL query executed (useful for debugging)
//   'error': Log database errors (useful for troubleshooting)
export const db = new Kysely<DB>({
  dialect: new SqliteDialect({
    database: sqliteDb,  // Pass the SQLite connection
  }),
  log: ['query', 'error'],  // Enable query and error logging
});
```

### server/db-types.ts - Database Schema Types

```typescript
// ============================================
// DATABASE TYPE DEFINITIONS
// ============================================

// This file defines all tables in the database and their columns
// Provides TypeScript type checking when writing queries
// Enables IDE autocomplete when accessing columns

// Type definition for the 'users' table
export type User = {
  // Auto-incrementing primary key - unique identifier for each user
  id: number;

  // Username - unique identifier for login, like email
  username: string;

  // Email address - can be used for login and notifications
  email: string;

  // Hashed password - never store plain passwords!
  // Hash is created with bcrypt, irreversible for security
  password_hash: string;

  // URL/path to user's profile picture
  // Can be null if user hasn't uploaded a picture
  profile_picture: string | null;

  // User's bio/description
  // Can be null if user hasn't filled it in
  bio: string | null;

  // Timestamp when user account was created
  // Example: 2024-01-15 10:30:00
  created_at: Date;

  // Timestamp when user info was last updated
  // Automatically updated whenever user profile changes
  updated_at: Date;
};

// Type definition for the 'friends' table
export type Friendship = {
  // Auto-incrementing primary key
  id: number;

  // ID of user who initiated the friend request
  user_id: number;

  // ID of user being added as friend
  friend_id: number;

  // Status of friendship
  // Options: 'pending' (awaiting response), 'accepted' (friends), 'blocked'
  status: string;

  // When this friendship was created
  created_at: Date;
};

// Type definition for the 'messages' table
export type Message = {
  // Auto-incrementing primary key
  id: number;

  // User ID of who sent the message
  sender_id: number;

  // User ID of who receives the message
  receiver_id: number;

  // The message content/text
  content: string;

  // When message was created
  created_at: Date;
};

// Type definition for the 'products' table
export type Product = {
  // Auto-incrementing primary key
  id: number;

  // User ID of who is selling the product
  user_id: number;

  // Product name/title
  title: string;

  // Product description - what it is, condition, etc.
  description: string | null;

  // Price in dollars/currency
  // DECIMAL(10,2) allows up to 99999999.99
  price: number | null;

  // URL/path to product image
  image_url: string | null;

  // When product was listed
  created_at: Date;

  // When product info was last updated
  updated_at: Date;
};

// Type definition for the main database schema
// Lists all tables in the database
// Used by Kysely for type checking
export interface DB {
  // users table - stores all user accounts
  users: User;

  // friends table - stores friendship relationships
  friendships: Friendship;

  // messages table - stores direct messages between users
  messages: Message;

  // products table - stores product listings
  products: Product;
}
```

---

## Authentication System

### server/auth.ts - Authentication Routes

```typescript
// ============================================
// IMPORTS
// ============================================

// Import Express router - for defining HTTP routes
import { Router } from 'express';

// Import bcryptjs - for hashing passwords securely
// bcryptjs ensures passwords are never stored as plain text
import bcrypt from 'bcryptjs';

// Import jsonwebtoken - for creating and validating authentication tokens
// Tokens allow users to stay logged in without entering password every time
import jwt from 'jsonwebtoken';

// Import database connection
// Allows queries to users table
import { db } from './db.js';

// Import authentication middleware
// Middleware checks if request has valid JWT token
// Can be used to protect routes that require login
import { authMiddleware } from './auth-middleware.js';

// ============================================
// CREATE ROUTER
// ============================================

// Create a new Express router
// Routes defined here will be mounted at /api/auth in index.ts
const router = Router();

// ============================================
// REGISTER ROUTE
// ============================================

/**
 * POST /api/auth/register
 * 
 * Creates a new user account
 * 
 * Request body:
 * {
 *   "username": "johndoe",
 *   "email": "john@example.com",
 *   "password": "securePassword123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "user": {
 *     "id": 1,
 *     "username": "johndoe",
 *     "email": "john@example.com"
 *   }
 * }
 */
router.post('/register', async (req, res) => {
  try {
    // Extract username, email, password from request body
    // req.body contains data sent by client
    const { username, email, password } = req.body;

    // Validate that all required fields are provided
    if (!username || !email || !password) {
      // Return error response with 400 status (Bad Request)
      res.status(400).json({ error: 'Missing required fields' });
      return;  // Exit early, don't continue
    }

    // Check if username already exists in database
    const existingUser = await db
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)  // WHERE username = ?
      .executeTakeFirst();  // Get first result or null

    // If username already taken, return error
    if (existingUser) {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    // Hash the password using bcryptjs
    // bcryptjs.hash(password, saltRounds) creates irreversible hash
    // saltRounds = 10 is industry standard (higher = more secure but slower)
    // Example: "password123" → "$2a$10$xyz123abc..."
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert new user into database
    const user = await db
      .insertInto('users')
      .values({
        username,
        email,
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returningAll()  // Return the inserted record
      .executeTakeFirst();  // Execute query and get first result

    // Return success response with created user
    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    // If any error occurs, log it and return error response
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ============================================
// LOGIN ROUTE
// ============================================

/**
 * POST /api/auth/login
 * 
 * Authenticates user and creates session token
 * 
 * Request body:
 * {
 *   "username": "johndoe",
 *   "password": "securePassword123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "user": { "id": 1, "username": "johndoe" },
 *   "token": "eyJhbGciOiJIUzI1NiIs..."
 * }
 * 
 * Token is also set as HTTP-only cookie for security
 */
router.post('/login', async (req, res) => {
  try {
    // Extract username and password from request
    const { username, password } = req.body;

    // Validate inputs
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }

    // Query database for user with this username
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirst();

    // If user doesn't exist, return error
    // (Don't reveal whether username or password is wrong for security)
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Compare provided password with stored hash
    // bcryptjs.compare(plaintext, hash) returns true if they match
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    // If password doesn't match, return error
    if (!passwordMatches) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Create JWT token
    // Token contains user ID and username
    // token.verify(token, secret) is used to verify token later
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET || 'secret',  // Secret key for signing
      {
        expiresIn: '7d',  // Token valid for 7 days
      }
    );

    // Set token as HTTP-only cookie
    // httpOnly: true = prevent JavaScript from accessing cookie (security)
    // secure: true = only send cookie over HTTPS (production)
    // maxAge: 7 days = when cookie expires
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
    });

    // Return success response
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================
// GET PROFILE ROUTE (Protected)
// ============================================

/**
 * GET /api/auth/profile
 * 
 * Returns the logged-in user's profile
 * Requires valid JWT token
 * 
 * Response:
 * {
 *   "user": {
 *     "id": 1,
 *     "username": "johndoe",
 *     "email": "john@example.com",
 *     "profile_picture": "url",
 *     "bio": "My bio"
 *   }
 * }
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // authMiddleware has already verified the token and added userId to req
    // req.userId was set by authMiddleware after validating token
    const userId = req.userId;

    // Query for the user
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', userId)
      .executeTakeFirst();

    // If user not found (shouldn't happen if token is valid)
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Return user profile (never include password hash!)
    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
        bio: user.bio,
      },
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Export router to be used in index.ts
export default router;
```

### server/auth-middleware.ts - JWT Validation

```typescript
// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

// This middleware is called on protected routes
// It verifies the user has a valid JWT token
// If valid, it allows request to continue
// If invalid, it returns 401 Unauthorized

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to verify JWT token
 * 
 * Used on routes that require authentication:
 * router.get('/profile', authMiddleware, (req, res) => { ... })
 * 
 * Flow:
 * 1. Extract token from cookies or Authorization header
 * 2. Verify token with JWT_SECRET
 * 3. If valid, add userId to req and call next()
 * 4. If invalid, return 401 error
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Try to get token from HTTP cookie
    // Cookies are sent with every request automatically by browser
    const token = req.cookies.token;

    // If no token found in cookies, return error
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;  // Stop execution, don't call next()
    }

    // Verify the token using JWT secret
    // jwt.verify throws error if token is invalid or expired
    // If valid, returns the decoded payload (userId, username, etc)
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    );

    // Add userId to request object
    // This allows the route handler to access userId: req.userId
    req.userId = decoded.userId;

    // Call next() to continue to the next middleware/route handler
    // Without this, the request would be stuck and hang
    next();
  } catch (err) {
    // If token is invalid, expired, or verification fails
    console.error('Token verification failed:', err);

    // Return 401 Unauthorized error
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
}
```

---

## Frontend Architecture

### client/src/App.tsx - Main React Component

```typescript
// ============================================
// IMPORTS
// ============================================

// Import React - needed for JSX and React hooks
import React, { useState, useEffect } from 'react';

// Import custom authentication hook
// Provides user state and login/logout functions
import { useAuth } from './hooks/useAuth';

// Import UI components from shadcn/ui
import { Button } from './components/ui/button';
import { Dialog } from './components/ui/dialog';

// ============================================
// MAIN APP COMPONENT
// ============================================

/**
 * App Component - Root of the application
 * 
 * Responsible for:
 * 1. Checking if user is logged in
 * 2. Showing login/register modal if not authenticated
 * 3. Showing main app UI if authenticated
 * 4. Managing overall app state
 */
function App() {
  // ============================================
  // HOOKS / STATE
  // ============================================

  // useAuth provides:
  // - user: current logged-in user object (or null if not logged in)
  // - login: function to authenticate user
  // - logout: function to clear user and log out
  // - loading: boolean indicating if auth check is in progress
  const { user, loading } = useAuth();

  // Local state for showing auth modal
  // modalOpen: true = show login/register modal
  // setModalOpen: function to update modalOpen state
  const [modalOpen, setModalOpen] = useState(!user);

  // ============================================
  // EFFECTS
  // ============================================

  // useEffect runs after component renders
  // Dependencies: [user] means run when 'user' changes
  // When user logs in, hide modal. When user logs out, show modal.
  useEffect(() => {
    setModalOpen(!user);
  }, [user]);

  // ============================================
  // RENDER
  // ============================================

  // If auth check is still in progress, show loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // If user not logged in, show auth modal
  if (!user) {
    return (
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <AuthModal onClose={() => setModalOpen(false)} />
      </Dialog>
    );
  }

  // If user is logged in, show main app
  return (
    <div className="app-container">
      <header>
        <h1>Welcome {user.username}</h1>
        <Button onClick={() => logout()}>Logout</Button>
      </header>

      <main>
        {/* Main app content goes here */}
        {/* Each feature component renders here */}
      </main>
    </div>
  );
}

export default App;
```

---

## API Routes

### Complete API Documentation

```
// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

POST /api/auth/register
Purpose: Create new user account
Request Body:
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123"
}
Response: { "success": true, "user": {...} }
Status: 201 Created


POST /api/auth/login
Purpose: Authenticate user and get token
Request Body:
{
  "username": "johndoe",
  "password": "securepass123"
}
Response: { "success": true, "user": {...}, "token": "..." }
Status: 200 OK
Set-Cookie: token=...


POST /api/auth/logout
Purpose: Clear authentication token
Request Headers: Cookie: token=...
Response: { "success": true }
Status: 200 OK


GET /api/auth/profile
Purpose: Get logged-in user's profile
Headers: Cookie: token=... (required)
Response:
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "profile_picture": "...",
    "bio": "..."
  }
}
Status: 200 OK


PUT /api/auth/profile
Purpose: Update user profile
Headers: Cookie: token=... (required)
Request Body:
{
  "bio": "New bio",
  "profile_picture": "url"
}
Response: { "success": true, "user": {...} }
Status: 200 OK


// ============================================
// FRIENDS ENDPOINTS
// ============================================

GET /api/friends
Purpose: Get list of user's friends
Headers: Cookie: token=... (required)
Response: { "friends": [...] }
Status: 200 OK


POST /api/friends/add
Purpose: Send friend request
Headers: Cookie: token=... (required)
Request Body:
{
  "friendId": 2
}
Response: { "success": true, "friendship": {...} }
Status: 201 Created


DELETE /api/friends/:friendId
Purpose: Remove friend or cancel request
Headers: Cookie: token=... (required)
Params: friendId = user id to unfriend
Response: { "success": true }
Status: 200 OK


GET /api/friends/requests
Purpose: Get pending friend requests
Headers: Cookie: token=... (required)
Response: { "requests": [...] }
Status: 200 OK


// ============================================
// ERROR RESPONSES
// ============================================

All errors return JSON with 'error' field:
{
  "error": "Error message describing what went wrong"
}

Status Codes:
- 200 OK: Successful request
- 201 Created: Successful creation
- 400 Bad Request: Invalid data provided
- 401 Unauthorized: Not logged in or invalid token
- 409 Conflict: Resource already exists (e.g., username taken)
- 500 Internal Server Error: Server error, retry later
```

---

## Socket.io Chat System

### server/chat.ts - Real-Time Chat

```typescript
// ============================================
// SOCKET.IO CHAT SETUP
// ============================================

// This module sets up real-time messaging using Socket.io
// Socket.io creates persistent connection between client and server
// Allows bidirectional real-time communication (chat, notifications)

import { Server as SocketIOServer } from 'socket.io';
import { db } from './db.js';

/**
 * Sets up Socket.io event handlers for chat
 * 
 * Socket.io events:
 * - server.on('connection'): New client connects
 * - socket.on('event'): Received message from client
 * - socket.emit('event'): Send message to client
 * - io.emit('event'): Broadcast to all connected clients
 */
export function setupChat(io: SocketIOServer) {
  // Handle new client connection
  // When user opens app, Socket.io automatically connects
  io.on('connection', (socket) => {
    // socket = connection to one client
    // socket.id = unique identifier for this connection

    console.log(`User connected: ${socket.id}`);

    // ============================================
    // MESSAGE EVENT
    // ============================================

    // Listen for 'message' events from client
    socket.on('message', async (data) => {
      try {
        // data = object from client: { to: userId, content: "..." }
        const { to, content, from } = data;

        // Save message to database
        await db
          .insertInto('messages')
          .values({
            sender_id: from,
            receiver_id: to,
            content,
            created_at: new Date(),
          })
          .execute();

        // Find recipient socket and send message
        // io.to(userId) sends to client with that user ID
        io.to(`user_${to}`).emit('message', {
          from,
          content,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error('Message error:', err);
        // Send error back to sender
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ============================================
    // TYPING EVENT
    // ============================================

    // Listen for typing indicator
    socket.on('typing', (data) => {
      const { to, from } = data;

      // Broadcast typing indicator to recipient
      io.to(`user_${to}`).emit('typing', {
        from,
        isTyping: true,
      });
    });

    // ============================================
    // DISCONNECT EVENT
    // ============================================

    // When user closes app or connection drops
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);

      // Broadcast user offline to all users
      io.emit('user_offline', {
        userId: socket.id,
      });
    });
  });
}
```

### client/src/hooks/useAuth.tsx - Authentication Hook

```typescript
// ============================================
// CUSTOM REACT HOOK: useAuth
// ============================================

// This hook encapsulates all authentication logic
// Components can use this hook to access user state and auth functions
// Keeps authentication logic in one place, reusable across app

import { useState, useEffect } from 'react';

/**
 * Custom hook for authentication
 * 
 * Returns:
 * {
 *   user: User object or null,
 *   loading: boolean,
 *   login: function to authenticate,
 *   logout: function to clear auth
 * }
 */
export function useAuth() {
  // State for currently logged-in user
  // user = { id, username, email, ... } or null if not logged in
  const [user, setUser] = useState(null);

  // State for loading indicator
  // loading = true while checking authentication status
  const [loading, setLoading] = useState(true);

  // ============================================
  // CHECK AUTHENTICATION ON MOUNT
  // ============================================

  // useEffect runs once when component first mounts
  // Dependencies: [] (empty) means run only once
  // Checks if user has valid token in storage
  useEffect(() => {
    checkAuth();
  }, []);

  // ============================================
  // FUNCTIONS
  // ============================================

  /**
   * Check if user is currently authenticated
   * Calls /api/auth/profile to verify token is valid
   */
  async function checkAuth() {
    try {
      // Set loading to true - we're checking authentication
      setLoading(true);

      // Fetch user profile from API
      // If token is valid, API returns user data
      // If token is invalid/expired, API returns 401 error
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        // Include cookies in request (contains authentication token)
        credentials: 'include',
      });

      // Check if response status is successful (200-299)
      if (response.ok) {
        // Parse JSON response
        const data = await response.json();
        // Update user state with fetched user data
        setUser(data.user);
      } else {
        // Token is invalid or expired
        // Clear user state (logged out)
        setUser(null);
      }
    } catch (err) {
      // Network error or other issue
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      // Set loading to false - authentication check complete
      setLoading(false);
    }
  }

  /**
   * Authenticate user with username and password
   * 
   * @param username User's username
   * @param password User's password
   * @returns true if login successful, false otherwise
   */
  async function login(username: string, password: string) {
    try {
      // Send login request to server
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        // Tell server response is JSON
        headers: { 'Content-Type': 'application/json' },
        // Send username and password
        body: JSON.stringify({ username, password }),
        // Include cookies in request
        credentials: 'include',
      });

      if (response.ok) {
        // Login successful
        const data = await response.json();
        // Update user state with logged-in user
        setUser(data.user);
        return true;
      } else {
        // Login failed (wrong password, user doesn't exist, etc)
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  }

  /**
   * Clear authentication and log user out
   */
  async function logout() {
    try {
      // Notify server we're logging out
      // Server clears token and any session data
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear user state regardless of API response
      setUser(null);
    }
  }

  // Return object with current auth state and functions
  // Components consume this with: const { user, login } = useAuth();
  return {
    user,
    loading,
    login,
    logout,
  };
}
```

---

## Debugging Tips

### Enable Query Logging

```typescript
// In server/db.ts, queries are logged to console:
log: ['query', 'error']

// This logs:
// 1. Every SQL query executed (useful for optimization)
// 2. All database errors (useful for troubleshooting)

// Example logs:
// query: select "id", "username" from "users" where "id" = 1
// query: insert into "users" ("username", "email") values (?, ?)
```

### Add Console Logs for Debugging

```typescript
// In any function, add logs to see what's happening:

console.log('User attempting login:', username);
console.log('Database query result:', result);
console.log('Response being sent:', responseData);

// This helps identify where errors occur or why data isn't what you expect
```

### Check Network Tab in Browser

1. Open Developer Tools (F12)
2. Go to Network tab
3. Perform action (login, create post, etc)
4. See all HTTP requests and responses
5. Click each request to see:
   - Request headers
   - Request body
   - Response headers
   - Response body

### Check Browser Console

1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for JavaScript errors (red X icon)
4. Custom console.log statements appear here
5. Type commands to test JavaScript code

### Check Server Logs

```bash
# View server console output
npm start

# Shows:
# - All console.log statements
# - All error messages
# - Database queries (if logging enabled)
# - Socket.io connection/disconnection events
```
