// server/index.ts
import express, { Router, Request, Response } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

dotenv.config();

// Type extension for authenticated requests
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
      };
    }
  }
}

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? true 
      : `http://localhost:${process.env.VITE_PORT || 3000}`,
    credentials: true,
  },
});

function sanitizeStringRoute(s: unknown): string {
  if (!s || typeof s !== 'string') return String(s ?? '/');
  const t = s.trim();
  if (t.startsWith('http://') || t.startsWith('https://') || t.includes('://')) {
    try {
      return new URL(t).pathname || '/';
    } catch {
      return '/';
    }
  }
  return t || '/';
}

function warnIfUrlAndStack(s: string) {
  if (process.env.DEBUG_ROUTE_SANITIZE !== 'true') return;
  if (!s) return;
  const looksLikeUrl = s.includes('://') || s.includes('git.new') || s.startsWith('http');
  if (!looksLikeUrl) return;
  console.error('DEBUG: sanitizing route mount that looks like URL:', s);
  console.error(new Error().stack?.split('\n').slice(2, 8).join('\n'));
}

function patchMethodOn(target: any, methodName: string) {
  if (!target || typeof target[methodName] !== 'function') return;
  const orig = target[methodName];
  target[methodName] = function (arg1: any, ...rest: any[]) {
    try {
      const shouldDebug = process.env.DEBUG_ROUTE_SANITIZE === 'true';
      if (shouldDebug && typeof arg1 === 'string') {
        console.error(`DEBUG-ROUTE: registering via ${methodName} value=`, arg1);
        console.error(new Error().stack?.split('\n').slice(2, 10).join('\n'));
      }
    } catch (_) {}

    const first = typeof arg1 === 'string'
      ? ((): string => {
          warnIfUrlAndStack(arg1);
          try {
            return sanitizeStringRoute(arg1);
          } catch {
            return '/';
          }
        })()
      : arg1;

    return orig.apply(this, [first, ...rest]);
  };
}

['use', 'get', 'post', 'put', 'delete', 'all'].forEach((m) => patchMethodOn(app, m));

const RouterProto = (Router as any)?.prototype;
if (RouterProto) {
  ['use', 'get', 'post', 'put', 'delete', 'all'].forEach((m) => patchMethodOn(RouterProto, m));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 },
}));

const [{ setupStaticServing }, authMod, friendsMod, { setupChat }, productsMod] = await Promise.all([
  import('./static-serve.js'),
  import('./auth.js'),
  import('./friends.js'),
  import('./chat.js'),
  import('./products.js'),
]);

const authRouter: Router = (authMod && (authMod as any).default) ? (authMod as any).default as Router : (authMod as any) as Router;
const friendsRouter: Router = (friendsMod && (friendsMod as any).default) ? (friendsMod as any).default as Router : (friendsMod as any) as Router;
const productsRouter: Router = (productsMod && (productsMod as any).default) ? (productsMod as any).default as Router : (productsMod as any) as Router;

app.use('/api/auth', authRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/products', productsRouter);

setupChat(io);

function resolvePublicPath(): string {
  const candidates = [
    path.join(process.cwd(), 'dist', 'public'),
    path.join(process.cwd(), 'dist'),
    path.join(process.cwd(), 'public'),
    process.cwd(),
  ];
  for (const p of candidates) {
    try {
      const stat = fs.statSync(p);
      if (stat && stat.isDirectory()) {
        return p;
      }
    } catch {
      // ignore
    }
  }
  return process.cwd();
}

function logRegisteredRoutes() {
  try {
    const router = (app as any)._router;
    if (!router || !router.stack) {
      console.log('No router stack available');
      return;
    }
    console.log('--- Registered routes and middleware ---');
    router.stack.forEach((r: any) => {
      if (r.route && r.route.path) {
        const methods = Object.keys(r.route.methods).join(',').toUpperCase();
        console.log(`${methods} ${r.route.path}`);
      } else if (r.name === 'router' && r.regexp) {
        console.log(`Mounted router regexp: ${r.regexp}`);
      } else {
        console.log('Middleware:', r.name || r.handle?.name || r);
      }
    });
    console.log('----------------------------------------');
  } catch (err) {
    console.error('Route listing failed', err);
  }
}

// Middleware for authentication
const authMiddleware = (req: Request, res: Response, next: Function) => {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-key') as any;
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// NEW: Check if rooms have any messages (for all users, logged in or not)
app.get('/api/chat/rooms-with-messages', async (req: Request, res: Response) => {
  try {
    // Get all rooms that have messages
    const roomsWithMessages = await db
      .selectFrom('messages')
      .select('room')
      .distinct()
      .execute();

    // Extract unique room names and convert to chatroom numbers
    const roomSet = new Set<number>();
    roomsWithMessages.forEach(msg => {
      // Extract chatroom number from room name
      // Format: "SisterUnion001NewEngland-chatroom-1" -> number 1
      const match = msg.room.match(/SisterUnion(\d+)/);
      if (match) {
        const chatroomNum = parseInt(match[1], 10);
        roomSet.add(chatroomNum);
      }
    });

    console.log('[API] Rooms with messages:', Array.from(roomSet));
    res.status(200).json(Array.from(roomSet));
  } catch (error) {
    console.error('[API] Error fetching rooms with messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chat unread status routes (authenticated users only)
app.get('/api/chat/unread-status', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const unreadStatus = await db
      .selectFrom('chatroom_unread_status')
      .where('user_id', '=', req.user.userId)
      .where('has_unread', '=', 1)
      .selectAll()
      .execute();

    res.status(200).json(unreadStatus);
  } catch (error) {
    console.error('[API] Error fetching unread status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chat/mark-as-read', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { chatroomNumber } = req.body;
    
    const sisterUnionNum = String(chatroomNumber).padStart(2, '0');
    const roomName = `SisterUnion${sisterUnionNum}-chatroom-1`;

    await db
      .updateTable('chatroom_unread_status')
      .set({ has_unread: 0 })
      .where('user_id', '=', req.user.userId)
      .where('chatroom_room_name', '=', roomName)
      .execute();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[API] Error marking as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export async function startServer(port: number | string) {
  try {
    if (process.env.NODE_ENV === 'production') {
      const publicPath = resolvePublicPath();
      console.log('Production static path resolved to:', publicPath);

      app.use(express.static(publicPath, { index: false }));
      app.use('/data', express.static(path.join(process.cwd(), 'data')));

      app.get(/.*/, (req, res, next) => {
        if (req.path.startsWith('/api/')) return next();
        const indexFile = path.join(publicPath, 'index.html');
        if (!fs.existsSync(indexFile)) return res.status(404).send('Not Found');
        res.sendFile(indexFile, (err) => {
          if (err) next(err);
        });
      });

      try {
        setupStaticServing(app);
      } catch (err) {
        console.warn('setupStaticServing() threw an error (ignored):', err);
      }
    }

    server.listen(port, () => {
      console.log(`API Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Starting server...');
  startServer(process.env.PORT || 3001);
}
