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

  selectedLayer.x = mouseX - appState.dragLayerOffset.x;
  selectedLayer.y = mouseY - appState.dragLayerOffset.y;

  render();
}

function onMouseUp() {
  appState.isDragging = false;
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