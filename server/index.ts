
// Import the 'express' framework for creating the server.
import express from 'express';
// Import 'dotenv' to load environment variables from a .env file.
import dotenv from 'dotenv';
// Import the function for setting up static file serving.
import { setupStaticServing } from './static-serve.js';

// Load environment variables from .env file into process.env.
dotenv.config();

// Create an instance of an Express application.
const app = express();

// Middleware to parse incoming JSON requests.
app.use(express.json());
// Middleware to parse incoming requests with URL-encoded payloads.
app.use(express.urlencoded({ extended: true }));

// Example of a simple API endpoint. It's currently commented out.
// app.get('/api/hello', (req: express.Request, res: express.Response) => {
//   res.json({ message: 'Hello World!' });
// });

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
    app.listen(port, () => {
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
