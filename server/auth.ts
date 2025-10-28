
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

router.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  try {
    const existingUser = await db
      .selectFrom('users')
      .where('username', '=', username)
      .selectAll()
      .executeTakeFirst();

    if (existingUser) {
      res.status(409).json({ message: 'Username already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db
      .insertInto('users')
      .values({ username, password: hashedPassword })
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
