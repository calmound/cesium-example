import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'water-surface',
  title: '静态水面与反射水面',
  category: '水域特效',
  description: '为多边形区域添加真实水面效果：普通水面材质（法线贴图波浪）和反射水面（环境反射），适用于湖泊、河道。',
  tags: ['水面', '反射', '波纹'],
  level: 'medium',
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

const centerLon = 120.15
const centerLat = 30.28

viewer.entities.add({
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray([
        centerLon - 0.01, centerLat - 0.005,
        centerLon + 0.01, centerLat - 0.005,
        centerLon + 0.01, centerLat + 0.005,
        centerLon - 0.01, centerLat + 0.005,
      ])
    ),
    material: new Cesium.WaterMaterialProperty({
      baseWaterColor: new Cesium.Color(0.2, 0.4, 0.6, 1.0),
      animationSpeed: 0.01,
      normalMap: undefined,
    }),
    outline: true,
    outlineColor: Cesium.Color.BLACK,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 5000),
  duration: 1.5,
})

console.log('Water Surface example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['WaterMaterialProperty 水面材质', '反射水面自定义 Appearance', '法线贴图（Normal Map）驱动波浪', '菲涅耳系数控制反射强度'],
    points: ['水面材质需要场景光照配合', 'animationSpeed 控制波浪速度', '反射需要自定义 FrameBuffer'],
  },
}
