
// Import Router from Express to create modular route handlers
// Routes are organized in separate files for better code organization
import { Router } from 'express';
// Import bcryptjs for password hashing and verification
// Passwords are never stored in plain text for security
import bcrypt from 'bcryptjs';
// Import jsonwebtoken (JWT) for creating secure authentication tokens
// JWT tokens allow stateless authentication without storing sessions
import jwt from 'jsonwebtoken';
// Import database instance for querying SQLite database
// Uses Kysely query builder for type-safe database queries
import { db } from './db.js';
// Import helper function from Kysely for JSON object queries
import { jsonObjectFrom } from 'kysely/helpers/sqlite';

// Create a new Express router instance for authentication endpoints
// This router will be mounted at /api/auth in the main server
const router = Router();

// JWT secret key for signing and verifying tokens
// Should be stored in .env file and be at least 32 characters long
// If not set, uses default (not recommended for production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

// POST /api/auth/signup - Create a new user account
// Accepts username, password, email, and phone number
// Returns JWT token in httpOnly cookie for secure authentication
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  try {
    // Always add 'u' prefix
    const prefixedUsername = 'u' + username;
    
    console.log(`[SIGNUP] User attempting to sign up with: "${username}"`);
    console.log(`[SIGNUP] Will be stored as: "${prefixedUsername}"`);

    // Check if either the unprefixed OR prefixed username already exists
    const existingUser = await db
  .selectFrom('users')
  .where((eb) => eb.or([
    eb('username', '=', finalUsername),
    eb('email', '=', email),
    eb('phone_number', '=', phoneNumber)
  ]))
  .selectAll()
  .executeTakeFirst();

    if (existingUser) {
      console.log(`[SIGNUP] COLLISION: Username already taken (checked both "${username}" and "${prefixedUsername}")`);
      res.status(400).json({ error: 'Username already taken' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    await db
      .insertInto('users')
      .values({
        username: prefixedUsername,
        password: hashedPassword,
      })
      .execute();

    console.log(`[SIGNUP] SUCCESS: User "${prefixedUsername}" created`);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('[SIGNUP] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  try {
    console.log(`[LOGIN] User attempting to log in with: "${username}"`);

    // Step 1: Search for the exact username as typed
    let user = await db
      .selectFrom('users')
      .selectAll()
      .where('username', '=', username)
      .executeTakeFirst();

    console.log(`[LOGIN] Step 1 - Search for exact match "${username}": ${user ? 'FOUND' : 'NOT FOUND'}`);

    // Step 2: If not found and doesn't start with 'u', try adding 'u' prefix
    if (!user && !username.startsWith('u')) {
      const prefixedUsername = 'u' + username;
      user = await db
        .selectFrom('users')
        .selectAll()
        .where('username', '=', prefixedUsername)
        .executeTakeFirst();

      console.log(`[LOGIN] Step 2 - Search with 'u' prefix "${prefixedUsername}": ${user ? 'FOUND' : 'NOT FOUND'}`);
    }

    if (!user) {
      console.log(`[LOGIN] FAILED: User not found`);
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log(`[LOGIN] FAILED: Invalid password for user "${user.username}"`);
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    console.log(`[LOGIN] SUCCESS: User "${user.username}" logged in`);

    // Create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d',
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/me', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    res.status(200).json({ id: payload.userId, username: payload.username });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
