import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'smart-traffic',
  title: '智慧交通',
  category: '综合应用',
  description: '实时展示城市交通流量、路段拥堵状态、车辆轨迹回放，结合热力图与流线图呈现交通宏观态势。',
  tags: ['交通', '流量', '拥堵'],
  level: 'hard',
  files: {
    'main.ts': `// 智慧交通示例
// 演示交通态势可视化

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

// ── 1. 路网数据 ─────────────────────────────────────────
const roads = [
  { name: '世纪大道', coords: [[121.47, 31.23], [121.48, 31.24], [121.49, 31.25]], level: 'main' },
  { name: '人民路', coords: [[121.46, 31.22], [121.47, 31.23], [121.48, 31.24]], level: 'main' },
  { name: '解放路', coords: [[121.47, 31.20], [121.47, 31.22], [121.47, 31.24]], level: 'secondary' },
  { name: '建设路', coords: [[121.45, 31.23], [121.47, 31.23], [121.50, 31.23]], level: 'secondary' },
]

// ── 2. 拥堵等级颜色 ────────────────────────────────────
function getCongestionColor(level: string): Cesium.Color {
  switch (level) {
    case 'smooth': return Cesium.Color.GREEN
    case 'slow': return Cesium.Color.YELLOW
    case 'congested': return Cesium.Color.ORANGE
    case 'blocked': return Cesium.Color.RED
    default: return Cesium.Color.GRAY
  }
}

// ── 3. 添加路段 ─────────────────────────────────────────
const congestionLevels = ['smooth', 'slow', 'congested', 'blocked', 'slow', 'smooth', 'congested']

roads.forEach((road, roadIndex) => {
  const positions = road.coords.map(c => Cesium.Cartesian3.fromDegrees(c[0], c[1]))

  viewer.entities.add({
    name: road.name,
    polyline: {
      positions,
      width: road.level === 'main' ? 8 : 5,
      material: getCongestionColor(congestionLevels[roadIndex]),
    },
  })

  // 路段中心标签
  const midIdx = Math.floor(road.coords.length / 2)
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(road.coords[midIdx][0], road.coords[midIdx][1]),
    label: {
      text: road.name,
      font: '10px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    },
  })
})

// ── 4. 交通流量热力点 ────────────────────────────────────
const hotSpots = [
  { lon: 121.47, lat: 31.23, intensity: 95 },
  { lon: 121.475, lat: 31.235, intensity: 85 },
  { lon: 121.48, lat: 31.24, intensity: 72 },
  { lon: 121.465, lat: 31.225, intensity: 65 },
  { lon: 121.47, lat: 31.22, intensity: 55 },
]

hotSpots.forEach((spot) => {
  const t = spot.intensity / 100
  const color = Cesium.Color.lerp(
    Cesium.Color.fromCssColorString('#ff4500'),
    Cesium.Color.fromCssColorString('#ffff00'),
    t,
    new Cesium.Color()
  )

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(spot.lon, spot.lat, 10),
    ellipse: {
      semiMajorAxis: spot.intensity * 3,
      semiMinorAxis: spot.intensity * 2,
      material: color.withAlpha(0.4),
    },
  })
})

// ── 5. 车辆轨迹模拟 ─────────────────────────────────────
const vehiclePositions: { lon: number; lat: number; speed: number; heading: number }[] = []
for (let i = 0; i < 20; i++) {
  vehiclePositions.push({
    lon: 121.46 + Math.random() * 0.04,
    lat: 31.20 + Math.random() * 0.05,
    speed: 30 + Math.random() * 60,
    heading: Math.random() * Math.PI * 2,
  })
}

const vehicleEntities: Cesium.Entity[] = []
vehiclePositions.forEach((v, i) => {
  const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(v.lon, v.lat, 1),
    point: {
      pixelSize: 6,
      color: Cesium.Color.CYAN,
    },
  })
  vehicleEntities.push(entity)
})

// ── 6. 车辆移动动画 ───────────────────────────────────
function updateVehicles() {
  vehiclePositions.forEach((v, i) => {
    v.lon += Math.cos(v.heading) * 0.00005
    v.lat += Math.sin(v.heading) * 0.00005

    // 边界检测
    if (v.lon > 121.50 || v.lon < 121.45) v.heading += Math.PI / 2
    if (v.lat > 31.25 || v.lat < 31.20) v.heading += Math.PI / 2

    if (vehicleEntities[i]) {
      vehicleEntities[i].position = Cesium.Cartesian3.fromDegrees(v.lon, v.lat, 1)
    }
  })
}

viewer.scene.preRender.addEventListener(updateVehicles)

// ── 7. 图例 ─────────────────────────────────────────────
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(121.45, 31.20),
  label: {
    text: '拥堵等级: 🟢畅通 🟡缓慢 🟠拥堵 🔴阻塞',
    font: '11px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(121.47, 31.23, 5000),
  duration: 2,
  complete: () => console.log('🚗 智慧交通已加载'),
})

console.log('💡 交通态势可视化示例')
console.log('🟢🟡🟠🔴 颜色表示拥堵等级')
console.log('🔵 点为模拟车辆位置')
console.log('🟡 热点为交通流量大的区域')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['路网 GeoJSON 按拥堵着色', '车辆轨迹 CZML 回放', '交通流量热力图', '路段点击查询详情'],
    points: ['拥堵颜色：绿→黄→橙→红→深红', '车辆密度超 1000 改用 Primitive 渲染', '流量热力图建议 5 分钟刷新一次'],
  },
}
