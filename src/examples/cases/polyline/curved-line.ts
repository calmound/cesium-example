import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'curved-line',
  title: '曲线与 OD 弧线',
  category: '线与路径',
  description: '生成平滑贝塞尔曲线和抛物线弧线，用于展示城市间的 OD（起终点）流量，实现迁徙地图效果。',
  tags: ['曲线', 'OD线', '迁徙'],
  level: 'medium',
  files: {
    'main.ts': `// 曲线与 OD 弧线示例
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

// ── 城市 OD 数据 ─────────────────────────────────────
const cities = [
  { name: '北京', lon: 116.39, lat: 39.9 },
  { name: '上海', lon: 121.47, lat: 31.23 },
  { name: '广州', lon: 113.26, lat: 23.13 },
  { name: '成都', lon: 104.06, lat: 30.67 },
  { name: '武汉', lon: 114.31, lat: 30.52 },
  { name: '西安', lon: 108.94, lat: 34.34 },
]

const odFlows = [
  { from: 0, to: 1, flow: 850 },
  { from: 0, to: 2, flow: 620 },
  { from: 0, to: 3, flow: 430 },
  { from: 1, to: 2, flow: 780 },
  { from: 1, to: 3, flow: 350 },
  { from: 2, to: 4, flow: 520 },
  { from: 3, to: 5, flow: 410 },
]

cities.forEach((city) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(city.lon, city.lat),
    label: {
      text: city.name,
      font: 'bold 14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10),
    },
    point: {
      pixelSize: 8,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
  })
})

// ── 计算贝塞尔曲线点 ───────────────────────────────
function bezierCurve(p0: Cesium.Cartesian3, p1: Cesium.Cartesian3, p2: Cesium.Cartesian3, segments: number): Cesium.Cartesian3[] {
  const points: Cesium.Cartesian3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y
    const z = (1 - t) * (1 - t) * p0.z + 2 * (1 - t) * t * p1.z + t * t * p2.z
    points.push(new Cesium.Cartesian3(x, y, z))
  }
  return points
}

// ── 流量归一化到宽度 ───────────────────────────────
const maxFlow = Math.max(...odFlows.map((f) => f.flow))
function flowToWidth(flow: number): number {
  return 1 + (flow / maxFlow) * 4
}

// ── 添加 OD 弧线 ───────────────────────────────────
odFlows.forEach(({ from, to, flow }) => {
  const start = Cesium.Cartesian3.fromDegrees(cities[from].lon, cities[from].lat, 0)
  const end = Cesium.Cartesian3.fromDegrees(cities[to].lon, cities[to].lat, 0)
  const distance = Cesium.Cartesian3.distance(start, end)
  const arcHeight = distance * 0.3

  const mid = Cesium.Cartesian3.midpoint(start, end, new Cesium.Cartesian3())
  const midHigh = Cesium.Cartesian3.fromDegrees(
    (cities[from].lon + cities[to].lon) / 2,
    (cities[from].lat + cities[to].lat) / 2,
    arcHeight
  )

  const arcPoints = bezierCurve(start, midHigh, end, 100)

  viewer.entities.add({
    polyline: {
      positions: arcPoints,
      width: flowToWidth(flow),
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        color: Cesium.Color.fromHsl((1 - flow / maxFlow) * 0.4 + 0.5, 0.8, 0.6),
      }),
    },
  })
})

console.log(\`✅ 添加 \${odFlows.length} 条 OD 弧线（贝塞尔曲线）\`)
console.log('💡 弧线宽度编码流量强度（1-5px）')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(112, 32, 3000000),
  duration: 2,
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['贝塞尔曲线采样点计算', '抛物线弧高度公式', 'SampledPositionProperty 弧线动画', 'OD 流量粗细编码'],
    points: ['弧线采样点越多越平滑（推荐 100 个点）', 'OD 宽度可按流量归一化', '大量 OD 线改用 Primitive 批量渲染'],
  },
}
