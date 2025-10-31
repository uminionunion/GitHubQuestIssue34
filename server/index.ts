
// Import the 'express' framework for creating the server.
import express from 'express';
// Import 'dotenv' to load environment variables from a .env file.
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Import the function for setting up static file serving.
import { setupStaticServing } from './static-serve.js';
import authRouter from './auth.js';
import friendsRouter from './friends.js';
import { setupChat } from './chat.js';

// Load environment variables from .env file into process.env.
dotenv.config();

// Create an instance of an Express application.
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: `http://localhost:${process.env.VITE_PORT || 3000}`,
    credentials: true,
  },
});

// Middleware to parse incoming JSON requests.
app.use(express.json());
// Middleware to parse incoming requests with URL-encoded payloads.
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.use('/api/auth', authRouter);
app.use('/api/friends', friendsRouter);

// Setup chat
setupChat(io);

/**
 * An asynchronous function to configure and start the Express server.
 * @param port The port number on which the server will listen.
 */
export async function startServer(port) {
  try {
    // Check if the environment is production.
    if (process.env.NODE_ENV === 'production') {
      // If it is production, set up the server to serve static files (the built React app).
      setupStaticServing(app);
    }
    // Start the server and make it listen for incoming requests on the specified port.
    server.listen(port, () => {
      // Log a message to the console once the server is running.
      console.log(`API Server running on port ${port}`);
    });
  } catch (err) {
    // If there's an error starting the server, log the error.
    console.error('Failed to start server:', err);
    // Exit the process with a failure code.
    process.exit(1);
  }
}

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if this script is being run directly by Node.js.
if (process.argv[1] === __filename) {
  // If so, it means we are not in a test or import environment, so we should start the server.
  console.log('Starting server...');
  // Start the server on the port specified in the environment variables, or default to 3001.
  startServer(process.env.PORT || 4000);
}
