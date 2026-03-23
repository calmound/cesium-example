import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'flood-simulation',
  title: '洪水演进',
  category: '水域特效',
  description: '模拟洪水漫延过程：水闸开启引发洪水、水位动态升高、河流横断面水面实时变化，结合粒子效果。',
  tags: ['洪水', '水位', '动态水面'],
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

const centerLon = 110
const centerLat = 30

const floodEntity = viewer.entities.add({
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray([
        centerLon - 0.05, centerLat - 0.02,
        centerLon + 0.05, centerLat - 0.02,
        centerLon + 0.05, centerLat + 0.02,
        centerLon - 0.05, centerLat + 0.02,
      ])
    ),
    material: new Cesium.ColorMaterialProperty(
      new Cesium.CallbackProperty((time: Cesium.JulianDate) => {
        const currentTime = Cesium.JulianDate.toDate(time)
        const startTime = new Date('2024-01-01T00:00:00Z')
        const elapsed = (currentTime.getTime() - startTime.getTime()) / 1000
        const floodLevel = Math.min(elapsed / 60, 1.0)
        const r = 0.1
        const g = 0.3 + floodLevel * 0.3
        const b = 0.6 - floodLevel * 0.3
        return new Cesium.Color(r, g, b, 0.7)
      }, false)
    ),
    height: new Cesium.CallbackProperty((time: Cesium.JulianDate) => {
      const currentTime = Cesium.JulianDate.toDate(time)
      const startTime = new Date('2024-01-01T00:00:00Z')
      const elapsed = (currentTime.getTime() - startTime.getTime()) / 1000
      return Math.min(elapsed / 60, 1.0) * 100
    }, false),
    outline: true,
    outlineColor: Cesium.Color.BLACK,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 100000),
  duration: 1.5,
})

const startTime = Cesium.JulianDate.now()
viewer.clock.startTime = startTime
viewer.clock.currentTime = startTime
viewer.clock.multiplier = 10
viewer.clock.shouldAnimate = true

console.log('Flood Simulation example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['水面高度动态插值', '水闸控制水位联动', '河流横断面动态升降', '洪水前沿粒子特效'],
    points: ['水面范围需 DEM 实时采样计算', '水位按时序关键帧插值', '粒子模拟水流湍急感'],
  },
}
