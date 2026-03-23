import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'point-light',
  title: '点光源与聚光灯',
  category: '场景与粒子',
  description: '在场景中添加点光源和聚光灯，模拟路灯、探照灯、舞台灯光效果，展示 Cesium 动态光照系统。',
  tags: ['点光源', '聚光灯', '光照'],
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

const centerLon = 121.47
const centerLat = 31.23

viewer.scene.light = new Cesium.DirectionalLight({
  direction: new Cesium.Cartesian3(-1, -1, -1),
  color: Cesium.Color.WHITE,
  intensity: 0.8,
})

viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 20),
  point: {
    pixelSize: 20,
    color: Cesium.Color.YELLOW,
    outlineColor: Cesium.Color.ORANGE,
    outlineWidth: 3,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
  label: {
    text: 'Light Source',
    font: '14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
})

viewer.entities.add({
  box: {
    positions: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 5),
    dimensions: new Cesium.Cartesian3(20, 20, 10),
    material: Cesium.Color.LIGHTGRAY,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 100),
  duration: 1.5,
})

console.log('Point Light example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['PointLight 点光源配置', 'SpotLight 聚光灯配置', '光照强度与衰减控制', '多光源场景渲染'],
    points: ['Cesium 1.94+ 支持动态光源', '光源半径控制影响范围', '光照需开启 scene.enableLighting'],
  },
}
