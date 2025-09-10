import { setActiveTool } from './tools.js';
import { createTextInput } from './utils/dom.js';
import { CANVAS, COLORS, ERASER } from './utils/constants.js';

// Global state reference for canvas operations
let appState;

/**
 * Initialize the canvas system with app state and attach event handlers
 * This sets up the main drawing canvas and connects it to the app state
 */
export function initCanvas(state) {
  appState = state;
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  // Store canvas references in app state for global access
  appState.canvas = canvas;
  appState.ctx = ctx;
  attachCanvasEvents();
}

/**
 * Main rendering function - draws all layers and UI elements on the canvas
 * This is called whenever the canvas needs to be redrawn (layer changes, selection, etc.)
 */
export function render() {
  const { canvas, ctx, layers } = appState;
  // Clear the entire canvas for fresh rendering
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw each visible layer (reverse order so first layers are on top)
  // This creates proper z-ordering where later layers in array appear above earlier ones
  layers.slice().reverse().forEach(layer => {
    if (!layer.visible || !layer.isLoaded) return;

    if (layer.type === 'text') {
      // Text layer rendering with dynamic sizing and editing support
      ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
      ctx.fillStyle = layer.color;
      ctx.textBaseline = 'top'; // Consistent text positioning
      
      // Calculate text dimensions for proper bounding box and interactions
      const textMetrics = ctx.measureText(layer.text);
      layer.width = textMetrics.width;
      layer.height = layer.fontSize * 1.2;
      
      // Only render canvas text when not editing - during editing, show HTML input instead
      if (!layer.isEditing) {
        ctx.fillText(layer.text, layer.x, layer.y);
      }
    } else if (layer.image) {
      // Image layer rendering - draw at layer position with original dimensions
      if (layer.eraserCanvas) {
        // Apply eraser mask using a simpler approach
        // Create a temporary canvas to combine image with eraser mask
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = layer.image.width;
        tempCanvas.height = layer.image.height;
        
        // Draw the original image
        tempCtx.drawImage(layer.image, 0, 0);
        
        // Use the eraser canvas as an alpha mask (destination-in keeps only where mask is opaque)
        tempCtx.globalCompositeOperation = 'destination-in';
        tempCtx.drawImage(layer.eraserCanvas, 0, 0);
        
        // Draw the masked result to the main canvas
        ctx.drawImage(tempCanvas, layer.x, layer.y);
      } else {
        // No eraser applied, draw normally
        ctx.drawImage(layer.image, layer.x, layer.y);
      }
    } else {
      // For empty layers: transparent (no fill) or you can draw checkered bg
      // For now: do nothing (transparent)
    }

    // Draw selection bounding box for the currently selected layer
    if (layer.id === appState.selectedLayerId) {
      ctx.strokeStyle = COLORS.PRIMARY; // Blue selection color
      ctx.lineWidth = 2;
      ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
    }
  });

  // Draw snap guides during drag operations for visual alignment feedback
  if (appState.isDragging && appState.snapGuides) {
    drawSnapGuides();
  }
}

/**
 * Attach all mouse event handlers to the canvas
 * This sets up the interactive behavior for layer manipulation
 */
function attachCanvasEvents() {
  const canvas = appState.canvas;

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('dblclick', onDoubleClick);
}

/**
 * Handle mouse down events - initiates dragging or text tool interactions
 * Converts screen coordinates to canvas coordinates and determines interaction type
 */
/**
 * Handle mouse down events on the canvas
 * Initiates drag operations for move tool or delegates to text tool handler
 * @param {MouseEvent} e - The mouse event containing position data
 */
