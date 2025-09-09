/**
 * DOM utility functions for the Davinki application
 * These functions handle common DOM manipulation tasks
 */

/**
 * Show brief visual feedback about what operation was undone
 * @param {string} operation - The operation that was undone
 */
export function showUndoFeedback(operation) {
  // Create or reuse feedback element
  let feedback = document.getElementById('undo-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'undo-feedback';
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #333;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    `;
    document.body.appendChild(feedback);
  }
  
  feedback.textContent = `Undone: ${operation}`;
  feedback.style.opacity = '1';
  
  // Hide after 2 seconds
  setTimeout(() => {
    feedback.style.opacity = '0';
  }, 2000);
}

/**
 * Create an overlay input element for direct text editing
 * Positions the input exactly over the text layer for seamless editing experience
 * @param {Object} textLayer - The text layer object to create input for
 * @param {Function} onInputChange - Callback function when input changes
 * @param {Function} render - Render function to update canvas
 */
export function createTextInput(textLayer, onInputChange, render) {
  // Remove any existing text input to prevent conflicts
  const existingInput = document.getElementById('textInput');
  if (existingInput) {
    existingInput.remove();
  }

  // Create styled input element that matches the text layer appearance
  const input = document.createElement('input');
  input.id = 'textInput';
  input.type = 'text';
  input.value = textLayer.text;
  input.style.position = 'absolute';
  input.style.left = textLayer.x + 'px';
  input.style.top = textLayer.y + 'px';
  input.style.fontSize = textLayer.fontSize + 'px';
  input.style.fontFamily = textLayer.fontFamily;
  input.style.color = textLayer.color;
  input.style.background = 'transparent';
  input.style.border = 'none';
  input.style.outline = 'none';
  input.style.zIndex = '1000'; // Ensure input appears above canvas

  document.body.appendChild(input);
  input.focus();
  input.select(); // Select all text for easy replacement

  // Update text layer content in real-time as user types
  input.addEventListener('input', () => {
    const newText = input.value || 'Sample text';
    if (onInputChange) {
      onInputChange(newText);
    }
    if (render) {
      render(); // Re-render to show updated text
    }
  });

  return input;
}