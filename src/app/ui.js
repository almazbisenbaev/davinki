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
}

function updateCanvasSize() {
  const canvasSizeElement = document.getElementById('canvasSize');
  if (appState.canvas && appState.isProjectLoaded) {
    canvasSizeElement.textContent = `Canvas: ${appState.canvas.width} × ${appState.canvas.height} px`;
  } else {
    canvasSizeElement.textContent = 'Canvas: 0 × 0 px';
  }
}

function setupWelcomeScreen() {
  const welcomeModal = document.getElementById('welcomeModal');
  const btnNew = document.getElementById('btnNewProject');
  const btnUpload = document.getElementById('btnUploadImage');

  btnNew.addEventListener('click', () => {
    createNewProject();
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
        createNewProjectFromImage(event.target.result);
        welcomeModal.style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

function createNewProject(width = 800, height = 600) {
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
  updateLayersPanel();
  updateCanvasSize();
  render();
}

function createNewProjectFromImage(imageData) {
  const img = new Image();
  img.onload = () => {
    // Initialize canvas first
    initCanvas(appState);
    
    const { canvas } = appState;
    canvas.width = img.width;
    canvas.height = img.height;

    appState.addLayer(imageData, img.width, img.height, "Image");
    appState.isProjectLoaded = true;
    updateLayersPanel();
    updateCanvasSize();
    render();
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
    if (confirm("Start a new project? Current work will be lost.")) {
      appState.layers = [];
      appState.selectedLayerId = null;
      createNewProject(800, 600); // default size
    }
  });
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
    render();
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
        appState.addLayer(event.target.result, null, null, "Image Layer");
        updateLayersPanel();
        render();
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
  }
}