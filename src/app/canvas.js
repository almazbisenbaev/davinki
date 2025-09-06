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

    if (layer.image) {
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
}

function onMouseDown(e) {
  if (appState.activeTool !== 'move') return;

  const rect = appState.canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

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
    canvas.style.cursor = 'grabbing';
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