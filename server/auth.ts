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
  // Destructure signup data from request body
  const { username, password, email, phoneNumber } = req.body;

  // Validate that all required fields are provided
  // Returns 400 Bad Request if any field is missing
  if (!username || !password || !email || !phoneNumber) {
    res.status(400).json({ message: 'Username, password, email, and phone number are required' });
    return;
  }

  // Automatically prefix username with 'u' if not already prefixed
  // All uminion users start with 'u' (e.g., uJohn, uMary)
  // This ensures consistent username format across the platform
  const finalUsername = username.startsWith('u') ? username : `u${username}`;

  try {
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
        let message = 'An account with that ';
        if (existingUser.username === finalUsername) message += 'username';
        else if (existingUser.email === email) message += 'email';
        else if (existingUser.phone_number === phoneNumber) message += 'phone number';
        message += ' already exists. Please try logging in.';
      res.status(409).json({ message });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db
      .insertInto('users')
      .values({ username: finalUsername, password: hashedPassword, email, phone_number: phoneNumber })
      .returningAll()
      .executeTakeFirst();

    if (!newUser) {
      res.status(500).json({ message: 'Failed to create user' });
      return;
    }

    const token = jwt.sign({ userId: newUser.id, username: newUser.username }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.status(201).json({ id: newUser.id, username: newUser.username });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    const user = await db
      .selectFrom('users')
      .where('username', '=', username)
      .selectAll()
      .executeTakeFirst();

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    res.status(200).json({ id: user.id, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
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
