import { initCanvas, render } from './canvas.js';
import { initTools, setActiveTool } from './tools.js';

let appState;

export function initUI(state) {
  appState = state;
  initTools(state);
  setupWelcomeScreen();
  setupToolbar();
  setupMenu();
  setupLayerControls();
  setupLayerContextMenu();
  setupBeforeUnload();
  setupCanvasResize();
}

function setupBeforeUnload() {
  window.addEventListener('beforeunload', (e) => {
    if (appState.hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return 'You have unsaved changes. Are you sure you want to leave?';
    }
  });
}

function updateCanvasSize() {
  const canvasSizeElement = document.getElementById('canvasSize');
  if (appState.canvas && appState.isProjectLoaded) {
    canvasSizeElement.textContent = `Canvas: ${appState.canvas.width} × ${appState.canvas.height} px`;
    canvasSizeElement.style.cursor = 'pointer';
    canvasSizeElement.title = 'Click to resize canvas';
  } else {
    canvasSizeElement.textContent = 'Canvas: 0 × 0 px';
    canvasSizeElement.style.cursor = 'default';
    canvasSizeElement.title = '';
  }
}

function setupWelcomeScreen() {
  const welcomeModal = document.getElementById('welcomeModal');
  const btnNew = document.getElementById('btnNewProject');
  const btnUpload = document.getElementById('btnUploadImage');

  btnNew.addEventListener('click', () => {
    const width = parseInt(document.getElementById('canvasWidth').value) || 800;
    const height = parseInt(document.getElementById('canvasHeight').value) || 800;
    createNewProject(width, height);
    welcomeModal.style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
  });

  btnUpload.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = event => {
        // Extract filename without extension for layer name
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        const layerName = fileName || "Image";
        createNewProjectFromImage(event.target.result, layerName);
        welcomeModal.style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

function createNewProject(width = 800, height = 800) {
  // Initialize canvas first
  initCanvas(appState);
  
  const { canvas } = appState;
  canvas.width = width;
  canvas.height = height;

  // Add white background layer
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.fillStyle = '#ffffff';
  tempCtx.fillRect(0, 0, width, height);

  appState.addLayer(tempCanvas.toDataURL(), width, height, "Background");
  appState.isProjectLoaded = true;
  appState.markAsSaved(); // New project starts as saved
  updateLayersPanel();
  updateCanvasSize();
  // render() will be called automatically when the layer image loads
}

function createNewProjectFromImage(imageData, layerName = "Image") {
  const img = new Image();
  img.onload = () => {
    // Initialize canvas first
    initCanvas(appState);
    
    const { canvas } = appState;
    canvas.width = img.width;
    canvas.height = img.height;

    appState.addLayer(imageData, img.width, img.height, layerName);
    appState.isProjectLoaded = true;
    appState.markAsSaved(); // New project starts as saved
    updateLayersPanel();
    updateCanvasSize();
    // render() will be called automatically when the layer image loads
  };
  img.src = imageData;
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