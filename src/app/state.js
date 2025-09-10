import { render } from './canvas.js';
import { TEXT, ERASER } from './utils/constants.js';

// Global counter for generating unique layer IDs
let nextLayerId = 1;

/**
 * Initialize the application state object with default values and helper methods
 * This creates the central state management system for the entire application
 * @returns {Object} The initialized app state with all properties and methods
 */
export function initAppState() {
  return {
    // Project state management
    isProjectLoaded: false, // Whether a project is currently open
    hasUnsavedChanges: false, // Tracks if project needs saving
    
    // Canvas references - set by initCanvas()
    canvas: null, // HTML canvas element
    ctx: null, // 2D rendering context
    
    // Layer management - core data structure for all visual elements
    layers: [], // Array of layer objects (images, text) in z-order
    selectedLayerId: null, // ID of currently selected layer for operations
    
    // Tool system state
    activeTool: 'move', // Current active tool ('move', 'text', etc.)
    
    // Drag operation state - tracks mouse interactions
    isDragging: false, // Whether user is currently dragging a layer
    dragStart: { x: 0, y: 0 }, // Initial mouse position when drag started
    dragLayerOffset: { x: 0, y: 0 }, // Offset from layer origin to mouse position

    // Eraser tool state
    isErasing: false, // Whether user is currently erasing
    eraserBrushSize: ERASER.DEFAULT_BRUSH_SIZE, // Current eraser brush size

    // Undo/Redo system
    history: [], // Array of state snapshots for undo functionality
    historyIndex: -1, // Current position in history array
    maxHistorySize: 3, // Maximum number of undo states to keep
    lastOperation: null, // Description of the last operation for better UX

    // Helper methods for state management
    
    /**
     * Get the currently selected layer object
     * @returns {Object|undefined} Selected layer or undefined if none selected
     */
    getSelectedLayer() {
      return this.layers.find(l => l.id === this.selectedLayerId);
    },

    /**
     * Mark the project as having unsaved changes
     * Triggers UI updates and prevents accidental data loss
     */
    markAsModified() {
      this.hasUnsavedChanges = true;
    },

    /**
     * Mark the project as saved (no pending changes)
     * Used after successful save operations
     */
    markAsSaved() {
      this.hasUnsavedChanges = false;
    },

    /**
     * Add a new image layer to the project
     * Handles image loading, positioning, and state updates
     * @param {string|null} imageData - Base64 image data, image URL, or null for blank layer
     * @param {number|null} width - Image width in pixels (defaults to canvas width)
     * @param {number|null} height - Image height in pixels (defaults to canvas height)
     * @param {string} name - Display name for the layer
     * @returns {Object} The created layer object
     */
    addLayer(imageData = null, width = null, height = null, name = "Layer") {
      const canvas = this.canvas;
      width = width || canvas.width;
      height = height || canvas.height;

      let img = null;
      if (imageData) {
        // Load provided image data
        img = new Image();
        img.src = imageData;
      } else {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, width, height);
        
        img = new Image();
        img.src = tempCanvas.toDataURL();
      }

      const layer = {
        id: `layer-${nextLayerId++}`, // Unique identifier using global counter
        name: `${name} ${nextLayerId - 1}`, // Human-readable name with number
        x: 0, // Will be updated when image loads
        y: 0,
        width,
        height,
        visible: true, // Layer visibility toggle
        image: img, // Reference to Image object
        isLoaded: false // Prevents rendering until image is ready
      };

      // Handle image loading asynchronously
      img.onload = () => {
        layer.isLoaded = true; // Mark as ready for rendering
        if (imageData) {
          // For uploaded images, use their actual dimensions and center them
          layer.width = img.width;
          layer.height = img.height;
          layer.x = (canvas.width - img.width) / 2;
          layer.y = (canvas.height - img.height) / 2;
        }
        // For white layers, keep the specified width/height and position at 0,0
        render(); // Re-render canvas with new layer
      };
      
      // Handle image loading errors gracefully
      img.onerror = () => {
        console.error("Failed to load image for layer");
        layer.isLoaded = true; // Allow layer to be processed even if image failed
      };

      // Save state before adding layer for undo functionality
      this.saveStateToHistory('Add layer');
      
      this.layers.unshift(layer);
      this.selectedLayerId = layer.id; // Auto-select new layer
      this.markAsModified(); // Track changes for save system
      return layer;
    },

    /**
     * Add a new text layer to the project
     * Creates an editable text element with customizable styling
     * @param {string} text - Initial text content
     * @param {number} x - Horizontal position on canvas
     * @param {number} y - Vertical position on canvas
     * @param {number} fontSize - Font size in pixels
     * @param {string} color - Text color in hex format
     * @returns {Object} The created text layer object
     */
    addTextLayer(text = TEXT.SAMPLE_TEXT, x = 100, y = 100, fontSize = TEXT.DEFAULT_FONT_SIZE, color = "#000000") {
      // Save state before adding text layer for undo functionality
      this.saveStateToHistory('Add text layer');
      
      const layer = {
        id: `layer-${nextLayerId++}`, // Unique identifier using global counter
        name: `Text ${nextLayerId - 1}`, // Human-readable name with number
        type: 'text', // Identifies this as a text layer (vs image layer)
        x,
        y,
        width: 200, // Initial width, will be calculated based on actual text content
        height: fontSize * 1.2, // Initial height based on font size with line spacing
        visible: true, // Layer visibility toggle
        text, // The actual text content to display
        fontSize, // Font size in pixels
        color, // Text color in hex format
        fontFamily: TEXT.DEFAULT_FONT_FAMILY.split(',')[0], // Default font family
        isLoaded: true, // Text layers are immediately ready (no async loading)
        isEditing: false // Whether text is currently being edited in-place
      };

      // Add to beginning of layers array (top of z-order)
      this.layers.unshift(layer);
      this.selectedLayerId = layer.id; // Auto-select new layer
      this.markAsModified(); // Track changes for save system
      return layer;
    },

    /**
     * Save current state to history for undo functionality
     * Creates a deep copy of layers, selected layer state, and canvas dimensions
     * @param {string} operation - Description of the operation being performed
     */
    saveStateToHistory(operation = 'Unknown operation') {
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }

      const stateSnapshot = {
        layers: JSON.parse(JSON.stringify(this.layers.map(layer => ({
          ...layer,
          image: layer.image ? layer.image.src : null // Store image src instead of Image object
        })))),
        selectedLayerId: this.selectedLayerId,
        canvasWidth: this.canvas ? this.canvas.width : 800,
        canvasHeight: this.canvas ? this.canvas.height : 800,
        operation: operation,
        timestamp: Date.now()
      };

      this.history.push(stateSnapshot);
      this.historyIndex = this.history.length - 1;
      this.lastOperation = operation;

      // Limit history size
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
        this.historyIndex--;
      }
    },

    /**
     * Undo the last action by restoring previous state
     * @returns {Object|null} Object with undo info if performed, null if no history available
     */
    undo() {
      if (this.historyIndex > 0) {
        const currentSnapshot = this.history[this.historyIndex];
        this.historyIndex--;
        this.restoreStateFromHistory();
        
        // Update last operation to reflect what we're now at
        const newSnapshot = this.history[this.historyIndex];
        this.lastOperation = newSnapshot ? newSnapshot.operation : null;
        
        return {
          undoneOperation: currentSnapshot.operation,
          currentOperation: this.lastOperation,
          timestamp: currentSnapshot.timestamp
        };
      }
      return null;
    },

    /**
     * Redo the next action by restoring forward state
     * @returns {boolean} True if redo was performed, false if no future history available
     */
    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.restoreStateFromHistory();
        return true;
      }
      return false;
    },

    /**
     * Restore state from history at current index
     * This is a complex operation that reconstructs the entire application state
     * from a serialized snapshot, including recreating Image objects
     */
    restoreStateFromHistory() {
      if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
        const snapshot = this.history[this.historyIndex];
        
        // Restore canvas dimensions if they exist in the snapshot
        // This handles cases where canvas size was changed as part of the operation
        if (this.canvas && snapshot.canvasWidth && snapshot.canvasHeight) {
          this.canvas.width = snapshot.canvasWidth;
          this.canvas.height = snapshot.canvasHeight;
        }
        
        // Restore layers with proper Image object reconstruction
        // This is complex because Image objects can't be serialized directly
        this.layers = snapshot.layers.map(layerData => {
          const layer = { ...layerData };
          
          if (layerData.image && layerData.type !== 'text') {
            // Recreate Image object for image layers from stored src
            // The image needs to be loaded asynchronously
            const img = new Image();
            img.src = layerData.image; // This was stored as base64 or URL
            layer.image = img;
            layer.isLoaded = false; // Mark as loading until onload fires
            
            // Set up async loading handler
            img.onload = () => {
              layer.isLoaded = true;
              render(); // Re-render when image is ready
            };
          } else {
            // Text layers are immediately ready (no async loading required)
            layer.isLoaded = true;
          }
          
          return layer;
        });
        
        // Restore selection state and mark as modified
        this.selectedLayerId = snapshot.selectedLayerId;
        this.markAsModified();
        
        // Update UI components and trigger re-render
        if (window.updateCanvasSize) window.updateCanvasSize();
        render();
      }
    },

    /**
     * Check if undo is available
     * @returns {boolean} True if undo is possible
     */
    canUndo() {
      return this.historyIndex > 0;
    },

    /**
     * Check if redo is available
     * @returns {boolean} True if redo is possible
     */
    canRedo() {
      return this.historyIndex < this.history.length - 1;
    }
  };
}