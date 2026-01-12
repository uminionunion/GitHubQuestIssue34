import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

/**
 * POST /api/auth/signup
 * Create a new user account
 * 
 * Body: {
 *   username: string (will be prefixed with 'u')
 *   password: string
 * }
 * 
 * Response: { message, user: { id, username } }
 * 
 * Automatically assigns admin roles if username matches known admins:
 * - "uAdmin", "uminion", "uminionunion", "uSalem" -> high-high-high admin
 * - (Other high-high admins can be added later)
 */
router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  try {
    const prefixedUsername = 'u' + username;
    
    console.log(`[SIGNUP] User attempting to sign up with: "${username}"`);
    console.log(`[SIGNUP] Will be stored as: "${prefixedUsername}"`);

    // Check if either the unprefixed OR prefixed username already exists
    const existingUser = await db
      .selectFrom('users')
      .select('id')
      .where((eb) => eb.or([
        eb('username', '=', username),
        eb('username', '=', prefixedUsername)
      ]))
      .executeTakeFirst();

    if (existingUser) {
      console.log(`[SIGNUP] COLLISION: Username already taken (checked both "${username}" and "${prefixedUsername}")`);
      res.status(400).json({ error: 'Username already taken' });
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine admin roles
    const highHighHighAdmins = ['uAdmin', 'uminion', 'uminionunion', 'uSalem'];
    const highHighAdmins = ['uStorytellingSalem'];
    // Add more special user assignments here later as needed
    
    const isHighHighHighAdmin = highHighHighAdmins.includes(prefixedUsername) ? 1 : 0;
    const isHighHighAdmin = highHighAdmins.includes(prefixedUsername) ? 1 : 0;

    // Create the user with all role fields
    await db
      .insertInto('users')
      .values({
        username: prefixedUsername,
        password: hashedPassword,
        is_high_high_high_admin: isHighHighHighAdmin,
        is_high_admin: 0,  // Only assign via database/admin panel
        is_high_high_admin: isHighHighAdmin,
        is_special_user: 0,
        is_special_special_user: 0,
        is_special_special_special_user: 0,
        is_blocked: 0,
        is_banned_from_chatrooms: 0
      })
      .execute();

    console.log(`[SIGNUP] SUCCESS: User "${prefixedUsername}" created`);
    console.log(`[SIGNUP] Roles - HighHighHigh: ${isHighHighHighAdmin}, HighHigh: ${isHighHighAdmin}`);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('[SIGNUP] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 * 
 * Body: {
 *   username: string (can be with or without 'u' prefix)
 *   password: string
 * }
 * 
 * Response: { id, username, is_high_high_high_admin, is_high_admin, etc. }
 * Sets httpOnly cookie with JWT token
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }

  try {
    console.log(`[LOGIN] User attempting to log in with: "${username}"`);

    // Step 1: Search for exact username as typed
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

    // Check if user is banned from chatrooms
    if (user.is_banned_from_chatrooms === 1) {
      console.log(`[LOGIN] BLOCKED: User "${user.username}" is banned from chatrooms`);
      res.status(403).json({ error: 'Your account has been banned from chatrooms' });
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
    console.log(`[LOGIN] Admin roles - HighHighHigh: ${user.is_high_high_high_admin}, HighHigh: ${user.is_high_high_admin}`);

    // Create JWT token
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict' 
    });
    
    // IMPORTANT: Return admin fields so frontend knows user is admin
    res.status(200).json({ 
      id: user.id, 
      username: user.username,
      is_high_high_high_admin: user.is_high_high_high_admin || 0,
      is_high_high_admin: user.is_high_high_admin || 0,
      is_high_admin: user.is_high_admin || 0,
      is_special_user: user.is_special_user,
      is_special_special_user: user.is_special_special_user,
      is_special_special_special_user: user.is_special_special_special_user,
      is_blocked: user.is_blocked,
      is_banned_from_chatrooms: user.is_banned_from_chatrooms
    });
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Clear authentication token
 * 
 * Response: { message }
 */
router.post('/logout', (req, res) => {
  res.cookie('token', '', { 
    expires: new Date(0), 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict' 
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Get current authenticated user info
 * Returns admin status from database
 * 
 * Response: { id, username, is_high_high_high_admin, is_high_high_admin, is_high_admin }
 */
router.get('/me', async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    
    // Fetch fresh user data from database to get admin status
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', payload.userId)
      .executeTakeFirst();

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // IMPORTANT: Return admin fields
    res.status(200).json({ 
      id: user.id, 
      username: user.username,
      is_high_high_high_admin: user.is_high_high_high_admin || 0,
      is_high_high_admin: user.is_high_high_admin || 0,
      is_high_admin: user.is_high_admin || 0,
      is_special_user: user.is_special_user,
      is_special_special_user: user.is_special_special_user,
      is_special_special_special_user: user.is_special_special_special_user,
      is_blocked: user.is_blocked,
      is_banned_from_chatrooms: user.is_banned_from_chatrooms
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
