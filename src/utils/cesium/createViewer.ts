export interface CreateViewerOptions {
  containerId?: string
  token?: string
}

export function getDefaultViewerOptions() {
  return {
    baseLayerPicker: false,
    animation: false,
    timeline: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    fullscreenButton: false,
  }
}
