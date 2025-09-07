import { initCanvas, render, setUICallbacks } from './canvas.js';
import { initTools, setActiveTool } from './tools.js';

// Global reference to application state
let appState;

/**
 * Initialize the entire UI system and connect all components
 * This is the main entry point for setting up the user interface
 * @param {Object} state - The application state object
 */
export function initUI(state) {
  appState = state;
  
  // Initialize all UI subsystems in proper order
  initTools(state); // Set up tool system
  setupWelcomeScreen(); // Project creation/loading interface
  setupToolbar(); // Tool selection buttons
  setupMenu(); // File menu and export functionality
  setupLayerControls(); // Layer management panel
  setupLayerContextMenu(); // Right-click layer operations
  setupBeforeUnload(); // Prevent accidental data loss
  setupCanvasResize(); // Canvas size management
  setupCropTool(); // Image cropping functionality
  setupPropertiesPanel(); // Layer property editing
  
  // Connect canvas operations to UI updates
  setUICallbacks(window.updateLayersPanel, window.updatePropertiesPanel);
}

/**
 * Set up browser beforeunload protection to prevent accidental data loss
 * Shows warning dialog when user tries to leave with unsaved changes
 */
function setupBeforeUnload() {
  window.addEventListener('beforeunload', (e) => {
    if (appState.hasUnsavedChanges) {
      e.preventDefault(); // Required for modern browsers
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return 'You have unsaved changes. Are you sure you want to leave?'; // Legacy browser support
    }
  });
}

/**
 * Update the canvas size display in the UI
 * Shows current canvas dimensions and enables resize functionality when project is loaded
 */
function updateCanvasSize() {
  const canvasSizeElement = document.getElementById('canvasSize');
  if (appState.canvas && appState.isProjectLoaded) {
    // Show actual canvas dimensions with interactive resize option
    canvasSizeElement.textContent = `Canvas: ${appState.canvas.width} × ${appState.canvas.height} px`;
    canvasSizeElement.style.cursor = 'pointer';
    canvasSizeElement.title = 'Click to resize canvas';
  } else {
    // Show placeholder when no project is loaded
    canvasSizeElement.textContent = 'Canvas: 0 × 0 px';
    canvasSizeElement.style.cursor = 'default';
    canvasSizeElement.title = '';
  }
}

/**
 * Set up the welcome screen with project creation options
 * Handles both blank canvas creation and image upload workflows
 */
function setupWelcomeScreen() {
  const welcomeModal = document.getElementById('welcomeModal');
  const btnNew = document.getElementById('btnNewProject');
  const btnUpload = document.getElementById('btnUploadImage');

  // Handle new blank project creation
  btnNew.addEventListener('click', () => {
    // Get canvas dimensions from user input with fallback defaults
    const width = parseInt(document.getElementById('canvasWidth').value) || 800;
    const height = parseInt(document.getElementById('canvasHeight').value) || 800;
    
    createNewProject(width, height);
    
    // Hide welcome screen and show main application
    welcomeModal.style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
  });

  // Handle project creation from uploaded image
  btnUpload.addEventListener('click', () => {
    // Create invisible file input for image selection
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // Only allow image files
    
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;

      // Read the selected image file
      const reader = new FileReader();
      reader.onload = event => {
        // Extract filename without extension for meaningful layer name
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        const layerName = fileName || "Image";
        
        createNewProjectFromImage(event.target.result, layerName);
        
        // Hide welcome screen and show main application
        welcomeModal.style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
      };
      reader.readAsDataURL(file); // Convert to base64 for canvas use
    };
    
    input.click(); // Trigger file selection dialog
  });
}

/**
 * Create a new blank project with specified dimensions
 * Sets up canvas, adds white background layer, and initializes project state
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 */
function createNewProject(width = 800, height = 800) {
  // Initialize the canvas system with current app state
  initCanvas(appState);
  
  const { canvas } = appState;
  canvas.width = width;
  canvas.height = height;

  // Create a white background layer for the new project
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.fillStyle = '#ffffff'; // White background
  tempCtx.fillRect(0, 0, width, height);

  // Add the background as the first layer
  appState.addLayer(tempCanvas.toDataURL(), width, height, "Background");
  
  // Set project state
  appState.isProjectLoaded = true;
  appState.markAsSaved(); // New project starts as saved (no changes yet)
  
  // Update UI to reflect new project
  updateLayersPanel();
  updateCanvasSize();
  // render() will be called automatically when the layer image loads
}

