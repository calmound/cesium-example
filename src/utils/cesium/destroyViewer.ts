export function safeDestroyViewer(viewer: unknown): Promise<void> {
  return new Promise((resolve) => {
    if (!viewer) {
      resolve()
      return
    }
    try {
      const v = viewer as { destroy?: () => void; isDestroyed?: () => boolean }
      if (v.isDestroyed && !v.isDestroyed()) {
        v.destroy?.()
      }
    } catch (e) {
      console.warn('Error destroying Cesium viewer:', e)
    }
    // Give WebGL context 50ms to recover
    setTimeout(resolve, 50)
  })
}
