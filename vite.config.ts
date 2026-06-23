import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const cesiumToken = env.VITE_CESIUM_TOKEN ?? ''

  return {
    plugins: [react(), cesium()],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    define: {
      __CESIUM_TOKEN__: JSON.stringify(cesiumToken),
    },
    build: { assetsInlineLimit: 0 },
  }
})