/**
 * Create a new project from an uploaded image
 * Canvas dimensions are set to match the image size
 * @param {string} imageData - Base64 encoded image data
 * @param {string} layerName - Name for the image layer
 */
function createNewProjectFromImage(imageData, layerName = "Image") {
  const img = new Image();
  
  img.onload = () => {
    // Initialize the canvas system with current app state
    initCanvas(appState);
    
    // Set canvas size to match the uploaded image
    const { canvas } = appState;
    canvas.width = img.width;
    canvas.height = img.height;

    // Add the uploaded image as the first layer
    appState.addLayer(imageData, img.width, img.height, layerName);
    
    // Set project state
    appState.isProjectLoaded = true;
    appState.markAsSaved(); // New project starts as saved (no changes yet)
    
    // Update UI to reflect new project
    updateLayersPanel();
    updateCanvasSize();
    // render() will be called automatically when the layer image loads
  };
  
  img.src = imageData; // Trigger image loading
}

function setupToolbar() {
  document.querySelectorAll('.tool').forEach(button => {
    button.addEventListener('click', () => {
      const tool = button.dataset.tool;
      setActiveTool(tool);
    });
  });
}

function setupMenu() {
  const fileNewProject = document.getElementById('fileNewProject');
  fileNewProject.addEventListener('click', () => {
    let shouldProceed = true;
    if (appState.hasUnsavedChanges) {
      shouldProceed = confirm("You have unsaved changes. Start a new project? Current work will be lost.");
    } else if (appState.isProjectLoaded) {
      shouldProceed = confirm("Start a new project? Current work will be lost.");
    }
    
    if (shouldProceed) {
      // Reset app state
      appState.layers = [];
      appState.selectedLayerId = null;
      appState.isProjectLoaded = false;
      appState.hasUnsavedChanges = false;
      
      // Show welcome screen
      document.getElementById('welcomeModal').style.display = 'flex';
      document.getElementById('app').classList.add('hidden');
      
      // Reset canvas size inputs to defaults
      document.getElementById('canvasWidth').value = 800;
      document.getElementById('canvasHeight').value = 800;
      
      // Update canvas size display
      updateCanvasSize();
    }
  });

  const fileExport = document.getElementById('fileExport');
  fileExport.addEventListener('click', () => {
    if (!appState.isProjectLoaded || !appState.canvas) {
      alert('Please create a project first.');
      return;
    }
    showExportDialog();
  });

  setupExportDialog();
}

function showExportDialog() {
  document.getElementById('exportModal').style.display = 'flex';
}

function setupExportDialog() {
  const exportModal = document.getElementById('exportModal');
  const btnExportCancel = document.getElementById('btnExportCancel');
  const btnExportConfirm = document.getElementById('btnExportConfirm');
  const qualitySlider = document.getElementById('exportQuality');
  const qualityValue = document.getElementById('qualityValue');

  // Update quality display
  qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = Math.round(qualitySlider.value * 100) + '%';
  });

  // Cancel export
  btnExportCancel.addEventListener('click', () => {
    exportModal.style.display = 'none';
  });

  // Confirm export
  btnExportConfirm.addEventListener('click', () => {
    exportImage();
    exportModal.style.display = 'none';
  });
}

