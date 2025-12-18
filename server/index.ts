// server/index.ts
import express, { Router } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: `http://localhost:${process.env.VITE_PORT || 3000}`,
    credentials: true,
  },
});

/**
 * sanitizeStringRoute
 */
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

/**
 * DEBUG helper (optional)
 */
function warnIfUrlAndStack(s: string) {
  if (process.env.DEBUG_ROUTE_SANITIZE !== 'true') return;
  if (!s) return;
  const looksLikeUrl = s.includes('://') || s.includes('git.new') || s.startsWith('http');
  if (!looksLikeUrl) return;
  console.error('DEBUG: sanitizing route mount that looks like URL:', s);
  console.error(new Error().stack?.split('\n').slice(2, 8).join('\n'));
}

/**
 * Safer patch helper: call original with the same `this`
 */
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

// Patch app instance methods BEFORE any routers are loaded
['use', 'get', 'post', 'put', 'delete', 'all'].forEach((m) => patchMethodOn(app, m));

// Patch Router prototype methods BEFORE router modules load
const RouterProto = (Router as any)?.prototype;
if (RouterProto) {
  ['use', 'get', 'post', 'put', 'delete', 'all'].forEach((m) => patchMethodOn(RouterProto, m));
}

// Use express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// ADD THIS LINE: Enable file upload handling
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
}));

/**
 * Dynamic-import the modules that may register routes
 */
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

/**
 * Start server
 */
export async function startServer(port: number | string) {
  try {
    if (process.env.NODE_ENV === 'production') {
      const publicPath = resolvePublicPath();
      console.log('Production static path resolved to:', publicPath);

      app.use(express.static(publicPath, { index: false }));

      // ✅ FIXED: regex catch-all instead of "*"
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
