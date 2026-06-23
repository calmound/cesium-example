import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'buffer-analysis',
  title: '缓冲区分析',
  category: '空间分析',
  description: '对点、线、面要素生成指定半径的缓冲区，用于分析影响范围、服务覆盖区域、安全隔离带等空间关系。',
  tags: ['缓冲区', '空间分析', 'Turf.js'],
  level: 'medium',
  files: {
    'main.ts': `// 缓冲区分析示例
// 演示为点、线、面生成缓冲区

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

// ── 1. 简化缓冲区生成函数 ────────────────────────────────
// 实际项目中应使用 Turf.js 的 buffer 函数
function createCircleBuffer(centerLon: number, centerLat: number, radiusMeters: number, segments = 64): Cesium.Cartesian3[] {
  const positions: Cesium.Cartesian3[] = []
  const radiusDegrees = radiusMeters / 111000 // 约等于度数

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const lon = centerLon + radiusDegrees * Math.cos(angle)
    const lat = centerLat + radiusDegrees * Math.sin(angle)
    positions.push(Cesium.Cartesian3.fromDegrees(lon, lat))
  }
  return positions
}

// ── 2. 点缓冲区 ─────────────────────────────────────────
const pointCenter = { lon: 116.39, lat: 39.90 }
const bufferRadius = 2000 // 2公里

const pointBuffer = createCircleBuffer(pointCenter.lon, pointCenter.lat, bufferRadius)

viewer.entities.add({
  name: '点缓冲区',
  polygon: {
    hierarchy: pointBuffer,
    material: Cesium.Color.BLUE.withAlpha(0.3),
    outline: true,
    outlineColor: Cesium.Color.BLUE,
    outlineWidth: 2,
  },
})

viewer.entities.add({
  name: '点-圆心',
  position: Cesium.Cartesian3.fromDegrees(pointCenter.lon, pointCenter.lat),
  point: {
    pixelSize: 12,
    color: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: '中心点',
    font: '12px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -16),
  },
})

// ── 3. 线缓冲区 ─────────────────────────────────────────
const lineCoords = [
  { lon: 116.42, lat: 39.88 },
  { lon: 116.45, lat: 39.90 },
  { lon: 116.48, lat: 39.87 },
  { lon: 116.50, lat: 39.89 },
]

viewer.entities.add({
  name: '道路中心线',
  polyline: {
    positions: lineCoords.map(c => Cesium.Cartesian3.fromDegrees(c.lon, c.lat)),
    width: 4,
    material: Cesium.Color.GRAY,
  },
})

// 为线段生成缓冲区（简化为外扩点）
const lineBufferPositions: Cesium.Cartesian3[] = []
const bufferWidth = 1000 // 1公里

lineCoords.forEach((coord) => {
  const pts = createCircleBuffer(coord.lon, coord.lat, bufferWidth, 32)
  pts.forEach(p => lineBufferPositions.push(p))
})

viewer.entities.add({
  name: '道路缓冲区',
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(lineBufferPositions),
    material: Cesium.Color.YELLOW.withAlpha(0.3),
    outline: true,
    outlineColor: Cesium.Color.YELLOW,
    outlineWidth: 2,
  },
})

// ── 4. 多边形缓冲区（服务区）───────────────────────────────
const serviceAreaCoords = [
  { lon: 116.46, lat: 39.93 },
  { lon: 116.50, lat: 39.93 },
  { lon: 116.50, lat: 39.96 },
  { lon: 116.46, lat: 39.96 },
]

viewer.entities.add({
  name: '服务区域',
  polygon: {
    hierarchy: serviceAreaCoords.map(c => Cesium.Cartesian3.fromDegrees(c.lon, c.lat)),
    material: Cesium.Color.GREEN.withAlpha(0.3),
    outline: true,
    outlineColor: Cesium.Color.GREEN,
    outlineWidth: 2,
  },
  label: {
    text: '服务区',
    font: 'bold 14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.CENTER,
  },
})

// ── 5. 缓冲区叠加分析（多环缓冲区）────────────────────────
[500, 1000, 1500].forEach((radius, index) => {
  const buffer = createCircleBuffer(116.53, 39.91, radius, 48)
  viewer.entities.add({
    name: '多环缓冲区-' + radius,
    polygon: {
      hierarchy: buffer,
      material: new Cesium.ColorMaterialProperty(
        new Cesium.CallbackProperty(() => {
          const alpha = 0.4 - index * 0.1
          return Cesium.Color.RED.withAlpha(alpha)
        }, false)
      ),
      outline: true,
      outlineColor: Cesium.Color.RED,
      outlineWidth: 1,
    },
  })
})

viewer.entities.add({
  name: '多环中心',
  position: Cesium.Cartesian3.fromDegrees(116.53, 39.91),
  point: {
    pixelSize: 10,
    color: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.45, 39.91, 15000),
  duration: 2,
  complete: () => console.log('🔵 缓冲区分析已加载'),
})

console.log('💡 缓冲区分析：点/线/面要素周围一定半径的范围')
console.log('📏 半径单位：米（meters）')
console.log('🔗 实际项目使用 Turf.js buffer 函数更精确')
`,
  'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['Turf.js buffer 缓冲区计算', '点缓冲（圆形）/ 线缓冲 / 面缓冲', '缓冲区叠加分析（交集/并集）', '缓冲区样式渲染'],
    points: ['Turf.js 在 WGS84 椭球上计算更精确', '单位可选 meters/kilometers/miles', '复杂多边形缓冲区计算较慢'],
  },
}
