/**
 * Tool system for the design application
 * Currently supports 'move' and 'text' tools, with architecture ready for expansion
 * This module manages tool state and provides a clean interface for tool switching
 */

// Global reference to application state
let appState;

/**
 * Initialize the tool system with application state
 * @param {Object} state - The application state object
 */
export function initTools(state) {
  appState = state;
}

/**
 * Set the active tool and update UI to reflect the change
 * This function handles both state management and visual feedback
 * @param {string} toolName - Name of the tool to activate ('move', 'text', etc.)
 */
export function setActiveTool(toolName) {
  appState.activeTool = toolName;

  // Highlight the active tool button in the UI
  document.querySelectorAll('.tool').forEach(el => {
    el.classList.toggle('active', el.dataset.tool === toolName);
  });

  // Dispatch custom event for other components to react to tool changes
  // This allows loose coupling between tool system and other modules
  document.dispatchEvent(new CustomEvent('toolChanged', {
    detail: { tool: toolName }
  }));
}