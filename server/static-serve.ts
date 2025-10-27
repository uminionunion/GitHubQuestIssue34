
// Import the 'path' module from Node.js for working with file and directory paths.
import path from 'path';
// Import the 'express' module.
import express from 'express';

/**
 * Sets up static file serving for the Express app in production.
 * @param app The Express application instance.
 */
export function setupStaticServing(app: express.Application) {
  // Serve static files (like CSS, JS, images) from the 'public' directory.
  // 'process.cwd()' returns the current working directory of the Node.js process.
  app.use(express.static(path.join(process.cwd(), 'public')));

  // This is a catch-all route for any GET request that doesn't match a previous route.
  // It's used to serve the main 'index.html' file for a Single Page Application (SPA).
  app.get('/{*splat}', (req, res, next) => {
    // If the request path starts with '/api/', it's an API call, so we skip this middleware.
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // For any other path, send the 'index.html' file.
    // This allows client-side routing (like React Router) to handle the URL.
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  });
}