function exportImage() {
  const format = document.querySelector('input[name="exportFormat"]:checked').value;
  const quality = parseFloat(document.getElementById('exportQuality').value);
  
  // Create a temporary canvas to render all layers
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = appState.canvas.width;
  exportCanvas.height = appState.canvas.height;
  const exportCtx = exportCanvas.getContext('2d');
  
  // Clear the canvas
  exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
  
  // Draw each visible layer (reverse order so first layers are on top)
  appState.layers.slice().reverse().forEach(layer => {
    if (!layer.visible || !layer.isLoaded || !layer.image) return;
    exportCtx.drawImage(layer.image, layer.x, layer.y);
  });
  
  // Convert to blob and download
  exportCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Set filename based on format
    const extension = format.split('/')[1];
    a.download = `export.${extension === 'jpeg' ? 'jpg' : extension}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, format, format === 'image/jpeg' || format === 'image/webp' ? quality : undefined);
}

function setupLayerControls() {
  const btnAddLayer = document.getElementById('btnAddLayer');
  const btnAddImageLayer = document.getElementById('btnAddImageLayer');
  const layersList = document.getElementById('layersList');

  btnAddLayer.addEventListener('click', () => {
    if (!appState.isProjectLoaded || !appState.canvas) {
      alert('Please create a new project first.');
      return;
    }
    appState.addLayer(null, appState.canvas.width, appState.canvas.height, "Layer");
    updateLayersPanel();
    // render() will be called automatically when the layer image loads
  });

  btnAddImageLayer.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = event => {
        if (!appState.isProjectLoaded || !appState.canvas) {
          alert('Please create a new project first.');
          return;
        }
        // Extract filename without extension for layer name
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        const layerName = fileName || "Image Layer";
        appState.addLayer(event.target.result, null, null, layerName);
        updateLayersPanel();
        // render() will be called automatically when the layer image loads
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });

  // Update layers panel UI
  window.updateLayersPanel = () => {
    layersList.innerHTML = '';
    appState.layers.forEach((layer, index) => {
      const div = document.createElement('div');
      div.className = `layer-item ${layer.id === appState.selectedLayerId ? 'selected' : ''}`;
      div.draggable = true;
      div.dataset.layerId = layer.id;
      div.dataset.layerIndex = index;
      div.innerHTML = `
        <span class="layer-name">${layer.name}</span>
        <span class="layer-visibility">${layer.visible ? '👁️' : '🙈'}</span>
      `;
      
      // Layer selection
      div.addEventListener('click', () => {
        appState.selectedLayerId = layer.id;
        updateLayersPanel();
        updatePropertiesPanel();
        render();
      });
      
      // Context menu
      div.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showLayerContextMenu(e, layer.id);
      });
      
      // Drag and drop events
      div.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', layer.id);
        div.classList.add('dragging');
      });
      
      div.addEventListener('dragend', () => {
        div.classList.remove('dragging');
      });
      
      div.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        if (draggingElement && draggingElement !== div) {
          div.classList.add('drag-over');
        }
      });
      
      div.addEventListener('dragleave', () => {
        div.classList.remove('drag-over');
      });
      
      div.addEventListener('drop', (e) => {
        e.preventDefault();
        div.classList.remove('drag-over');
        const draggedLayerId = e.dataTransfer.getData('text/plain');
        const targetIndex = parseInt(div.dataset.layerIndex);
        
        if (draggedLayerId !== layer.id) {
          moveLayer(draggedLayerId, targetIndex);
        }
      });
      
      layersList.appendChild(div);
    });
  };
  
  // Helper function to move layers
  function moveLayer(layerId, targetIndex) {
    const sourceIndex = appState.layers.findIndex(l => l.id === layerId);
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;
    
   const [movedLayer] = appState.layers.splice(sourceIndex, 1);
    appState.layers.splice(targetIndex, 0, movedLayer);
    
    updateLayersPanel();
    render();
    appState.markAsModified();
  }
}

function showLayerContextMenu(event, layerId) {
  const contextMenu = document.getElementById('layerContextMenu');
  const contextRename = document.getElementById('contextRename');
  const contextDelete = document.getElementById('contextDelete');
  
  // Position the context menu
  contextMenu.style.left = event.pageX + 'px';
  contextMenu.style.top = event.pageY + 'px';
  contextMenu.style.display = 'block';
  
  // Store the layer ID for the context menu actions
  contextMenu.dataset.layerId = layerId;
  
  // Hide context menu when clicking elsewhere
  const hideContextMenu = (e) => {
    if (!contextMenu.contains(e.target)) {
      contextMenu.style.display = 'none';
      document.removeEventListener('click', hideContextMenu);
    }
  };
  
  setTimeout(() => {
    document.addEventListener('click', hideContextMenu);
  }, 0);
}

function setupLayerContextMenu() {
  const contextRename = document.getElementById('contextRename');
  const contextDelete = document.getElementById('contextDelete');
  
  contextRename.addEventListener('click', () => {
    const contextMenu = document.getElementById('layerContextMenu');
    const layerId = contextMenu.dataset.layerId;
    contextMenu.style.display = 'none';
    renameLayer(layerId);
  });
  
  contextDelete.addEventListener('click', () => {
    const contextMenu = document.getElementById('layerContextMenu');
    const layerId = contextMenu.dataset.layerId;
    contextMenu.style.display = 'none';
    deleteLayer(layerId);
  });
}

function renameLayer(layerId) {
  const layer = appState.layers.find(l => l.id === layerId);
  if (!layer) return;
  
  const newName = prompt('Enter new layer name:', layer.name);
  if (newName && newName.trim()) {
    layer.name = newName.trim();
    updateLayersPanel();
    appState.markAsModified();
  }
}

function deleteLayer(layerId) {
  const layer = appState.layers.find(l => l.id === layerId);
  if (!layer) return;
  
  if (appState.layers.length === 1) {
    alert('Cannot delete the last layer.');
    return;
  }
  
  if (confirm(`Delete layer "${layer.name}"?`)) {
    const layerIndex = appState.layers.findIndex(l => l.id === layerId);
    appState.layers.splice(layerIndex, 1);
    
    // Select another layer if the deleted one was selected
    if (appState.selectedLayerId === layerId) {
      appState.selectedLayerId = appState.layers.length > 0 ? appState.layers[0].id : null;
    }
    
    updateLayersPanel();
    render();
    appState.markAsModified();
  }
}

function setupCanvasResize() {
  const canvasSizeElement = document.getElementById('canvasSize');
  const modal = document.getElementById('canvasResizeModal');
  const newWidthInput = document.getElementById('newCanvasWidth');
  const newHeightInput = document.getElementById('newCanvasHeight');
  const cancelBtn = document.getElementById('btnResizeCancel');
  const confirmBtn = document.getElementById('btnResizeConfirm');
  const anchorPoints = document.querySelectorAll('.anchor-point');

  let selectedAnchor = 'middle-center';

  // Setup anchor point selection
  anchorPoints.forEach(point => {
    point.addEventListener('click', () => {
      anchorPoints.forEach(p => p.classList.remove('active'));
      point.classList.add('active');
      selectedAnchor = point.dataset.anchor;
    });
  });

  // Show modal when canvas size is clicked
  canvasSizeElement.addEventListener('click', () => {
    if (appState.canvas && appState.isProjectLoaded) {
      newWidthInput.value = appState.canvas.width;
      newHeightInput.value = appState.canvas.height;
      modal.style.display = 'flex';
    }
  });

  // Cancel button
  cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Confirm resize
  confirmBtn.addEventListener('click', () => {
    const newWidth = parseInt(newWidthInput.value);
    const newHeight = parseInt(newHeightInput.value);
    
    if (newWidth > 0 && newHeight > 0) {
      resizeCanvas(newWidth, newHeight, selectedAnchor);
      modal.style.display = 'none';
    }
  });

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}

function resizeCanvas(newWidth, newHeight, anchor) {
  const oldWidth = appState.canvas.width;
  const oldHeight = appState.canvas.height;
  
  // Resize the canvas
  appState.canvas.width = newWidth;
  appState.canvas.height = newHeight;
  
  // Calculate offset based on anchor point
  let offsetX = 0;
  let offsetY = 0;
  
  const widthDiff = newWidth - oldWidth;
  const heightDiff = newHeight - oldHeight;
  
  // Calculate X offset based on anchor horizontal position
  if (anchor.includes('left')) {
    offsetX = 0; // No offset - expand/crop from right
  } else if (anchor.includes('center')) {
    offsetX = widthDiff / 2; // Center - expand/crop equally from both sides
  } else if (anchor.includes('right')) {
    offsetX = widthDiff; // Full offset - expand/crop from left
  }
  
  // Calculate Y offset based on anchor vertical position
  if (anchor.includes('top')) {
    offsetY = 0; // No offset - expand/crop from bottom
  } else if (anchor.includes('middle')) {
    offsetY = heightDiff / 2; // Center - expand/crop equally from both sides
  } else if (anchor.includes('bottom')) {
    offsetY = heightDiff; // Full offset - expand/crop from top
  }
  
  // Update layer positions based on calculated offsets
  if (offsetX !== 0 || offsetY !== 0) {
    appState.layers.forEach(layer => {
      if (layer.x !== undefined) layer.x += offsetX;
      if (layer.y !== undefined) layer.y += offsetY;
    });
  }
  
  // Update UI and re-render
  updateCanvasSize();
  render();
  appState.markAsModified();
}

function setupCropTool() {
  const cropOverlay = document.getElementById('cropOverlay');
  const cropArea = cropOverlay.querySelector('.crop-area');
  const cropHandles = cropOverlay.querySelectorAll('.crop-handle');
  const confirmBtn = document.getElementById('btnCropConfirm');
  const cancelBtn = document.getElementById('btnCropCancel');
  
  let cropRect = { x: 0, y: 0, width: 0, height: 0 };
  let isDragging = false;
  let dragType = null; // 'move' or handle direction
  let dragStart = { x: 0, y: 0 };
  let initialRect = { x: 0, y: 0, width: 0, height: 0 };

  // Show crop overlay when crop tool is activated
  function showCropOverlay() {
    if (!appState.canvas || !appState.isProjectLoaded) return;
    
    const canvasRect = appState.canvas.getBoundingClientRect();
    
    // Position overlay to match canvas position using fixed positioning
    cropOverlay.style.position = 'fixed';
    cropOverlay.style.left = canvasRect.left + 'px';
    cropOverlay.style.top = canvasRect.top + 'px';
    cropOverlay.style.width = canvasRect.width + 'px';
    cropOverlay.style.height = canvasRect.height + 'px';
    
    // Initialize crop area to match canvas size
    cropRect = {
      x: 0,
      y: 0,
      width: appState.canvas.width,
      height: appState.canvas.height
    };
    
    updateCropArea();
    cropOverlay.style.display = 'block';
  }

  // Hide crop overlay
  function hideCropOverlay() {
    cropOverlay.style.display = 'none';
  }

  // Update crop area visual position and size
  function updateCropArea() {
    const canvasRect = appState.canvas.getBoundingClientRect();
    const scaleX = canvasRect.width / appState.canvas.width;
    const scaleY = canvasRect.height / appState.canvas.height;
    
    cropArea.style.left = (cropRect.x * scaleX) + 'px';
    cropArea.style.top = (cropRect.y * scaleY) + 'px';
    cropArea.style.width = (cropRect.width * scaleX) + 'px';
    cropArea.style.height = (cropRect.height * scaleY) + 'px';
  }

  // Handle mouse down on crop area or handles
  function onMouseDown(e) {
    e.preventDefault();
    isDragging = true;
    
    const canvasRect = appState.canvas.getBoundingClientRect();
    const scaleX = appState.canvas.width / canvasRect.width;
    const scaleY = appState.canvas.height / canvasRect.height;
    
    dragStart = {
      x: (e.clientX - canvasRect.left) * scaleX,
      y: (e.clientY - canvasRect.top) * scaleY
    };
    
    initialRect = { ...cropRect };
    
    if (e.target.classList.contains('crop-handle')) {
      dragType = e.target.dataset.direction;
    } else {
      dragType = 'move';
    }
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // Handle mouse move for dragging
  function onMouseMove(e) {
    if (!isDragging) return;
    
    const canvasRect = appState.canvas.getBoundingClientRect();
    const scaleX = appState.canvas.width / canvasRect.width;
    const scaleY = appState.canvas.height / canvasRect.height;
    
    const currentMouse = {
      x: (e.clientX - canvasRect.left) * scaleX,
      y: (e.clientY - canvasRect.top) * scaleY
    };
    
    const deltaX = currentMouse.x - dragStart.x;
    const deltaY = currentMouse.y - dragStart.y;
    
    if (dragType === 'move') {
      // Move the entire crop area
      cropRect.x = Math.max(0, Math.min(appState.canvas.width - cropRect.width, initialRect.x + deltaX));
      cropRect.y = Math.max(0, Math.min(appState.canvas.height - cropRect.height, initialRect.y + deltaY));
    } else {
      // Resize based on handle direction
      const newRect = { ...initialRect };
      
      if (dragType.includes('n')) {
        const newY = Math.max(0, Math.min(initialRect.y + initialRect.height - 10, initialRect.y + deltaY));
        newRect.height = initialRect.height - (newY - initialRect.y);
        newRect.y = newY;
      }
      if (dragType.includes('s')) {
        newRect.height = Math.max(10, Math.min(appState.canvas.height - initialRect.y, initialRect.height + deltaY));
      }
      if (dragType.includes('w')) {
        const newX = Math.max(0, Math.min(initialRect.x + initialRect.width - 10, initialRect.x + deltaX));
        newRect.width = initialRect.width - (newX - initialRect.x);
        newRect.x = newX;
      }
      if (dragType.includes('e')) {
        newRect.width = Math.max(10, Math.min(appState.canvas.width - initialRect.x, initialRect.width + deltaX));
      }
      
      cropRect = newRect;
    }
    
    updateCropArea();
  }

  // Handle mouse up
  function onMouseUp() {
    isDragging = false;
    dragType = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  // Confirm crop operation
  function confirmCrop() {
    if (!appState.canvas || !appState.isProjectLoaded) return;
    
    // Calculate the anchor point based on crop position
    const centerX = cropRect.x + cropRect.width / 2;
    const centerY = cropRect.y + cropRect.height / 2;
    const canvasCenterX = appState.canvas.width / 2;
    const canvasCenterY = appState.canvas.height / 2;
    
    let anchor = 'middle-center';
    
    // Determine anchor based on crop area position relative to canvas center
    if (centerX < canvasCenterX / 2) {
      if (centerY < canvasCenterY / 2) anchor = 'top-left';
      else if (centerY > canvasCenterY * 1.5) anchor = 'bottom-left';
      else anchor = 'middle-left';
    } else if (centerX > canvasCenterX * 1.5) {
      if (centerY < canvasCenterY / 2) anchor = 'top-right';
      else if (centerY > canvasCenterY * 1.5) anchor = 'bottom-right';
      else anchor = 'middle-right';
    } else {
      if (centerY < canvasCenterY / 2) anchor = 'top-center';
      else if (centerY > canvasCenterY * 1.5) anchor = 'bottom-center';
      else anchor = 'middle-center';
    }
    
    // Apply the crop using the existing resize functionality
    resizeCanvas(cropRect.width, cropRect.height, anchor);
    
    // Hide crop overlay and switch back to move tool
    hideCropOverlay();
    setActiveTool('move');
  }

  // Cancel crop operation
  function cancelCrop() {
    // Reset crop area to canvas size
    if (appState.canvas && appState.isProjectLoaded) {
      cropRect = {
        x: 0,
        y: 0,
        width: appState.canvas.width,
        height: appState.canvas.height
      };
      updateCropArea();
    }
    
    // Hide crop overlay and switch back to move tool
    hideCropOverlay();
    setActiveTool('move');
  }

  // Event listeners
  cropArea.addEventListener('mousedown', onMouseDown);
  cropHandles.forEach(handle => {
    handle.addEventListener('mousedown', onMouseDown);
  });
  
  confirmBtn.addEventListener('click', confirmCrop);
  cancelBtn.addEventListener('click', cancelCrop);

  // Listen for tool changes
  document.addEventListener('toolChanged', (e) => {
    if (e.detail.tool === 'crop') {
      showCropOverlay();
    } else {
      hideCropOverlay();
    }
    updatePropertiesPanel();
  });
}

function setupPropertiesPanel() {
  // Update properties panel UI
  window.updatePropertiesPanel = () => {
    const propertiesContent = document.getElementById('propertiesContent');
    const selectedLayer = appState.getSelectedLayer();
    
    if (appState.activeTool === 'text' || (selectedLayer && selectedLayer.type === 'text')) {
      // Show text properties
      const textLayer = selectedLayer && selectedLayer.type === 'text' ? selectedLayer : null;
      propertiesContent.innerHTML = `
        <div class="property-group">
          <label>Font Size:</label>
          <input type="range" id="fontSizeSlider" min="8" max="72" value="${textLayer ? textLayer.fontSize : 24}">
          <span id="fontSizeValue">${textLayer ? textLayer.fontSize : 24}px</span>
        </div>
        <div class="property-group">
          <label>Text Color:</label>
          <input type="color" id="textColorPicker" value="${textLayer ? textLayer.color : '#000000'}">
        </div>
      `;
      
      // Add event listeners
      const fontSizeSlider = document.getElementById('fontSizeSlider');
      const fontSizeValue = document.getElementById('fontSizeValue');
      const textColorPicker = document.getElementById('textColorPicker');
      
      fontSizeSlider.addEventListener('input', () => {
        const newSize = parseInt(fontSizeSlider.value);
        fontSizeValue.textContent = newSize + 'px';
        if (textLayer) {
          textLayer.fontSize = newSize;
          render();
        }
      });
      
      textColorPicker.addEventListener('input', () => {
        if (textLayer) {
          textLayer.color = textColorPicker.value;
          render();
        }
      });
    } else {
      // Show default message
      propertiesContent.innerHTML = '<div class="no-selection">Select a tool or layer to see properties</div>';
    }
  };
  
  // Initial update
  updatePropertiesPanel();
}