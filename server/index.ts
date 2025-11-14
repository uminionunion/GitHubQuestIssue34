
// Import the 'express' framework for creating the server
// Express is a Node.js web application framework used for building REST APIs
import express from 'express';
// Import 'dotenv' to load environment variables from a .env file
// This allows secure storage of API keys and configuration without hardcoding
import dotenv from 'dotenv';
// Import http module for creating the server that Socket.IO will use
// Socket.IO requires an http server, not just Express
import http from 'http';
// Import Socket.IO Server for real-time bidirectional communication
// Used for chat functionality and live user list updates
import { Server as SocketIOServer } from 'socket.io';
// Import cookie-parser middleware to parse HTTP cookies from requests
// Used for JWT token authentication in cookies
import cookieParser from 'cookie-parser';

// Import the function for setting up static file serving
// In production, this serves the built React frontend from Express
import { setupStaticServing } from './static-serve.js';
// Import authentication router for user login/signup/logout endpoints
import authRouter from './auth.js';
// Import friends router for friend request and relationship management endpoints
import friendsRouter from './friends.js';
// Import chat setup function for Socket.IO event handlers
import { setupChat } from './chat.js';

// Load environment variables from .env file into process.env
// Example: NODE_ENV, PORT, JWT_SECRET, DATABASE_URL, etc.
dotenv.config();

// Create an instance of an Express application
// This is the main application object that handles HTTP requests
const app = express();
// Create an HTTP server from Express to support Socket.IO
// Socket.IO needs a native HTTP server for WebSocket support
const server = http.createServer(app);
// Create Socket.IO server with CORS configuration
// CORS allows frontend to connect to backend for real-time updates
const io = new SocketIOServer(server, {
  // Configure Cross-Origin Resource Sharing (CORS)
  cors: {
    // Allow requests from the Vite frontend dev server (default port 3000)
    origin: `http://localhost:${process.env.VITE_PORT || 3000}`,
    // Allow credentials (cookies/JWT tokens) to be sent with requests
    credentials: true,
  },
});

// Middleware to parse incoming JSON requests
// Converts JSON request bodies into JavaScript objects
app.use(express.json());
// Middleware to parse incoming requests with URL-encoded payloads
// Handles form data submissions
app.use(express.urlencoded({ extended: true }));
// Middleware to parse cookies from request headers
// Makes cookies available as req.cookies object
app.use(cookieParser());

// API Routes - Mount routers for different endpoints
// /api/auth - Handles user authentication (login, signup, logout)
app.use('/api/auth', authRouter);
// /api/friends - Handles friend requests and friend list management
app.use('/api/friends', friendsRouter);

// Initialize Socket.IO chat functionality
// Sets up event handlers for joinRoom, sendMessage, leaveRoom, etc.
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

// Check if this script is being run directly by Node.js.
if (import.meta.url === `file://${process.argv[1]}`) {
  // If so, it means we are not in a test or import environment, so we should start the server.
  console.log('Starting server...');
  // Start the server on the port specified in the environment variables, or default to 3001.
  startServer(process.env.PORT || 3001);
}
