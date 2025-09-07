import { setActiveTool } from './tools.js';

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
      layer.height = layer.fontSize * 1.2; // Add line height spacing
      
      ctx.fillText(layer.text, layer.x, layer.y);
      
      // Show text cursor if currently editing this layer
      if (layer.isEditing) {
        const cursorX = layer.x + textMetrics.width;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cursorX, layer.y);
        ctx.lineTo(cursorX, layer.y + layer.height);
        ctx.stroke();
      }
    } else if (layer.image) {
      // Image layer rendering - draw at layer position with original dimensions
      ctx.drawImage(layer.image, layer.x, layer.y);
    } else {
      // For empty layers: transparent (no fill) or you can draw checkered bg
      // For now: do nothing (transparent)
    }

    // Draw selection bounding box for the currently selected layer
    if (layer.id === appState.selectedLayerId) {
      ctx.strokeStyle = '#0078d7'; // Blue selection color
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
function onMouseDown(e) {
  const rect = appState.canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (appState.activeTool === 'text') {
    // Handle text tool clicks - create new text or edit existing
    handleTextToolClick(mouseX, mouseY);
    return;
  }

  if (appState.activeTool !== 'move') return;

  const selectedLayer = appState.getSelectedLayer();
  if (!selectedLayer) return;

  // Check if mouse is inside the selected layer's bounds for dragging
  if (
    mouseX >= selectedLayer.x &&
    mouseX <= selectedLayer.x + selectedLayer.width &&
    mouseY >= selectedLayer.y &&
    mouseY <= selectedLayer.y + selectedLayer.height
  ) {
    // Initialize drag operation with current mouse position and layer offset
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
  if (!appState.isDragging) return;

  const rect = appState.canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

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

// Snapping configuration - distance threshold for snap activation
const SNAP_THRESHOLD = 10; // pixels

/**
 * Calculate snapped position for a layer being dragged
 * Implements intelligent snapping to canvas edges, center, and other layers
 * Returns snapped coordinates and generates visual guide lines
 */
function getSnappedPosition(x, y, currentLayer) {
  let snappedX = x;
  let snappedY = y;
  let snapGuides = { vertical: [], horizontal: [] };
  
  const canvas = appState.canvas;
  // Get all other visible layers for snapping calculations
  const otherLayers = appState.layers.filter(layer => 
    layer.id !== currentLayer.id && layer.visible && layer.isLoaded
  );
  
  // Define canvas edge and center snap points for precise alignment
  const canvasSnapPoints = {
    x: [
      0, // left edge alignment
      canvas.width / 2 - currentLayer.width / 2, // horizontal center
      canvas.width - currentLayer.width // right edge alignment
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
  
  // Check snapping to other layers
  for (const layer of otherLayers) {
    // Layer snap points for X axis
    const layerSnapPointsX = [
      layer.x, // left edge
      layer.x + layer.width / 2 - currentLayer.width / 2, // center align
      layer.x + layer.width - currentLayer.width // right edge
    ];
    
    // Layer snap points for Y axis
    const layerSnapPointsY = [
      layer.y, // top edge
      layer.y + layer.height / 2 - currentLayer.height / 2, // center align
      layer.y + layer.height - currentLayer.height // bottom edge
    ];
    
    // Check X snapping
    for (let i = 0; i < layerSnapPointsX.length; i++) {
      const snapX = layerSnapPointsX[i];
      if (Math.abs(x - snapX) <= SNAP_THRESHOLD) {
        snappedX = snapX;
        // Add vertical guide line
        if (i === 0) {
          snapGuides.vertical.push({ x: layer.x, type: 'layer-left' });
        } else if (i === 1) {
          snapGuides.vertical.push({ x: layer.x + layer.width / 2, type: 'layer-center' });
        } else {
          snapGuides.vertical.push({ x: layer.x + layer.width, type: 'layer-right' });
        }
        break;
      }
    }
    
    // Check Y snapping
    for (let i = 0; i < layerSnapPointsY.length; i++) {
      const snapY = layerSnapPointsY[i];
      if (Math.abs(y - snapY) <= SNAP_THRESHOLD) {
        snappedY = snapY;
        // Add horizontal guide line
        if (i === 0) {
          snapGuides.horizontal.push({ y: layer.y, type: 'layer-top' });
        } else if (i === 1) {
          snapGuides.horizontal.push({ y: layer.y + layer.height / 2, type: 'layer-center' });
        } else {
          snapGuides.horizontal.push({ y: layer.y + layer.height, type: 'layer-bottom' });
        }
        break;
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
  createTextInput(textLayer);
  render();
}

/**
 * Create an overlay input element for direct text editing
 * Positions the input exactly over the text layer for seamless editing experience
 */
function createTextInput(textLayer) {
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
    textLayer.text = input.value || 'Sample text';
    render(); // Re-render to show updated text
  });

  // Finish editing on Enter key or when input loses focus
  const finishEditing = () => {
    textLayer.isEditing = false;
    input.remove();
    render();
    updatePropertiesPanel();
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