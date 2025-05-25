// --- START OF FILE index.js (NEW VERSION) ---
import App from './App.js';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to. Make sure you have a <div id=\"root\"></div> in your HTML.");
}

// Call a function from App.js to do the rendering
App.renderApp(rootElement);