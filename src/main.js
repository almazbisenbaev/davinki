import { initUI } from './app/ui.js';
import { initAppState } from './app/state.js';

// Initialize global state
window.appState = initAppState();

// Initialize UI and event listeners
initUI(window.appState);