/**
 * Application Constants
 * Centralized location for all hardcoded values used throughout the application
 */

// Canvas and Drawing Constants
export const CANVAS = {
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  SNAP_THRESHOLD: 10,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 5.0
};

// UI Colors
export const COLORS = {
  PRIMARY: '#0078d7',
  ACCENT: '#ff0080',
  SUCCESS: '#107c10',
  WARNING: '#ff8c00',
  ERROR: '#d13438',
  BACKGROUND: '#f3f2f1',
  BORDER: '#edebe9',
  TEXT_PRIMARY: '#323130',
  TEXT_SECONDARY: '#605e5c'
};

// UI Timing
export const TIMING = {
  UNDO_FEEDBACK_DURATION: 2000, // milliseconds
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 250,
  TOOLTIP_DELAY: 500
};

// UI Dimensions
export const UI = {
  TOOLBAR_HEIGHT: 48,
  SIDEBAR_WIDTH: 280,
  PANEL_PADDING: 16,
  BUTTON_HEIGHT: 32,
  INPUT_HEIGHT: 28,
  BORDER_RADIUS: 4
};

// Crop Tool Presets
export const CROP_PRESETS = {
  SQUARE: { width: 1, height: 1, label: '1:1' },
  LANDSCAPE: { width: 16, height: 9, label: '16:9' },
  PORTRAIT: { width: 9, height: 16, label: '9:16' },
  PHOTO: { width: 4, height: 3, label: '4:3' },
  WIDE: { width: 21, height: 9, label: '21:9' }
};

// Text and Font Constants
export const TEXT = {
  DEFAULT_FONT_SIZE: 16,
  MIN_FONT_SIZE: 8,
  MAX_FONT_SIZE: 72,
  DEFAULT_FONT_FAMILY: 'Arial, sans-serif',
  LINE_HEIGHT: 1.2,
  SAMPLE_TEXT: 'Sample text'
};

// File and Export Constants
export const FILE = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  DEFAULT_QUALITY: 0.9,
  DEFAULT_FORMAT: 'png'
};

// Grid and Guides
export const GRID = {
  DEFAULT_SIZE: 20,
  MIN_SIZE: 5,
  MAX_SIZE: 100,
  OPACITY: 0.3,
  COLOR: '#cccccc'
};

// Layer Constants
export const LAYER = {
  MAX_LAYERS: 50,
  DEFAULT_OPACITY: 1.0,
  MIN_OPACITY: 0.0,
  MAX_OPACITY: 1.0
};