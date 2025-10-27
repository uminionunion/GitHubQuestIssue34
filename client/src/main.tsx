
// Import the React library.
import * as React from 'react';
// Import the ReactDOM library for rendering React components in the DOM.
import * as ReactDOM from 'react-dom/client';
// Import the main App component.
import App from './App';

// Import the main CSS file for global styles.
import './index.css';

// Force the application to use dark mode by adding the 'dark' class to the root HTML element.
document.documentElement.classList.add('dark');

// Get the root DOM element where the React app will be mounted.
// The '!' at the end is a non-null assertion, telling TypeScript that we are sure this element exists.
const rootElement = document.getElementById('root')!;

// Create a root for the React application.
const root = ReactDOM.createRoot(rootElement);

// Render the App component inside React's StrictMode for highlighting potential problems.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
