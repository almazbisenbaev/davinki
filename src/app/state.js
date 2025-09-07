import { render } from './canvas.js';

let nextLayerId = 1;

export function initAppState() {
  return {
    isProjectLoaded: false,
    hasUnsavedChanges: false,
    canvas: null,
    ctx: null,
    layers: [],
    selectedLayerId: null,
    activeTool: 'move',
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    dragLayerOffset: { x: 0, y: 0 },

    // helpers
    getSelectedLayer() {
      return this.layers.find(l => l.id === this.selectedLayerId);
    },

    markAsModified() {
      this.hasUnsavedChanges = true;
    },

    markAsSaved() {
      this.hasUnsavedChanges = false;
    },

    addLayer(imageData = null, width = null, height = null, name = "Layer") {
      const canvas = this.canvas;
      width = width || canvas.width;
      height = height || canvas.height;

      let img = null;
      if (imageData) {
        img = new Image();
        img.src = imageData;
      } else {
        // Create a white canvas for new layers
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, width, height);
        
        img = new Image();
        img.src = tempCanvas.toDataURL();
      }

      const layer = {
        id: `layer-${nextLayerId++}`,
        name: `${name} ${nextLayerId - 1}`,
        x: 0,
        y: 0,
        width,
        height,
        visible: true,
        image: img,
        isLoaded: false // Always false initially, will be set to true in onload
      };

      img.onload = () => {
        layer.isLoaded = true;
        if (imageData) {
          // For uploaded images, use their dimensions and center them
          layer.width = img.width;
          layer.height = img.height;
          layer.x = (canvas.width - img.width) / 2;
          layer.y = (canvas.height - img.height) / 2;
        }
        // For white layers, keep the specified width/height and position at 0,0
        render();
      };
      img.onerror = () => {
        console.error("Failed to load image for layer");
        layer.isLoaded = true;
      };

      this.layers.unshift(layer);
      this.selectedLayerId = layer.id;
      this.markAsModified();
      return layer;
    },

    addTextLayer(text = "Sample text", x = 100, y = 100, fontSize = 24, color = "#000000") {
      const layer = {
        id: `layer-${nextLayerId++}`,
        name: `Text ${nextLayerId - 1}`,
        type: 'text',
        x,
        y,
        width: 200, // Initial width, will be calculated based on text
        height: fontSize * 1.2, // Initial height based on font size
        visible: true,
        text,
        fontSize,
        color,
        fontFamily: 'Arial',
        isLoaded: true,
        isEditing: false
      };

      this.layers.unshift(layer);
      this.selectedLayerId = layer.id;
      this.markAsModified();
      return layer;
    }
  };
}