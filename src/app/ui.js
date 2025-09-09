import { initCanvas, render, setUICallbacks } from './canvas.js';
import { initTools, setActiveTool } from './tools.js';
import { showUndoFeedback } from './utils/dom.js';
import { CANVAS, COLORS, TIMING, TEXT, CROP_PRESETS } from './utils/constants.js';

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
    const width = parseInt(document.getElementById('canvasWidth').value) || CANVAS.DEFAULT_WIDTH;
    const height = parseInt(document.getElementById('canvasHeight').value) || CANVAS.DEFAULT_WIDTH;
    
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
  
  // Setup undo/redo buttons
  setupUndoRedo();
}

/**
 * Setup undo button functionality
 * Handles button clicks and manages button enabled/disabled states
 */
function setupUndoRedo() {
  const undoBtn = document.getElementById('btnUndo');
  
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      const undoResult = appState.undo();
      if (undoResult) {
        updateUndoRedoButtons();
        // Update UI panels after undo
        if (window.updateLayersPanel) window.updateLayersPanel();
        if (window.updatePropertiesPanel) window.updatePropertiesPanel();
        
        // Show brief feedback about what was undone
        showUndoFeedback(undoResult.undoneOperation);
      }
    });
  }
  
  // Initial button state update
  updateUndoRedoButtons();
}

/**
 * Update the enabled/disabled state of undo button
 * Called after any action that might change history state
 */
function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('btnUndo');
  
  if (undoBtn) {
    const canUndo = appState.canUndo();
    undoBtn.disabled = !canUndo;
    
    // Update tooltip to show what operation can be undone
    if (canUndo && appState.lastOperation) {
      undoBtn.title = `Undo: ${appState.lastOperation}`;
    } else {
      undoBtn.title = 'Undo';
    }
  }
}



// Export functions to window for global access
window.updateUndoRedoButtons = updateUndoRedoButtons;
window.updateCanvasSize = updateCanvasSize;

function setupMenu() {
  // Setup menu button click handlers for dropdown toggles
  const menuButtons = document.querySelectorAll('.menu-title');
  menuButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdownId = button.getAttribute('data-dropdown');
      const dropdown = document.getElementById(dropdownId);
      
      // Close all other dropdowns first
      document.querySelectorAll('.dropdown.show').forEach(openDropdown => {
        if (openDropdown !== dropdown) {
          openDropdown.classList.remove('show');
        }
      });
      
      // Toggle current dropdown
      dropdown.classList.toggle('show');
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu')) {
      document.querySelectorAll('.dropdown.show').forEach(dropdown => {
        dropdown.classList.remove('show');
      });
    }
  });

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
    window.updateUndoRedoButtons();
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
        window.updateUndoRedoButtons();
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
    
    // Save state before moving layer for undo functionality
    appState.saveStateToHistory('Reorder layer');
    
    const [movedLayer] = appState.layers.splice(sourceIndex, 1);
    appState.layers.splice(targetIndex, 0, movedLayer);
    
    updateLayersPanel();
    render();
    appState.markAsModified();
    window.updateUndoRedoButtons();
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
    // Save state before renaming layer for undo functionality
    appState.saveStateToHistory('Rename layer');
    
    layer.name = newName.trim();
    updateLayersPanel();
    appState.markAsModified();
    window.updateUndoRedoButtons();
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
    // Save state before deleting layer for undo functionality
    appState.saveStateToHistory('Delete layer');
    
    const layerIndex = appState.layers.findIndex(l => l.id === layerId);
    appState.layers.splice(layerIndex, 1);
    
    // Select another layer if the deleted one was selected
    if (appState.selectedLayerId === layerId) {
      appState.selectedLayerId = appState.layers.length > 0 ? appState.layers[0].id : null;
    }
    
    updateLayersPanel();
    render();
    appState.markAsModified();
    window.updateUndoRedoButtons();
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
  // Save state before resizing for undo functionality
  appState.saveStateToHistory('Resize canvas');
  
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
  if (window.updateUndoRedoButtons) window.updateUndoRedoButtons();
}

