
// Import the startServer function from the server's entry point.
import { startServer } from '../server/index.js';
// Import the createServer function from Vite to create a development server.
import { createServer } from 'vite';

// Declare a variable to hold the Vite server instance.
let viteServer;

// Define an asynchronous function to start the development environment.
async function startDev() {
  // Start the Express API server first on port 3001.
  await startServer(3001);

  // Then, create the Vite development server using the configuration file.
  const viteServer = await createServer({
    configFile: './vite.config.js',
  });

  // Start listening with the Vite server.
  await viteServer.listen();
  // Log a message to the console indicating that the Vite server is running and on which port.
  console.log(
    `Vite dev server running on port ${viteServer.config.server.port}`,
  );
}

// This section handles graceful shutdowns and restarts when using nodemon for watching file changes.
// It checks if the script was started with a 'watch' command.
if (
  process.env.npm_lifecycle_event &&
  process.env.npm_lifecycle_event.includes('watch')
) {
  // A flag to prevent multiple restart sequences.
  let isRestarting = false;

  // Listen for the 'SIGUSR2' signal, which nodemon sends before restarting.
  process.once('SIGUSR2', async () => {
    // If a restart is already in progress, do nothing.
    if (isRestarting) return;
    // Set the flag to indicate a restart is in progress.
    isRestarting = true;

    // Log that a restart is detected and we are closing the Vite server.
    console.log('Nodemon restart detected, closing Vite server...');
    // If the Vite server instance exists, try to close it.
    if (viteServer) {
      try {
        // Close the Vite server.
        await viteServer.close();
        // Log success message.
        console.log('Vite server closed successfully');
      } catch (err) {
        // Log any errors that occur during closing.
        console.error('Error closing Vite server:', err);
      }
    }

    // Send the 'SIGUSR2' signal back to the process to allow nodemon to complete the restart.
    process.kill(process.pid, 'SIGUSR2');
  });
}

// Call the function to start the development environment.
startDev();
