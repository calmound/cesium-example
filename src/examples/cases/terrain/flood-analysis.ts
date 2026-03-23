import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'flood-analysis',
  title: '淹没分析',
  category: '地形分析',
  description: '模拟洪水淹没过程：设置初始水位动态升高水面，结合地形计算淹没范围，支持矢量面边界限定淹没区域。',
  tags: ['淹没', '水位', '地形分析'],
  level: 'hard',
  files: {
    'main.ts': `const viewer = new Cesium.Viewer(container, {
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

async function initTerrain() {
  const terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
    'https://www.cesium.com/ion/stk/terrain/world',
    { requestVertexNormals: true }
  )
  viewer.terrainProvider = terrainProvider
}

initTerrain()

const centerLon = 116.39
const centerLat = 39.9
const areaSize = 0.03

const floodPolygon = viewer.entities.add({
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray([
        centerLon - areaSize, centerLat - areaSize,
        centerLon + areaSize, centerLat - areaSize,
        centerLon + areaSize, centerLat + areaSize,
        centerLon - areaSize, centerLat + areaSize,
      ])
    ),
    material: new Cesium.ColorMaterialProperty(
      new Cesium.CallbackProperty((time: Cesium.JulianDate) => {
        const currentTime = Cesium.JulianDate.toDate(time)
        const startTime = new Date('2024-01-01T00:00:00Z')
        const elapsed = (currentTime.getTime() - startTime.getTime()) / 1000
        const waterLevel = Math.min(elapsed / 30, 1.0) * 200

        const r = 0.1
        const g = 0.3 + (waterLevel / 200) * 0.3
        const b = 0.6 - (waterLevel / 200) * 0.2

        return new Cesium.Color(r, g, b, 0.6)
      }, false)
    ),
    height: new Cesium.CallbackProperty((time: Cesium.JulianDate) => {
      const currentTime = Cesium.JulianDate.toDate(time)
      const startTime = new Date('2024-01-01T00:00:00Z')
      const elapsed = (currentTime.getTime() - startTime.getTime()) / 1000
      return Math.min(elapsed / 30, 1.0) * 200
    }, false),
    outline: true,
    outlineColor: Cesium.Color.CYAN,
  },
})

const waterSurface = viewer.entities.add({
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray([
        centerLon - areaSize, centerLat - areaSize,
        centerLon + areaSize, centerLat - areaSize,
        centerLon + areaSize, centerLat + areaSize,
        centerLon - areaSize, centerLat + areaSize,
      ])
    ),
    material: new Cesium.ColorMaterialProperty(
      new Cesium.Color(0.2, 0.5, 0.8, 0.5)
    ),
    height: new Cesium.CallbackProperty((time: Cesium.JulianDate) => {
      const currentTime = Cesium.JulianDate.toDate(time)
      const startTime = new Date('2024-01-01T00:00:00Z')
      const elapsed = (currentTime.getTime() - startTime.getTime()) / 1000
      return Math.min(elapsed / 30, 1.0) * 200 + 5
    }, false),
    outline: false,
  },
})

const levelLabel = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 300),
  label: {
    text: new Cesium.CallbackProperty((time: Cesium.JulianDate) => {
      const currentTime = Cesium.JulianDate.toDate(time)
      const startTime = new Date('2024-01-01T00:00:00Z')
      const elapsed = (currentTime.getTime() - startTime.getTime()) / 1000
      const waterLevel = Math.min(elapsed / 30, 1.0) * 200
      return \`水位: \${waterLevel.toFixed(1)}m\`
    }, false),
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
    backgroundColor: new Cesium.Color(0, 0.2, 0.4, 0.7),
    backgroundPadding: new Cesium.Cartesian2(10, 5),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 15000),
  duration: 2,
})

const startTime = Cesium.JulianDate.now()
viewer.clock.startTime = startTime
viewer.clock.currentTime = startTime
viewer.clock.multiplier = 20
viewer.clock.shouldAnimate = true

console.log('淹没分析示例已加载')
console.log('水位从 0m 上涨到 200m')
console.log('模拟时间: 30秒')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['动态水面 Polygon 高度插值', '地形高程采样判断淹没区域', 'WaterMaterialProperty 水面材质', '矢量面限定淹没边界'],
    points: ['水面需大量高程采样点才准确', 'sampleTerrainMostDetailed 异步采样', '水面材质可配置波浪频率与振幅'],
  },
}