// Global crop tool variables and constants
let cropOverlay, cropArea;
let cropRect = { x: 0, y: 0, width: 0, height: 0 };
let isDragging = false;
let dragType = null; // 'move' or handle direction
let dragStart = { x: 0, y: 0 };
let initialRect = { x: 0, y: 0, width: 0, height: 0 };
let aspectRatio = 'free'; // Current aspect ratio mode
let snapGuides = { vertical: [], horizontal: [] };
let isAltPressed = false;

// Use centralized snap threshold from constants
const SNAP_THRESHOLD = CANVAS.SNAP_THRESHOLD;

// Use centralized aspect ratio presets from constants
const ASPECT_RATIOS = {
  'free': null,
  '1:1': CROP_PRESETS.SQUARE.width / CROP_PRESETS.SQUARE.height,
  '4:3': CROP_PRESETS.PHOTO.width / CROP_PRESETS.PHOTO.height,
  '16:9': CROP_PRESETS.LANDSCAPE.width / CROP_PRESETS.LANDSCAPE.height,
  '3:2': 3/2
};

function setupCropTool() {
  cropOverlay = document.getElementById('cropOverlay');
  cropArea = cropOverlay.querySelector('.crop-area');
  const cropHandles = cropOverlay.querySelectorAll('.crop-handle');
  const confirmBtn = document.getElementById('btnCropConfirm');
  const cancelBtn = document.getElementById('btnCropCancel');

  // Show crop overlay when crop tool is activated
  function showCropOverlay() {
    if (!appState.canvas || !appState.isProjectLoaded) return;
    
    const canvas = appState.canvas;
    const canvasContainer = canvas.parentElement;
    
    // Position overlay to match canvas position within the container
    const canvasOffsetLeft = canvas.offsetLeft;
    const canvasOffsetTop = canvas.offsetTop;
    
    cropOverlay.style.left = canvasOffsetLeft + 'px';
    cropOverlay.style.top = canvasOffsetTop + 'px';
    cropOverlay.style.width = canvas.offsetWidth + 'px';
    cropOverlay.style.height = canvas.offsetHeight + 'px';
    
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

  // Calculate snapped position for crop area
  function getSnappedCropPosition(x, y, width, height) {
    let snappedX = x;
    let snappedY = y;
    snapGuides = { vertical: [], horizontal: [] };
    
    const canvas = appState.canvas;
    
    // Canvas snap points
    const canvasSnapPoints = {
      x: [
        0, // left edge
        canvas.width / 2 - width / 2, // horizontal center
        canvas.width - width // right edge
      ],
      y: [
        0, // top edge
        canvas.height / 2 - height / 2, // vertical center
        canvas.height - height // bottom edge
      ]
    };
    
    // Check X snapping
    for (const snapX of canvasSnapPoints.x) {
      if (Math.abs(x - snapX) <= SNAP_THRESHOLD) {
        snappedX = snapX;
        if (snapX === 0) {
          snapGuides.vertical.push({ x: 0, type: 'canvas-left' });
        } else if (snapX === canvas.width / 2 - width / 2) {
          snapGuides.vertical.push({ x: canvas.width / 2, type: 'canvas-center' });
        } else {
          snapGuides.vertical.push({ x: canvas.width, type: 'canvas-right' });
        }
        break;
      }
    }
    
    // Check Y snapping
    for (const snapY of canvasSnapPoints.y) {
      if (Math.abs(y - snapY) <= SNAP_THRESHOLD) {
        snappedY = snapY;
        if (snapY === 0) {
          snapGuides.horizontal.push({ y: 0, type: 'canvas-top' });
        } else if (snapY === canvas.height / 2 - height / 2) {
          snapGuides.horizontal.push({ y: canvas.height / 2, type: 'canvas-center' });
        } else {
          snapGuides.horizontal.push({ y: canvas.height, type: 'canvas-bottom' });
        }
        break;
      }
    }
    
    return { x: snappedX, y: snappedY };
  }
  
  // Apply aspect ratio constraint to dimensions
// Apply aspect ratio constraints to dimensions
function applyAspectRatio(width, height, ratioKey) {
  if (ratioKey === 'free' || !ASPECT_RATIOS[ratioKey]) {
    return { width, height };
  }
  
  const ratio = ASPECT_RATIOS[ratioKey];
  const currentRatio = width / height;
  
  if (currentRatio > ratio) {
    // Width is too large, adjust it
    width = height * ratio;
  } else {
    // Height is too large, adjust it
    height = width / ratio;
  }
  
  return { width, height };
}

// Update crop area visual position and size
function updateCropArea() {
  if (!cropArea || !appState.canvas) return;
  
  const canvas = appState.canvas;
  const scaleX = canvas.offsetWidth / canvas.width;
  const scaleY = canvas.offsetHeight / canvas.height;
  
  cropArea.style.left = (cropRect.x * scaleX) + 'px';
  cropArea.style.top = (cropRect.y * scaleY) + 'px';
  cropArea.style.width = (cropRect.width * scaleX) + 'px';
  cropArea.style.height = (cropRect.height * scaleY) + 'px';
  
  // Draw snap guides if any
  drawCropSnapGuides();
}

// Draw snap guides for crop tool
function drawCropSnapGuides() {
  if (!cropOverlay) return;
  
  // Remove existing guides
  const existingGuides = cropOverlay.querySelectorAll('.snap-guide');
  existingGuides.forEach(guide => guide.remove());
  
  if (!isDragging) return;
  
  const canvas = appState.canvas;
  const scaleX = canvas.offsetWidth / canvas.width;
  const scaleY = canvas.offsetHeight / canvas.height;
  
  // Draw vertical guides
  snapGuides.vertical.forEach(guide => {
    const line = document.createElement('div');
    line.className = 'snap-guide snap-guide-vertical';
    line.style.position = 'absolute';
    line.style.left = (guide.x * scaleX) + 'px';
    line.style.top = '0px';
    line.style.width = '1px';
    line.style.height = '100%';
    line.style.background = COLORS.PRIMARY;
    line.style.pointerEvents = 'none';
    line.style.zIndex = '15';
    cropOverlay.appendChild(line);
  });
  
  // Draw horizontal guides
  snapGuides.horizontal.forEach(guide => {
    const line = document.createElement('div');
    line.className = 'snap-guide snap-guide-horizontal';
    line.style.position = 'absolute';
    line.style.left = '0px';
    line.style.top = (guide.y * scaleY) + 'px';
    line.style.width = '100%';
    line.style.height = '1px';
    line.style.background = COLORS.PRIMARY;
    line.style.pointerEvents = 'none';
    line.style.zIndex = '15';
    cropOverlay.appendChild(line);
  });
}

// Expose aspect ratio setter globally for properties panel
window.setCropAspectRatio = (newAspectRatio) => {
  aspectRatio = newAspectRatio;
  // If not free aspect ratio, apply constraint to current crop rect
  if (aspectRatio !== 'free' && appState.canvas && cropRect.width > 0 && cropRect.height > 0) {
    const constrainedDimensions = applyAspectRatio(cropRect.width, cropRect.height, aspectRatio);
    cropRect.width = constrainedDimensions.width;
    cropRect.height = constrainedDimensions.height;
    
    // Ensure crop area stays within canvas bounds
    const canvas = appState.canvas;
    cropRect.x = Math.max(0, Math.min(canvas.width - cropRect.width, cropRect.x));
    cropRect.y = Math.max(0, Math.min(canvas.height - cropRect.height, cropRect.y));
    
    updateCropArea();
  }
};


  // Handle keyboard events for alt/option key
  function onKeyDown(e) {
    if (e.altKey || e.key === 'Alt') {
      isAltPressed = true;
    }
  }
  
  function onKeyUp(e) {
    if (!e.altKey && e.key === 'Alt') {
      isAltPressed = false;
    }
  }
  
  // Handle mouse down on crop area or handles
  function onMouseDown(e) {
    e.preventDefault();
    isDragging = true;
    isAltPressed = e.altKey;
    
    const canvas = appState.canvas;
    const canvasContainer = canvas.parentElement;
    const containerRect = canvasContainer.getBoundingClientRect();
    const canvasOffsetLeft = canvas.offsetLeft;
    const canvasOffsetTop = canvas.offsetTop;
    
    const scaleX = canvas.width / canvas.offsetWidth;
    const scaleY = canvas.height / canvas.offsetHeight;
    
    dragStart = {
      x: (e.clientX - containerRect.left - canvasOffsetLeft) * scaleX,
      y: (e.clientY - containerRect.top - canvasOffsetTop) * scaleY
    };
    
    initialRect = { ...cropRect };
    
    if (e.target.classList.contains('crop-handle')) {
      dragType = e.target.dataset.direction;
    } else {
      dragType = 'move';
    }
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }

  // Handle mouse move for dragging
  function onMouseMove(e) {
    if (!isDragging) return;
    
    isAltPressed = e.altKey; // Update alt key state
    
    const canvas = appState.canvas;
    const canvasContainer = canvas.parentElement;
    const containerRect = canvasContainer.getBoundingClientRect();
    const canvasOffsetLeft = canvas.offsetLeft;
    const canvasOffsetTop = canvas.offsetTop;
    
    const scaleX = canvas.width / canvas.offsetWidth;
    const scaleY = canvas.height / canvas.offsetHeight;
    
    const currentMouse = {
      x: (e.clientX - containerRect.left - canvasOffsetLeft) * scaleX,
      y: (e.clientY - containerRect.top - canvasOffsetTop) * scaleY
    };
    
    const deltaX = currentMouse.x - dragStart.x;
    const deltaY = currentMouse.y - dragStart.y;
    
    if (dragType === 'move') {
      // Move the entire crop area
      let newX = initialRect.x + deltaX;
      let newY = initialRect.y + deltaY;
      
      // Apply bounds checking
      newX = Math.max(0, Math.min(canvas.width - cropRect.width, newX));
      newY = Math.max(0, Math.min(canvas.height - cropRect.height, newY));
      
      // Apply snapping
      const snapped = getSnappedCropPosition(newX, newY, cropRect.width, cropRect.height);
      cropRect.x = snapped.x;
      cropRect.y = snapped.y;
    } else {
      // Resize based on handle direction
      let newRect = { ...initialRect };
      
      if (isAltPressed) {
        // Alt/Option key pressed - resize from center
        const centerX = initialRect.x + initialRect.width / 2;
        const centerY = initialRect.y + initialRect.height / 2;
        
        if (dragType.includes('n') || dragType.includes('s')) {
          // Vertical resize from center
          const heightChange = dragType.includes('n') ? -deltaY * 2 : deltaY * 2;
          newRect.height = Math.max(10, initialRect.height + heightChange);
          newRect.y = centerY - newRect.height / 2;
        }
        
        if (dragType.includes('w') || dragType.includes('e')) {
          // Horizontal resize from center
          const widthChange = dragType.includes('w') ? -deltaX * 2 : deltaX * 2;
          newRect.width = Math.max(10, initialRect.width + widthChange);
          newRect.x = centerX - newRect.width / 2;
        }
        
        // For corner handles, resize both dimensions from center
        if ((dragType.includes('n') || dragType.includes('s')) && 
            (dragType.includes('w') || dragType.includes('e'))) {
          const widthChange = dragType.includes('w') ? -deltaX * 2 : deltaX * 2;
          const heightChange = dragType.includes('n') ? -deltaY * 2 : deltaY * 2;
          
          newRect.width = Math.max(10, initialRect.width + widthChange);
          newRect.height = Math.max(10, initialRect.height + heightChange);
          newRect.x = centerX - newRect.width / 2;
          newRect.y = centerY - newRect.height / 2;
        }
      } else {
        // Normal resize behavior
        if (dragType.includes('n')) {
          const newY = Math.max(0, Math.min(initialRect.y + initialRect.height - 10, initialRect.y + deltaY));
          newRect.height = initialRect.height - (newY - initialRect.y);
          newRect.y = newY;
        }
        if (dragType.includes('s')) {
          newRect.height = Math.max(10, Math.min(canvas.height - initialRect.y, initialRect.height + deltaY));
        }
        if (dragType.includes('w')) {
          const newX = Math.max(0, Math.min(initialRect.x + initialRect.width - 10, initialRect.x + deltaX));
          newRect.width = initialRect.width - (newX - initialRect.x);
          newRect.x = newX;
        }
        if (dragType.includes('e')) {
          newRect.width = Math.max(10, Math.min(canvas.width - initialRect.x, initialRect.width + deltaX));
        }
      }
      
      // Apply aspect ratio constraint
      const constrainedDimensions = applyAspectRatio(newRect.width, newRect.height, aspectRatio);
      newRect.width = constrainedDimensions.width;
      newRect.height = constrainedDimensions.height;
      
      // Apply bounds checking
      newRect.x = Math.max(0, Math.min(canvas.width - newRect.width, newRect.x));
      newRect.y = Math.max(0, Math.min(canvas.height - newRect.height, newRect.y));
      
      // If aspect ratio was applied and we're not in alt mode, adjust position for corner handles
      if (aspectRatio !== 'free' && !isAltPressed) {
        if (dragType.includes('n') && newRect.height !== (initialRect.height - (newRect.y - initialRect.y))) {
          newRect.y = initialRect.y + initialRect.height - newRect.height;
        }
        if (dragType.includes('w') && newRect.width !== (initialRect.width - (newRect.x - initialRect.x))) {
          newRect.x = initialRect.x + initialRect.width - newRect.width;
        }
      }
      
      cropRect = newRect;
    }
    
    updateCropArea();
  }

  // Handle mouse up
  function onMouseUp() {
    isDragging = false;
    dragType = null;
    isAltPressed = false;
    
    // Clear snap guides
    const existingGuides = cropOverlay.querySelectorAll('.snap-guide');
    existingGuides.forEach(guide => guide.remove());
    
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
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
    
    if (appState.activeTool === 'crop') {
      // Show crop tool properties
      propertiesContent.innerHTML = `
        <div class="property-group">
          <label>Aspect Ratio:</label>
          <select id="aspectRatioSelect">
            <option value="free">Free</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="4:3">4:3</option>
            <option value="16:9">16:9</option>
            <option value="3:2">3:2</option>
          </select>
        </div>
        <div class="property-group">
          <label>Instructions:</label>
          <div class="crop-instructions">
            <p>• Drag to move crop area</p>
            <p>• Drag handles to resize</p>
            <p>• Hold Alt/Option + drag for center resize</p>
            <p>• Crop area snaps to canvas edges and center</p>
          </div>
        </div>
      `;
      
      // Add event listener for aspect ratio selection
      const aspectRatioSelect = document.getElementById('aspectRatioSelect');
      aspectRatioSelect.value = aspectRatio; // Set current value
      
      aspectRatioSelect.addEventListener('change', () => {
         // Update aspect ratio in crop tool scope
         if (window.setCropAspectRatio) {
           window.setCropAspectRatio(aspectRatioSelect.value);
         }
       });
    } else if (appState.activeTool === 'text' || (selectedLayer && selectedLayer.type === 'text')) {
      // Show text properties
      const textLayer = selectedLayer && selectedLayer.type === 'text' ? selectedLayer : null;
      propertiesContent.innerHTML = `
        <div class="property-group">
          <label>Font Size:</label>
          <input type="range" id="fontSizeSlider" min="${TEXT.MIN_FONT_SIZE}" max="${TEXT.MAX_FONT_SIZE}" value="${textLayer ? textLayer.fontSize : TEXT.DEFAULT_FONT_SIZE}">
          <span id="fontSizeValue">${textLayer ? textLayer.fontSize : TEXT.DEFAULT_FONT_SIZE}px</span>
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