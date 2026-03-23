import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'migration-effect',
  title: '迁徙流动效果',
  category: '线与路径',
  description: '实现城市间人口迁徙、货物流动的动态弧线效果，粒子沿弧线运动，线宽表达流量强度。',
  tags: ['迁徙', '流动', '粒子'],
  level: 'medium',
  files: {
    'main.ts': `// 迁徙流动效果示例
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

// ── 迁徙数据 ───────────────────────────────────────
const migrationData = [
  { from: [116.39, 39.9], to: [121.47, 31.23], flow: 850, name: '北京→上海' },
  { from: [116.39, 39.9], to: [113.26, 23.13], flow: 620, name: '北京→广州' },
  { from: [116.39, 39.9], to: [104.06, 30.67], flow: 430, name: '北京→成都' },
  { from: [121.47, 31.23], to: [113.26, 23.13], flow: 780, name: '上海→广州' },
  { from: [113.26, 23.13], to: [114.31, 30.52], flow: 520, name: '广州→武汉' },
  { from: [104.06, 30.67], to: [108.94, 34.34], flow: 410, name: '成都→西安' },
]

// 城市位置映射
const cityCoords: Record<string, [number, number]> = {
  北京: [116.39, 39.9], 上海: [121.47, 31.23], 广州: [113.26, 23.13],
  成都: [104.06, 30.67], 武汉: [114.31, 30.52], 西安: [108.94, 34.34],
}

Object.entries(cityCoords).forEach(([name, [lon, lat]]) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    label: {
      text: name,
      font: 'bold 13px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -8),
    },
    point: {
      pixelSize: 10,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
  })
})

// ── 弧线粒子系统 ────────────────────────────────────
function getArcPosition(start: Cesium.Cartesian3, end: Cesium.Cartesian3, t: number): Cesium.Cartesian3 {
  const mid = Cesium.Cartesian3.midpoint(start, end, new Cesium.Cartesian3())
  const distance = Cesium.Cartesian3.distance(start, end)
  const height = distance * 0.4
  
  const midHigh = Cesium.Cartesian3.fromDegrees(
    (start.x + end.x) / 2,
    (start.y + end.y) / 2,
    height
  )

  const t1 = 1 - t
  return new Cesium.Cartesian3(
    t1 * t1 * start.x + 2 * t1 * t * midHigh.x + t * t * end.x,
    t1 * t1 * start.y + 2 * t1 * t * midHigh.y + t * t * end.y,
    t1 * t1 * start.z + 2 * t1 * t * midHigh.z + t * t * end.z
  )
}

const maxFlow = Math.max(...migrationData.map((d) => d.flow))
function flowToWidth(flow: number): number {
  return 1 + (flow / maxFlow) * 4
}

// 添加迁徙弧线（静态部分）
migrationData.forEach(({ from, to, flow }) => {
  const start = Cesium.Cartesian3.fromDegrees(from[0], from[1], 0)
  const end = Cesium.Cartesian3.fromDegrees(to[0], to[1], 0)
  
  const arcPoints: Cesium.Cartesian3[] = []
  for (let i = 0; i <= 50; i++) {
    arcPoints.push(getArcPosition(start, end, i / 50))
  }

  viewer.entities.add({
    polyline: {
      positions: arcPoints,
      width: flowToWidth(flow),
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.2,
        color: Cesium.Color.CYAN.withAlpha(0.5),
      }),
    },
  })
})

console.log(\`✅ 添加 \${migrationData.length} 条迁徙弧线\`)

// ── 粒子动画系统 ────────────────────────────────────
interface Particle {
  odIndex: number
  t: number
  speed: number
}

const particles: Particle[] = []
const maxParticles = 30

migrationData.forEach((_, i) => {
  for (let j = 0; j < 5; j++) {
    particles.push({
      odIndex: i,
      t: Math.random(),
      speed: 0.005 + Math.random() * 0.01,
    })
  }
})

const particleCollection = viewer.scene.primitives.add(new Cesium.BillboardCollection())

function createParticleImage(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 16
  canvas.height = 16
  const ctx = canvas.getContext('2d')!
  ctx.beginPath()
  ctx.arc(8, 8, 6, 0, Math.PI * 2)
  ctx.fillStyle = 'white'
  ctx.fill()
  return canvas
}

const particleBillboards: Cesium.Billboard[] = []
particles.slice(0, maxParticles).forEach((p, idx) => {
  const d = migrationData[p.odIndex]
  const start = Cesium.Cartesian3.fromDegrees(d.from[0], d.from[1], 0)
  const end = Cesium.Cartesian3.fromDegrees(d.to[0], d.to[1], 0)
  const pos = getArcPosition(start, end, p.t)

  const billboard = particleCollection.add({
    position: pos,
    image: createParticleImage(),
    width: 12,
    height: 12,
    color: Cesium.Color.fromHsl(0.5 + p.t * 0.2, 0.8, 0.6, 0.9),
  })
  particleBillboards.push(billboard)
})

console.log(\`🚀 添加 \${maxParticles} 个迁徙粒子（动态流动）\`)

// ── 粒子动画更新 ────────────────────────────────────
viewer.scene.preUpdate.addEventListener(() => {
  particleBillboards.forEach((billboard, idx) => {
    const p = particles[idx]
    if (!p) return
    
    const d = migrationData[p.odIndex]
    const start = Cesium.Cartesian3.fromDegrees(d.from[0], d.from[1], 0)
    const end = Cesium.Cartesian3.fromDegrees(d.to[0], d.to[1], 0)
    
    p.t += p.speed
    if (p.t > 1) {
      p.t = 0
      p.odIndex = Math.floor(Math.random() * migrationData.length)
    }
    
    const pos = getArcPosition(start, end, p.t)
    billboard.position = pos
  })
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(112, 32, 3500000),
  duration: 2,
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['弧线粒子动画系统', '流量驱动线宽编码', '颜色渐变表达方向', '起终点图标联动'],
    points: ['粒子沿弧线的参数化方程计算位置', '流量归一化后映射到 1-5px 宽度', '大量流线时限制同时显示的粒子数'],
  },
}
