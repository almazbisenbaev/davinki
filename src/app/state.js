let nextLayerId = 1;

export function initAppState() {
  return {
    isProjectLoaded: false,
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

    addLayer(imageData = null, width = null, height = null, name = "Layer") {
      const canvas = this.canvas;
      width = width || canvas.width;
      height = height || canvas.height;

      let img = null;
      if (imageData) {
        img = new Image();
        img.src = imageData;
      }

      const layer = {
        id: `layer-${nextLayerId++}`,
        name: `${name} ${nextLayerId - 1}`,
        x: 0,
        y: 0,
        width,
        height,
        visible: true,
        image: img, // null for empty layers
        isLoaded: !img // if no image, consider loaded
      };

      if (img) {
        img.onload = () => {
          layer.isLoaded = true;
          layer.width = img.width;
          layer.height = img.height;
          // center image on canvas
          layer.x = (canvas.width - img.width) / 2;
          layer.y = (canvas.height - img.height) / 2;
          render();
        };
        img.onerror = () => {
          console.error("Failed to load image for layer");
          layer.isLoaded = true;
        };
      }

      this.layers.unshift(layer);
      this.selectedLayerId = layer.id;
      return layer;
    }
  };
}