function onMouseDown(e) {
  // Convert mouse coordinates from viewport space to canvas space
  // This accounts for canvas position, padding, and any CSS transforms
  const rect = appState.canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (appState.activeTool === 'text') {
    // Handle text tool clicks - create new text or edit existing
    handleTextToolClick(mouseX, mouseY);
    return;
  }

  if (appState.activeTool === 'eraser') {
    // Handle eraser tool - start erasing
    handleEraserStart(mouseX, mouseY);
    return;
  }

  // Only handle drag operations for move tool
  if (appState.activeTool !== 'move') return;

  const selectedLayer = appState.getSelectedLayer();
  if (!selectedLayer) return;

  // Perform hit testing: check if mouse click is within the selected layer's bounding box
  // This determines whether we should start a drag operation
  if (
    mouseX >= selectedLayer.x &&
    mouseX <= selectedLayer.x + selectedLayer.width &&
    mouseY >= selectedLayer.y &&
    mouseY <= selectedLayer.y + selectedLayer.height
  ) {
    // Save state before starting drag operation for undo functionality
    appState.saveStateToHistory('Move layer');
    
    appState.isDragging = true;
    appState.dragStart = { x: mouseX, y: mouseY };
    
    appState.dragLayerOffset = {
      x: mouseX - selectedLayer.x,
      y: mouseY - selectedLayer.y
    };
    
    appState.canvas.style.cursor = 'grabbing';
  }
}

/**
 * Handle mouse move events during drag operations
 * Updates layer position with snapping and triggers re-render
 */
function onMouseMove(e) {
  const rect = appState.canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Handle eraser tool drawing
  if (appState.isErasing) {
    handleEraserDraw(mouseX, mouseY);
    return;
  }

  if (!appState.isDragging) return;

  const selectedLayer = appState.getSelectedLayer();
  if (!selectedLayer) return;

  // Calculate new position based on mouse movement and initial drag offset
  let newX = mouseX - appState.dragLayerOffset.x;
  let newY = mouseY - appState.dragLayerOffset.y;

  // Apply intelligent snapping to canvas edges and other layers
  const snappedPosition = getSnappedPosition(newX, newY, selectedLayer);
  selectedLayer.x = snappedPosition.x;
  selectedLayer.y = snappedPosition.y;

  // Re-render canvas to show updated position and snap guides
  render();
}

// Use centralized snap threshold from constants
const SNAP_THRESHOLD = CANVAS.SNAP_THRESHOLD;

/**
 * Calculate snapped position for a layer being dragged
 * Implements intelligent snapping to canvas edges, center, and other layers
 * This function provides visual feedback through snap guides and ensures precise alignment
 * @param {number} x - Proposed X position of the layer
 * @param {number} y - Proposed Y position of the layer
 * @param {Object} currentLayer - The layer being moved (to exclude from snapping calculations)
 * @returns {Object} Object with snapped x, y coordinates
 */
