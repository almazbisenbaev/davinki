/**
 * DaVinki - Online Image Editor
 * Main entry point that initializes the application
 * 
 * This file orchestrates the startup sequence:
 * 1. Creates the global application state
 * 2. Initializes the user interface and event handlers
 * 3. Sets up the canvas and tool systems
 */

import { initUI } from './app/ui.js';
import { initAppState } from './app/state.js';

window.appState = initAppState();

initUI(window.appState);