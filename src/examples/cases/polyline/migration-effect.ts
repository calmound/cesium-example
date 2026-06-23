import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'migration-effect',
  title: '迁徙流动效果',
  category: '线与路径',
  description: '实现城市间人口迁徙、货物流动的动态弧线效果，使用干净的主弧线和少量尾迹粒子表达方向与强度。',
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

viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#06111f')
viewer.scene.skyAtmosphere.hueShift = -0.1
viewer.scene.skyAtmosphere.saturationShift = -0.2
viewer.scene.skyAtmosphere.brightnessShift = -0.15

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
      fillColor: Cesium.Color.fromCssColorString('#f8fafc'),
      outlineColor: Cesium.Color.fromCssColorString('#020617'),
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10),
    },
    point: {
      pixelSize: 8,
      color: Cesium.Color.fromCssColorString('#f97316'),
      outlineColor: Cesium.Color.fromCssColorString('#fff7ed'),
      outlineWidth: 2,
    },
  })
})

// ── 弧线计算 ────────────────────────────────────────
function getArcPoint(
  from: [number, number],
  to: [number, number],
  t: number,
  peakHeight: number
): Cesium.Cartesian3 {
  const lon = Cesium.Math.lerp(from[0], to[0], t)
  const lat = Cesium.Math.lerp(from[1], to[1], t)
  const height = Math.sin(t * Math.PI) * peakHeight
  return Cesium.Cartesian3.fromDegrees(lon, lat, height)
}

const maxFlow = Math.max(...migrationData.map((d) => d.flow))
function flowToWidth(flow: number): number {
  return 1.5 + (flow / maxFlow) * 2.5
}

const routes = migrationData.map((item) => {
  const start = Cesium.Cartesian3.fromDegrees(item.from[0], item.from[1], 0)
  const end = Cesium.Cartesian3.fromDegrees(item.to[0], item.to[1], 0)
  const distance = Cesium.Cartesian3.distance(start, end)
  const peakHeight = distance * 0.16
  const arcPoints: Cesium.Cartesian3[] = []
  for (let i = 0; i <= 80; i++) {
    arcPoints.push(getArcPoint(item.from, item.to, i / 80, peakHeight))
  }
  return { ...item, peakHeight, arcPoints }
})

// 添加迁徙弧线（静态部分）
routes.forEach(({ flow, arcPoints }) => {
  const width = flowToWidth(flow)
  viewer.entities.add({
    polyline: {
      positions: arcPoints,
      width: width + 1.8,
      material: Cesium.Color.fromCssColorString('#0f172a').withAlpha(0.32),
    },
  })

  viewer.entities.add({
    polyline: {
      positions: arcPoints,
      width,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.16,
        color: Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.72),
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
  scale: number
}

const particles: Particle[] = []
const particlesPerRoute = 2
const maxParticles = routes.length * particlesPerRoute

routes.forEach((route, i) => {
  const flowRatio = route.flow / maxFlow
  for (let j = 0; j < particlesPerRoute; j++) {
    particles.push({
      odIndex: i,
      t: Math.random(),
      speed: 0.0035 + flowRatio * 0.004 + Math.random() * 0.0015,
      scale: 0.75 + flowRatio * 0.85,
    })
  }
})

const particleCollection = viewer.scene.primitives.add(new Cesium.BillboardCollection())

function createParticleImage(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(16, 16, 2, 16, 16, 14)
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
  gradient.addColorStop(0.45, 'rgba(125,211,252,0.9)')
  gradient.addColorStop(1, 'rgba(56,189,248,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 32, 32)
  return canvas
}

const particleImage = createParticleImage()
const particleBillboards: Cesium.Billboard[] = []
particles.slice(0, maxParticles).forEach((p, idx) => {
  const route = routes[p.odIndex]
  const pos = getArcPoint(route.from, route.to, p.t, route.peakHeight)

  const billboard = particleCollection.add({
    position: pos,
    image: particleImage,
    width: 14 * p.scale,
    height: 14 * p.scale,
    color: Cesium.Color.fromCssColorString('#e0f2fe').withAlpha(0.9),
    scaleByDistance: new Cesium.NearFarScalar(800000, 1, 5000000, 0.45),
  })
  particleBillboards.push(billboard)
})

console.log(\`🚀 添加 \${maxParticles} 个迁徙粒子（动态流动）\`)

// ── 粒子动画更新 ────────────────────────────────────
viewer.scene.preUpdate.addEventListener(() => {
  particleBillboards.forEach((billboard, idx) => {
    const p = particles[idx]
    if (!p) return

    const route = routes[p.odIndex]
    p.t += p.speed
    if (p.t > 1) {
      p.t = 0
      p.odIndex = (p.odIndex + 1) % routes.length
    }

    const nextRoute = routes[p.odIndex]
    const pos = getArcPoint(nextRoute.from, nextRoute.to, p.t, nextRoute.peakHeight)
    billboard.position = pos
    billboard.color = Cesium.Color.fromCssColorString('#e0f2fe').withAlpha(0.45 + Math.sin(p.t * Math.PI) * 0.4)
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
    features: ['平滑经纬度弧线插值', '双层主弧线增强层次', '少量尾迹粒子表达方向', '流量驱动线宽与粒子速度'],
    points: ['避免把 Cartesian 世界坐标误当成经纬度参与插值', '粒子数量控制在每条线 1-2 个更利于阅读', '主线颜色统一后再用亮粒子强调动势，画面更稳定'],
  },
}
