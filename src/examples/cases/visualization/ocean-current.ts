import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'ocean-current',
  title: '海流可视化',
  category: '数据可视化',
  description: '渲染全球或区域海流流向数据，结合流线粒子与矢量箭头双重展示方式，支持深度分层浏览。',
  tags: ['海流', '流场', '海洋'],
  level: 'hard',
  files: {
    'main.ts': `// 海流可视化示例
// 渲染海流流向数据

const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false, animation: false, timeline: false,
  geocoder: false, homeButton: false, sceneModePicker: false,
  navigationHelpButton: false, fullfullscreenButton: false,
  baseLayer: new Cesium.ImageryLayer(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: 'OpenStreetMap contributors',
    })
  ),
})
viewerRef.current = viewer

// ── 1. 模拟海流数据 ───────────────────────────────────────────
const oceanCurrents: { lon: number; lat: number; dir: number; speed: number }[] = []

// 模拟太平洋黑潮暖流
for (let i = 0; i < 30; i++) {
  for (let j = 0; j < 15; j++) {
    const lon = 120 + i * 0.2
    const lat = 20 + j * 1.5
    // 黑潮方向：大致从西南向东北
    const dir = Math.PI / 4 + Math.sin(i * 0.2) * 0.3
    const speed = 1.5 + Math.random() * 1.5
    oceanCurrents.push({ lon, lat, dir, speed })
  }
}

// ── 2. 添加海流箭头 ──────────────────────────────────────────
oceanCurrents.forEach((current, index) => {
  if (index % 4 !== 0) return

  const arrowLen = current.speed * 5000
  const endLon = current.lon + Math.cos(current.dir) * arrowLen / 111000
  const endLat = current.lat + Math.sin(current.dir) * arrowLen / 111000

  // 速度映射颜色
  const t = (current.speed - 0.5) / 2
  const color = Cesium.Color.fromCssColorString('#1e90ff').lerp(
    Cesium.Color.fromCssColorString('#ff4500'),
    t
  )

  viewer.entities.add({
    name: '海流_' + index,
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray([current.lon, current.lat, endLon, endLat]),
      width: 2,
      material: color,
    },
    point: {
      pixelSize: 4,
      color: color,
    },
  })
})

// ── 3. 添加洋流标签 ─────────────────────────────────────────
const majorCurrents = [
  { name: '黑潮', lon: 140, lat: 30 },
  { name: '北太平洋流', lon: 160, lat: 40 },
  { name: '加利福尼亚流', lon: 130, lat: 25 },
]

majorCurrents.forEach((c) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(c.lon, c.lat),
    label: {
      text: c.name,
      font: 'bold 14px sans-serif',
      fillColor: Cesium.Color.CYAN,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10),
    },
  })
})

// ── 4. 海流动画 ───────────────────────────────────────────────
let time = 0
const flowParticles: { lon: number; lat: number; speed: number; dir: number; age: number }[] = []

viewer.scene.preRender.addEventListener(() => {
  time += 0.01

  // 添加新粒子
  if (Math.random() > 0.8) {
    flowParticles.push({
      lon: 120 + Math.random() * 10,
      lat: 20 + Math.random() * 20,
      speed: 1 + Math.random() * 1.5,
      dir: Math.PI / 4 + Math.random() * 0.5,
      age: 0,
    })
  }

  // 更新粒子
  flowParticles.forEach((p) => {
    p.lon += Math.cos(p.dir) * p.speed * 0.0005
    p.lat += Math.sin(p.dir) * p.speed * 0.0005
    p.age++
  })

  // 过滤超出范围或过老的粒子
  flowParticles = flowParticles.filter(
    (p) => p.lon < 160 && p.lon > 115 && p.lat < 45 && p.lat > 15 && p.age < 200
  )
})

console.log('🌊 已添加', oceanCurrents.length, '个海流数据点')
console.log('🔄 粒子动画模拟洋流流动')
console.log('📊 实际项目需要接入海洋数据（ROMS、HYCOM 等）')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(140, 30, 5000000),
  duration: 2,
  complete: () => console.log('🌊 海流可视化已启动'),
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['NetCDF 数据解析与格式化', '流线粒子系统', '矢量箭头密度控制', '深度分层数据切换'],
    points: ['海流速度远小于风速，粒子生命期需更长', '箭头大小按流速归一化', '深度层数据需额外维度索引'],
  },
}
