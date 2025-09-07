import { render } from './canvas.js';

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
        // Create a white canvas for new blank layers
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, width, height);
        
        img = new Image();
        img.src = tempCanvas.toDataURL();
      }

      // Create layer object with all necessary properties
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

      // Add to beginning of layers array (top of z-order)
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
    addTextLayer(text = "Sample text", x = 100, y = 100, fontSize = 24, color = "#000000") {
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
        fontFamily: 'Arial', // Default font family
        isLoaded: true, // Text layers are immediately ready (no async loading)
        isEditing: false // Whether text is currently being edited in-place
      };

      // Add to beginning of layers array (top of z-order)
      this.layers.unshift(layer);
      this.selectedLayerId = layer.id; // Auto-select new layer
      this.markAsModified(); // Track changes for save system
      return layer;
    }
  };
}