function getSnappedPosition(x, y, currentLayer) {
  let snappedX = x;
  let snappedY = y;
  // Store guide lines for visual feedback during drag operations
  let snapGuides = { vertical: [], horizontal: [] };
  
  const canvas = appState.canvas;
  // Get all other visible and loaded layers for snapping calculations
  // Exclude the current layer to prevent self-snapping
  const otherLayers = appState.layers.filter(layer => 
    layer.id !== currentLayer.id && layer.visible && layer.isLoaded
  );
  
  // Define canvas edge and center snap points for precise alignment
  // These provide common alignment points that designers frequently use
  const canvasSnapPoints = {
    x: [
      0, // left edge alignment
      canvas.width / 2 - currentLayer.width / 2, // horizontal center alignment
      canvas.width - currentLayer.width // right edge alignment (accounts for layer width)
    ],
    y: [
      0, // top edge alignment
      canvas.height / 2 - currentLayer.height / 2, // vertical center
      canvas.height - currentLayer.height // bottom edge alignment
    ]
  };
  
  // Check canvas snapping
  for (const snapX of canvasSnapPoints.x) {
    if (Math.abs(x - snapX) <= SNAP_THRESHOLD) {
      snappedX = snapX;
      // Add vertical guide line
      if (snapX === 0) {
        snapGuides.vertical.push({ x: 0, type: 'canvas-left' });
      } else if (snapX === canvas.width / 2 - currentLayer.width / 2) {
        snapGuides.vertical.push({ x: canvas.width / 2, type: 'canvas-center' });
      } else {
        snapGuides.vertical.push({ x: canvas.width, type: 'canvas-right' });
      }
      break;
    }
  }
  
  for (const snapY of canvasSnapPoints.y) {
    if (Math.abs(y - snapY) <= SNAP_THRESHOLD) {
      snappedY = snapY;
      // Add horizontal guide line
      if (snapY === 0) {
        snapGuides.horizontal.push({ y: 0, type: 'canvas-top' });
      } else if (snapY === canvas.height / 2 - currentLayer.height / 2) {
        snapGuides.horizontal.push({ y: canvas.height / 2, type: 'canvas-center' });
      } else {
        snapGuides.horizontal.push({ y: canvas.height, type: 'canvas-bottom' });
      }
      break;
    }
  }
  
  // Check snapping to other layers - enables precise alignment between elements
  for (const layer of otherLayers) {
    // Calculate snap points for X axis alignment
    // These allow the current layer to align with edges or center of other layers
    const layerSnapPointsX = [
      layer.x, // align left edges
      layer.x + layer.width / 2 - currentLayer.width / 2, // align horizontal centers
      layer.x + layer.width - currentLayer.width // align right edges
    ];
    
    // Calculate snap points for Y axis alignment
    // These allow the current layer to align with edges or center of other layers
    const layerSnapPointsY = [
      layer.y, // align top edges
      layer.y + layer.height / 2 - currentLayer.height / 2, // align vertical centers
      layer.y + layer.height - currentLayer.height // align bottom edges
    ];
    
    // Check X axis snapping within threshold distance
    for (let i = 0; i < layerSnapPointsX.length; i++) {
      const snapX = layerSnapPointsX[i];
      if (Math.abs(x - snapX) <= SNAP_THRESHOLD) {
        snappedX = snapX;
        // Create visual guide line at the snap position
        if (i === 0) {
          snapGuides.vertical.push({ x: layer.x, type: 'layer-left' });
        } else if (i === 1) {
          snapGuides.vertical.push({ x: layer.x + layer.width / 2, type: 'layer-center' });
        } else {
          snapGuides.vertical.push({ x: layer.x + layer.width, type: 'layer-right' });
        }
        break; // Stop at first snap to prevent multiple snaps on same axis
      }
    }
    
    // Check Y axis snapping within threshold distance
    for (let i = 0; i < layerSnapPointsY.length; i++) {
      const snapY = layerSnapPointsY[i];
      if (Math.abs(y - snapY) <= SNAP_THRESHOLD) {
        snappedY = snapY;
        // Create visual guide line at the snap position
        if (i === 0) {
          snapGuides.horizontal.push({ y: layer.y, type: 'layer-top' });
        } else if (i === 1) {
          snapGuides.horizontal.push({ y: layer.y + layer.height / 2, type: 'layer-center' });
        } else {
          snapGuides.horizontal.push({ y: layer.y + layer.height, type: 'layer-bottom' });
        }
        break; // Stop at first snap to prevent multiple snaps on same axis
      }
    }
  }
  
  // Store snap guides in app state
  appState.snapGuides = snapGuides;
  
  return { x: snappedX, y: snappedY };
}

/**
 * Draw visual snap guide lines during drag operations
 * Shows pink dashed lines to indicate alignment points
 */
function drawSnapGuides() {
  const { ctx, canvas, snapGuides } = appState;
  
  ctx.save();
  ctx.strokeStyle = '#ff0080'; // Pink color for visibility
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]); // Dashed line pattern
  
  // Draw vertical alignment guides (for horizontal positioning)
  snapGuides.vertical.forEach(guide => {
    ctx.beginPath();
    ctx.moveTo(guide.x, 0);
    ctx.lineTo(guide.x, canvas.height);
    ctx.stroke();
  });
  
  // Draw horizontal alignment guides (for vertical positioning)
  snapGuides.horizontal.forEach(guide => {
    ctx.beginPath();
    ctx.moveTo(0, guide.y);
    ctx.lineTo(canvas.width, guide.y);
    ctx.stroke();
  });
  
  ctx.restore();
}

