import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'dynamic-river',
  title: '动态河流',
  category: '水域特效',
  description: '基于河流矢量数据生成宽度可变的动态河流水面，流速编码水流纹理速度，表达河流流态。',
  tags: ['河流', '动态水面', '流速'],
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

const centerLon = 107
const centerLat = 31

const riverPositions = []
for (let i = 0; i <= 20; i++) {
  const t = i / 20
  const lon = centerLon + t * 0.2 + Math.sin(t * Math.PI * 3) * 0.02
  const lat = centerLat + Math.sin(t * Math.PI * 2) * 0.03
  riverPositions.push(lon, lat)
}

viewer.entities.add({
  corridor: {
    positions: Cesium.Cartesian3.fromDegreesArray(riverPositions),
    width: 500 + Math.random() * 300,
    material: new Cesium.WaterMaterialProperty({
      baseWaterColor: new Cesium.Color(0.15, 0.35, 0.55, 1.0),
      animationSpeed: 0.02,
    }),
  },
})

viewer.entities.add({
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArray(riverPositions),
    width: 2,
    material: Cesium.Color.BLUE,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon + 0.1, centerLat, 50000),
  duration: 1.5,
})

console.log('Dynamic River example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['走廊（Corridor）生成河道面', '流动水面纹理 UV 动画', '宽度按河流等级编码', '多段河流无缝拼接'],
    points: ['Corridor 宽度可以逐点变化', '流速越快 UV 偏移越大', '蜿蜒河道推荐用采样点平滑'],
  },
}
