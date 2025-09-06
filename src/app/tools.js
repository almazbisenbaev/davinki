// For now, only "move" tool — but structure ready for more

let appState;

export function initTools(state) {
  appState = state;
}

export function setActiveTool(toolName) {
  appState.activeTool = toolName;

  // Update UI
  document.querySelectorAll('.tool').forEach(el => {
    el.classList.toggle('active', el.dataset.tool === toolName);
  });
}