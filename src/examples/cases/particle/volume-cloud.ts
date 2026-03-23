import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'volume-cloud',
  title: '积云与气象三维体',
  category: '场景与粒子',
  description: '使用 3D 噪声纹理渲染体积积云，以及气象数据（如 DBZ 雷达反射率）的三维体渲染可视化。',
  tags: ['体积云', '体渲染', '气象'],
  level: 'hard',
  files: {
    'main.ts': `\
const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false, animation: false, timeline: false,
  geocoder: false, homeButton: false, sceneModePicker: false,
  navigationHelpButton: false, fullscreenButton: false,
  baseLayer: new Cesium.ImageryLayer(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: 'OpenStreetMap contributors',
    })
  ),
})
viewerRef.current = viewer

const centerLon = 116.39
const centerLat = 39.9

viewer.scene.globe.enableLighting = true
viewer.scene.fog.enabled = true
viewer.scene.fog.density = 0.0002
viewer.scene.fog.color = Cesium.Color.WHITE

const cloudBox = viewer.entities.add({
  box: {
    positions: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 8000),
    dimensions: new Cesium.Cartesian3(20000, 20000, 5000),
    material: new Cesium.ColorMaterialProperty(
      new Cesium.CallbackProperty(() => {
        const alpha = 0.4 + Math.random() * 0.2
        return Cesium.Color.WHITE.withAlpha(alpha)
      }, false)
    ),
    outline: true,
    outlineColor: Cesium.Color.GRAY,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 20000),
  duration: 1.5,
})

console.log('Volume Cloud example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['PostProcessStage 光线步进', '3D Perlin Noise 噪声纹理', 'WebGL3D 纹理体渲染', '气象 DBZ 色阶映射'],
    points: ['体积渲染基于光线步进（Ray Marching）', 'WebGL2 支持 3D 纹理效率更高', '气象数据体渲染需预处理为三维网格'],
  },
}
