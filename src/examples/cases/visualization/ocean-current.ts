import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'ocean-current',
  title: '海流可视化',
  category: '数据可视化',
  description: '以西北太平洋区域为例，叠加海流速度底图、矢量箭头和流动粒子，展示海流方向、速度和主流轴结构。',
  tags: ['海流', '流场', '流线', '海洋'],
  level: 'hard',
  files: {
    'main.ts': `// 海流可视化示例
// 速度底图 + 海流箭头 + 粒子流动

const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false,
  animation: false,
  timeline: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,
  baseLayer: new Cesium.ImageryLayer(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: 'OpenStreetMap contributors',
    })
  ),
})
viewerRef.current = viewer

viewer.scene.globe.depthTestAgainstTerrain = true

type CurrentPoint = { lon: number; lat: number; u: number; v: number; speed: number }
type Particle = { lon: number; lat: number; age: number; ttl: number }

const west = 121
const east = 151
const south = 20
const north = 41
const rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north)

// ── 1. 构造区域海流场（模拟黑潮及其延伸）──────────────────────
const gridCols = 34
const gridRows = 24
const currentField: CurrentPoint[] = []

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

for (let row = 0; row < gridRows; row++) {
  const lat = lerp(south, north, row / (gridRows - 1))

  for (let col = 0; col < gridCols; col++) {
    const lon = lerp(west, east, col / (gridCols - 1))

    // 主流轴从台湾东北侧向日本东南海域延伸
    const coreLat = 0.56 * (lon - 121) + 21.5
    const distanceToCore = lat - coreLat
    const axialBoost = Math.exp(-(distanceToCore * distanceToCore) / 18)
    const northBranch = Math.exp(-((lon - 141) * (lon - 141) + (lat - 34) * (lat - 34)) / 35)

    const eastward = 0.18 + axialBoost * 1.95 + northBranch * 0.9
    const northward = 0.06 + axialBoost * 1.35 + Math.sin((lon - 121) * 0.22) * 0.12
    const gyre = Math.sin(lat * 0.35) * 0.16 - Math.cos(lon * 0.18) * 0.08

    const u = eastward + gyre
    const v = northward + gyre * 0.65
    const speed = Math.sqrt(u * u + v * v)

    currentField.push({ lon, lat, u, v, speed })
  }
}

const maxSpeed = Math.max(...currentField.map((point) => point.speed))
const minSpeed = Math.min(...currentField.map((point) => point.speed))

function normalizeSpeed(speed: number) {
  return clamp((speed - minSpeed) / (maxSpeed - minSpeed), 0, 1)
}

function getCurrentColor(speed: number) {
  const t = normalizeSpeed(speed)

  const colors = [
    Cesium.Color.fromCssColorString('#1d4ed8'),
    Cesium.Color.fromCssColorString('#06b6d4'),
    Cesium.Color.fromCssColorString('#67e8f9'),
    Cesium.Color.fromCssColorString('#facc15'),
    Cesium.Color.fromCssColorString('#f97316'),
  ]

  const segment = Math.min(Math.floor(t * (colors.length - 1)), colors.length - 2)
  const localT = t * (colors.length - 1) - segment
  return Cesium.Color.lerp(colors[segment], colors[segment + 1], localT, new Cesium.Color())
}

// ── 2. 生成海流速度底图 ──────────────────────────────────────
function createSpeedCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = gridCols
  canvas.height = gridRows
  const context = canvas.getContext('2d')!
  const imageData = context.createImageData(gridCols, gridRows)

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const point = currentField[row * gridCols + col]
      const color = getCurrentColor(point.speed)
      const flippedRow = gridRows - 1 - row
      const index = (flippedRow * gridCols + col) * 4
      imageData.data[index] = Math.round(color.red * 255)
      imageData.data[index + 1] = Math.round(color.green * 255)
      imageData.data[index + 2] = Math.round(color.blue * 255)
      imageData.data[index + 3] = 112
    }
  }

  context.putImageData(imageData, 0, 0)
  return canvas
}

const speedCanvas = createSpeedCanvas()
viewer.imageryLayers.addImageryProvider(
  new Cesium.SingleTileImageryProvider({
    url: speedCanvas.toDataURL('image/png'),
    rectangle,
    tileWidth: gridCols,
    tileHeight: gridRows,
  })
)

// ── 3. 采样绘制海流箭头 ──────────────────────────────────────
function metersPerDegreeLon(lat: number) {
  return 111320 * Math.cos(Cesium.Math.toRadians(lat))
}

function buildArrow(point: CurrentPoint) {
  const angle = Math.atan2(point.v, point.u)
  const arrowLength = 18000 + normalizeSpeed(point.speed) * 38000
  const lonOffset = (Math.cos(angle) * arrowLength) / metersPerDegreeLon(point.lat)
  const latOffset = (Math.sin(angle) * arrowLength) / 110540

  const endLon = point.lon + lonOffset
  const endLat = point.lat + latOffset
  const headScale = 0.28
  const headAngle = Cesium.Math.toRadians(24)
  const headLength = arrowLength * headScale

  const leftLon = endLon - (Math.cos(angle - headAngle) * headLength) / metersPerDegreeLon(point.lat)
  const leftLat = endLat - (Math.sin(angle - headAngle) * headLength) / 110540
  const rightLon = endLon - (Math.cos(angle + headAngle) * headLength) / metersPerDegreeLon(point.lat)
  const rightLat = endLat - (Math.sin(angle + headAngle) * headLength) / 110540

  return {
    shaft: [point.lon, point.lat, endLon, endLat],
    left: [leftLon, leftLat, endLon, endLat],
    right: [rightLon, rightLat, endLon, endLat],
  }
}

currentField.forEach((point, index) => {
  if (index % 3 !== 0) return

  const arrow = buildArrow(point)
  const color = getCurrentColor(point.speed)

  viewer.entities.add({
    name: '海流箭头_' + index,
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(arrow.shaft),
      width: 2.1,
      material: color.withAlpha(0.92),
      clampToGround: true,
    },
  })

  viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(arrow.left),
      width: 1.7,
      material: color.withAlpha(0.92),
      clampToGround: true,
    },
  })

  viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(arrow.right),
      width: 1.7,
      material: color.withAlpha(0.92),
      clampToGround: true,
    },
  })
})

// ── 4. 主流轴标签 ───────────────────────────────────────────
;[
  { name: '黑潮主轴', lon: 128.5, lat: 24.6 },
  { name: '黑潮延伸体', lon: 142.2, lat: 33.8 },
  { name: '副热带回旋边缘', lon: 136.8, lat: 27.6 },
].forEach((label) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(label.lon, label.lat, 120),
    label: {
      text: label.name,
      font: '600 14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.fromCssColorString('#0f172a'),
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })
})

// ── 5. 粒子沿流场运动 ────────────────────────────────────────
let particles: Particle[] = []
let lastFrameTime = performance.now()
const particleEntities = Array.from({ length: 70 }, (_, index) =>
  viewer.entities.add({
    name: '海流粒子_' + index,
    position: Cesium.Cartesian3.fromDegrees(0, 0, 0),
    point: {
      pixelSize: 0,
      color: Cesium.Color.WHITE,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    show: false,
  })
)

function sampleField(lon: number, lat: number) {
  const col = clamp(Math.round(((lon - west) / (east - west)) * (gridCols - 1)), 0, gridCols - 1)
  const row = clamp(Math.round(((lat - south) / (north - south)) * (gridRows - 1)), 0, gridRows - 1)
  return currentField[row * gridCols + col]
}

function spawnParticle(): Particle {
  const seed = currentField[Math.floor(Math.random() * currentField.length)]
  return {
    lon: seed.lon + (Math.random() - 0.5) * 0.35,
    lat: seed.lat + (Math.random() - 0.5) * 0.28,
    age: 0,
    ttl: 120 + Math.floor(Math.random() * 80),
  }
}

for (let i = 0; i < particleEntities.length; i++) {
  particles.push(spawnParticle())
}

viewer.scene.preRender.addEventListener(() => {
  const now = performance.now()
  const deltaSeconds = Math.min((now - lastFrameTime) / 1000, 0.05)
  lastFrameTime = now

  particles = particles.map((particle, index) => {
    const fieldPoint = sampleField(particle.lon, particle.lat)
    particle.lon += (fieldPoint.u * deltaSeconds * 0.65) / Math.cos(Cesium.Math.toRadians(particle.lat))
    particle.lat += fieldPoint.v * deltaSeconds * 0.38
    particle.age += 1

    const outOfBounds =
      particle.lon < west || particle.lon > east || particle.lat < south || particle.lat > north

    if (outOfBounds || particle.age > particle.ttl) {
      return spawnParticle()
    }

    const entity = particleEntities[index]
    entity.show = true
    entity.position = Cesium.Cartesian3.fromDegrees(particle.lon, particle.lat, 60)

    const alpha = 1 - particle.age / particle.ttl
    entity.point.pixelSize = 3 + normalizeSpeed(fieldPoint.speed) * 3.5
    entity.point.color = getCurrentColor(fieldPoint.speed).withAlpha(alpha)
    return particle
  })
})

// ── 6. 状态面板 ─────────────────────────────────────────────
const legend = document.createElement('div')
legend.className = 'current-legend'
legend.innerHTML = [
  '<div class="current-legend__title">西北太平洋海流场</div>',
  '<div class="current-legend__subtitle">速度底图 + 矢量箭头 + 粒子流动</div>',
  '<div class="current-legend__ramp"></div>',
  '<div class="current-legend__labels"><span>弱</span><span>中</span><span>强</span></div>',
  '<div class="current-legend__meta">采样网格: ' + gridCols + ' × ' + gridRows + '</div>',
  '<div class="current-legend__meta">速度范围: ' + minSpeed.toFixed(2) + ' - ' + maxSpeed.toFixed(2) + ' m/s</div>',
  '<div class="current-legend__meta">粒子数量: ' + particleEntities.length + '</div>',
].join('')
document.body.appendChild(legend)

console.log('🌊 海流格网:', currentField.length)
console.log('🧭 箭头采样:', Math.floor(currentField.length / 3))
console.log('✨ 粒子数量:', particleEntities.length)
console.log('📊 当前示例使用模拟黑潮流场，真实业务可接入 HYCOM / ROMS / NetCDF 数据')

const currentSphere = Cesium.BoundingSphere.fromRectangle3D(rectangle)
viewer.camera.flyToBoundingSphere(currentSphere, {
  offset: new Cesium.HeadingPitchRange(
    Cesium.Math.toRadians(-18),
    Cesium.Math.toRadians(-63),
    currentSphere.radius * 2.35
  ),
  duration: 2.2,
  complete: () => console.log('🌊 海流可视化已启动'),
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }

.current-legend {
  position: absolute;
  right: 18px;
  bottom: 18px;
  width: 260px;
  padding: 14px 14px 12px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.84);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #e2e8f0;
  font-family: 'SFMono-Regular', Consolas, monospace;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.34);
  backdrop-filter: blur(10px);
}

.current-legend__title {
  font-size: 15px;
  font-weight: 700;
}

.current-legend__subtitle,
.current-legend__meta {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(226, 232, 240, 0.8);
}

.current-legend__ramp {
  height: 10px;
  margin-top: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, #1d4ed8 0%, #06b6d4 30%, #67e8f9 55%, #facc15 78%, #f97316 100%);
}

.current-legend__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  color: rgba(226, 232, 240, 0.72);
}
`,
  },
  guide: {
    features: ['海流速度底图生成', '矢量箭头稀疏采样', '粒子沿流场追踪', '区域包围球自动取景'],
    points: ['海流场通常来自 HYCOM、ROMS 等海洋模式输出', '箭头适合表达方向结构，色斑更适合表达速度强弱', '粒子更新应基于流场采样而不是纯随机漂移，否则会失去流向一致性'],
  },
}