/**
 * Handle mouse up events - ends drag operations and cleans up UI state
 */
function onMouseUp() {
  // If we were erasing, save the final state for undo functionality
  if (appState.isErasing) {
    appState.isErasing = false;
    // Reset eraser position tracking
    lastEraseX = null;
    lastEraseY = null;
    appState.markAsModified();
    if (window.updateUndoRedoButtons) window.updateUndoRedoButtons();
    return;
  }

  // If we were dragging, save the final state for undo functionality
  if (appState.isDragging) {
    appState.markAsModified();
    if (window.updateUndoRedoButtons) window.updateUndoRedoButtons();
  }
  
  appState.isDragging = false;
  appState.snapGuides = null; // Clear snap guides
  appState.canvas.style.cursor = 'default'; // Reset cursor
}

function onDoubleClick(e) {
  if (appState.activeTool !== 'move') return;

  const rect = appState.canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Check if double-clicking on a text layer
  const clickedTextLayer = appState.layers.find(layer => {
    return layer.type === 'text' && layer.visible &&
           mouseX >= layer.x && mouseX <= layer.x + layer.width &&
           mouseY >= layer.y && mouseY <= layer.y + layer.height;
  });

  if (clickedTextLayer) {
    startTextEditing(clickedTextLayer);
  }
}

/**
 * Handle text tool clicks - either edit existing text or create new text layer
 * Determines interaction based on click position relative to existing text layers
 */
function handleTextToolClick(mouseX, mouseY) {
  // Check if clicking on an existing text layer for editing
  const clickedTextLayer = appState.layers.find(layer => {
    return layer.type === 'text' && layer.visible &&
           mouseX >= layer.x && mouseX <= layer.x + layer.width &&
           mouseY >= layer.y && mouseY <= layer.y + layer.height;
  });

  if (clickedTextLayer) {
    // Start editing existing text layer
    startTextEditing(clickedTextLayer);
  } else {
    // Create new text layer at click position
    const textLayer = appState.addTextLayer('Sample text', mouseX, mouseY);
    startTextEditing(textLayer);
    updateLayersPanel();
    
    // Automatically switch back to Move tool after adding text
    setActiveTool('move');
  }
}

/**
 * Start text editing mode for a specific text layer
 * Creates an overlay input element for direct text editing
 */
function startTextEditing(textLayer) {
  // Ensure only one text layer is being edited at a time
  appState.layers.forEach(layer => {
    if (layer.type === 'text') {
      layer.isEditing = false;
    }
  });

  textLayer.isEditing = true;
  appState.selectedLayerId = textLayer.id;
  
  // Create positioned input overlay for seamless text editing
  const input = createTextInput(textLayer, (newText) => {
    textLayer.text = newText;
  }, render);
  
  // Set up completion handlers for the input
  handleTextInputCompletion(textLayer, input);
  render();
}

/**
 * Handle text input completion and cleanup
 * @param {Object} textLayer - The text layer being edited
 * @param {HTMLElement} input - The input element to clean up
 */
function handleTextInputCompletion(textLayer, input) {
  const finishEditing = () => {
    // Save state after text editing for undo functionality
    appState.saveStateToHistory('Edit text');
    
    textLayer.isEditing = false;
    input.remove();
    render();
    updatePropertiesPanel();
    if (window.updateUndoRedoButtons) window.updateUndoRedoButtons();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      finishEditing();
    }
  });

  input.addEventListener('blur', finishEditing);
}

// UI callback functions - imported from ui.js for updating panels
let updateLayersPanel, updatePropertiesPanel;

/**
 * Set callback functions for updating UI panels
 * This allows canvas operations to trigger UI updates without direct imports
 */
export function setUICallbacks(layersCallback, propertiesCallback) {
  updateLayersPanel = layersCallback;
  updatePropertiesPanel = propertiesCallback;
}

// Store previous mouse position for interpolation
let lastEraseX = null;
let lastEraseY = null;

/**
 * Handle eraser tool start - begins erasing operation
 * @param {number} mouseX - X coordinate of mouse position
 * @param {number} mouseY - Y coordinate of mouse position
 */
