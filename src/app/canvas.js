import { setActiveTool } from './tools.js';

let appState;

export function initCanvas(state) {
  appState = state;
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  appState.canvas = canvas;
  appState.ctx = ctx;
  attachCanvasEvents();
}

export function render() {
  const { canvas, ctx, layers } = appState;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw each visible layer (reverse order so first layers are on top)
  layers.slice().reverse().forEach(layer => {
    if (!layer.visible || !layer.isLoaded) return;

    if (layer.type === 'text') {
      // Render text layer
      ctx.font = `${layer.fontSize}px ${layer.fontFamily}`;
      ctx.fillStyle = layer.color;
      ctx.textBaseline = 'top';
      
      // Calculate text dimensions for proper bounding box
      const textMetrics = ctx.measureText(layer.text);
      layer.width = textMetrics.width;
      layer.height = layer.fontSize * 1.2;
      
      ctx.fillText(layer.text, layer.x, layer.y);
      
      // Show text cursor if editing
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
      ctx.drawImage(layer.image, layer.x, layer.y);
    } else {
      // For empty layers: transparent (no fill) or you can draw checkered bg
      // For now: do nothing (transparent)
    }

    // Draw bounding box if selected
    if (layer.id === appState.selectedLayerId) {
      ctx.strokeStyle = '#0078d7';
      ctx.lineWidth = 2;
      ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
    }
  });

  // Draw snap guides if dragging
  if (appState.isDragging && appState.snapGuides) {
    drawSnapGuides();
  }
}

function attachCanvasEvents() {
  const canvas = appState.canvas;

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('dblclick', onDoubleClick);
}

function onMouseDown(e) {
  const rect = appState.canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  if (appState.activeTool === 'text') {
    // Handle text tool clicks
    handleTextToolClick(mouseX, mouseY);
    return;
  }

  if (appState.activeTool !== 'move') return;

  const selectedLayer = appState.getSelectedLayer();
  if (!selectedLayer) return;

  // Check if mouse is inside layer bounds
  if (
    mouseX >= selectedLayer.x &&
    mouseX <= selectedLayer.x + selectedLayer.width &&
    mouseY >= selectedLayer.y &&
    mouseY <= selectedLayer.y + selectedLayer.height
  ) {
    appState.isDragging = true;
    appState.dragStart = { x: mouseX, y: mouseY };
    appState.dragLayerOffset = {
      x: mouseX - selectedLayer.x,
      y: mouseY - selectedLayer.y
    };
    appState.canvas.style.cursor = 'grabbing';
  }
}

function onMouseMove(e) {
  if (!appState.isDragging) return;

  const rect = appState.canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const selectedLayer = appState.getSelectedLayer();
  if (!selectedLayer) return;

  // Calculate new position
  let newX = mouseX - appState.dragLayerOffset.x;
  let newY = mouseY - appState.dragLayerOffset.y;

  // Apply snapping
  const snappedPosition = getSnappedPosition(newX, newY, selectedLayer);
  selectedLayer.x = snappedPosition.x;
  selectedLayer.y = snappedPosition.y;

  render();
}

// Snapping configuration
const SNAP_THRESHOLD = 10; // pixels

function getSnappedPosition(x, y, currentLayer) {
  let snappedX = x;
  let snappedY = y;
  let snapGuides = { vertical: [], horizontal: [] };
  
  const canvas = appState.canvas;
  const otherLayers = appState.layers.filter(layer => 
    layer.id !== currentLayer.id && layer.visible && layer.isLoaded
  );
  
  // Canvas snap points
  const canvasSnapPoints = {
    x: [
      0, // left edge
      canvas.width / 2 - currentLayer.width / 2, // center
      canvas.width - currentLayer.width // right edge
    ],
    y: [
      0, // top edge
      canvas.height / 2 - currentLayer.height / 2, // center
      canvas.height - currentLayer.height // bottom edge
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

function drawSnapGuides() {
  const { ctx, canvas, snapGuides } = appState;
  
  ctx.save();
  ctx.strokeStyle = '#ff0080';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);
  
  // Draw vertical guides
  snapGuides.vertical.forEach(guide => {
    ctx.beginPath();
    ctx.moveTo(guide.x, 0);
    ctx.lineTo(guide.x, canvas.height);
    ctx.stroke();
  });
  
  // Draw horizontal guides
  snapGuides.horizontal.forEach(guide => {
    ctx.beginPath();
    ctx.moveTo(0, guide.y);
    ctx.lineTo(canvas.width, guide.y);
    ctx.stroke();
  });
  
  ctx.restore();
}

function onMouseUp() {
  appState.isDragging = false;
  appState.snapGuides = null;
  appState.canvas.style.cursor = 'default';
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

function handleTextToolClick(mouseX, mouseY) {
  // Check if clicking on existing text layer
  const clickedTextLayer = appState.layers.find(layer => {
    return layer.type === 'text' && layer.visible &&
           mouseX >= layer.x && mouseX <= layer.x + layer.width &&
           mouseY >= layer.y && mouseY <= layer.y + layer.height;
  });

  if (clickedTextLayer) {
    // Start editing existing text
    startTextEditing(clickedTextLayer);
  } else {
    // Create new text layer
    const textLayer = appState.addTextLayer('Sample text', mouseX, mouseY);
    startTextEditing(textLayer);
    updateLayersPanel();
    
    // Switch back to Move tool after adding text
    setActiveTool('move');
  }
}

function startTextEditing(textLayer) {
  // Stop editing other text layers
  appState.layers.forEach(layer => {
    if (layer.type === 'text') {
      layer.isEditing = false;
    }
  });

  textLayer.isEditing = true;
  appState.selectedLayerId = textLayer.id;
  
  // Create invisible input for text editing
  createTextInput(textLayer);
  render();
}

function createTextInput(textLayer) {
  // Remove existing text input if any
  const existingInput = document.getElementById('textInput');
  if (existingInput) {
    existingInput.remove();
  }

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
  input.style.zIndex = '1000';

  document.body.appendChild(input);
  input.focus();
  input.select();

  // Handle input changes
  input.addEventListener('input', () => {
    textLayer.text = input.value || 'Sample text';
    render();
  });

  // Handle enter key and blur to finish editing
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

// Import updateLayersPanel and updatePropertiesPanel from ui.js
let updateLayersPanel, updatePropertiesPanel;

export function setUICallbacks(layersCallback, propertiesCallback) {
  updateLayersPanel = layersCallback;
  updatePropertiesPanel = propertiesCallback;
}