function handleEraserStart(mouseX, mouseY) {
  const selectedLayer = appState.getSelectedLayer();
  if (!selectedLayer || !selectedLayer.image) {
    return; // Can only erase on image layers
  }

  // Save state before starting erase operation for undo functionality
  appState.saveStateToHistory('Erase pixels');
  
  appState.isErasing = true;
  
  // Initialize the eraser canvas if it doesn't exist
  if (!selectedLayer.eraserCanvas) {
    initializeEraserCanvas(selectedLayer);
  }
  
  // Store the starting position
  lastEraseX = mouseX;
  lastEraseY = mouseY;
  
  // Start erasing at the initial position
  eraseAtPosition(mouseX, mouseY, selectedLayer);
}

/**
 * Handle eraser tool drawing - continues erasing while mouse moves
 * @param {number} mouseX - X coordinate of mouse position
 * @param {number} mouseY - Y coordinate of mouse position
 */
function handleEraserDraw(mouseX, mouseY) {
  const selectedLayer = appState.getSelectedLayer();
  if (!selectedLayer || !selectedLayer.image || !selectedLayer.eraserCanvas) {
    return;
  }
  
  // Interpolate between last position and current position to avoid gaps
  if (lastEraseX !== null && lastEraseY !== null) {
    const distance = Math.sqrt(Math.pow(mouseX - lastEraseX, 2) + Math.pow(mouseY - lastEraseY, 2));
    const steps = Math.max(1, Math.floor(distance / (appState.eraserBrushSize / 4)));
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const interpX = lastEraseX + (mouseX - lastEraseX) * t;
      const interpY = lastEraseY + (mouseY - lastEraseY) * t;
      eraseAtPosition(interpX, interpY, selectedLayer);
    }
  } else {
    eraseAtPosition(mouseX, mouseY, selectedLayer);
  }
  
  // Update last position
  lastEraseX = mouseX;
  lastEraseY = mouseY;
}

/**
 * Initialize eraser canvas for a layer
 * @param {Object} layer - The layer to initialize eraser canvas for
 */
function initializeEraserCanvas(layer) {
  const eraserCanvas = document.createElement('canvas');
  const eraserCtx = eraserCanvas.getContext('2d');
  
  eraserCanvas.width = layer.image.width;
  eraserCanvas.height = layer.image.height;
  
  // Fill with white (fully opaque) - this represents non-erased areas
  eraserCtx.fillStyle = 'white';
  eraserCtx.fillRect(0, 0, eraserCanvas.width, eraserCanvas.height);
  
  layer.eraserCanvas = eraserCanvas;
  layer.eraserCtx = eraserCtx;
}

/**
 * Erase pixels at the specified position on the given layer
 * @param {number} mouseX - X coordinate of mouse position
 * @param {number} mouseY - Y coordinate of mouse position
 * @param {Object} layer - The layer to erase on
 */
function eraseAtPosition(mouseX, mouseY, layer) {
  // Calculate the position relative to the layer
  const layerX = mouseX - layer.x;
  const layerY = mouseY - layer.y;
  
  // Check if the position is within the layer bounds
  if (layerX < 0 || layerY < 0 || layerX >= layer.image.width || layerY >= layer.image.height) {
    return;
  }
  
  // Set up eraser brush (square shape)
  const brushSize = appState.eraserBrushSize;
  const halfBrush = Math.floor(brushSize / 2);
  
  // Draw transparent square on eraser canvas (represents erased area)
  // Use destination-out to punch holes in the white canvas
  layer.eraserCtx.globalCompositeOperation = 'destination-out';
  layer.eraserCtx.fillStyle = 'rgba(0, 0, 0, 1)';
  layer.eraserCtx.fillRect(
    layerX - halfBrush,
    layerY - halfBrush,
    brushSize,
    brushSize
  );
  // Reset composite operation
  layer.eraserCtx.globalCompositeOperation = 'source-over';
  
  // Re-render the canvas to show the changes
  render();
}