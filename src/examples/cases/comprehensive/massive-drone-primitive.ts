import type { ExampleMeta } from '../../types'

// 飞行模式定义
const flightModes = [
  { name: '螺旋旋转', id: 0 },
  { name: '编队散开', id: 1 },
  { name: '波浪涌动', id: 2 },
  { name: '漩涡上升', id: 3 },
  { name: '分队编队', id: 4 },
  { name: '复杂群体', id: 5 },
]

export const meta: ExampleMeta = {
  id: 'massive-drone-primitive',
  title: '万级无人机集群',
  category: '综合应用',
  description: '使用 Cesium.Model.fromGltfAsync 创建 10000 个 air.glb Model Primitive，并实时动画无人机的位置、高度和方向，展示动态飞行集群效果。',
  tags: ['Model Primitive', '性能优化', '无人机集群', '动画'],
  level: 'hard',
  files: {
    'main.ts': `// 万级无人机集群：10000 个 air.glb Model Primitive
// 说明：绕过 Entity.model，直接使用 Cesium.Model.fromGltfAsync 创建 Primitive 模型实例，并支持 6 种动态飞行模式。

const FLIGHT_MODES = [
  { name: '螺旋旋转', id: 0 },
  { name: '编队散开', id: 1 },
  { name: '波浪涌动', id: 2 },
  { name: '漩涡上升', id: 3 },
  { name: '分队编队', id: 4 },
  { name: '复杂群体', id: 5 },
]

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

viewer.scene.requestRenderMode = true
viewer.scene.maximumRenderTimeChange = Infinity
viewer.scene.globe.enableLighting = true
viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#07111f')
viewer.scene.skyAtmosphere.hueShift = -0.18
viewer.scene.skyAtmosphere.saturationShift = -0.35
viewer.scene.fog.enabled = false
viewer.scene.postProcessStages.fxaa.enabled = true

const center = { lon: 116.3912, lat: 39.9073 }
const centerLat = center.lat
const rows = 100
const columns = 100
const spacingMeters = 95
const modelCount = rows * columns
const batchSize = 120
const modelScale = 8
const modelUri = '/model/air.glb'

let loadedCount = 0
let firstBatchMs = null
let progressValue
let timingValue
let lastFrameTime = performance.now()
let currentModeIndex = 0
let isAnimating = false
let animationTime = 0

function metersToLongitudeDegrees(meters, latitude) {
  return meters / (111320 * Math.cos(Cesium.Math.toRadians(latitude)))
}

function metersToLatitudeDegrees(meters) {
  return meters / 110540
}

function createSeededRandom(seed) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve))
}

function addPanel() {
  const panel = document.createElement('div')
  panel.className = 'massive-drone-panel'

  panel.innerHTML = [
    '<div class="panel-title">万级无人机群体飞行</div>',
    '<div class="panel-desc">10000 个动态飞行的无人机</div>',
    '<div class="control-buttons">',
    '<button id="toggle-animation" class="control-btn">▶ 开始动画</button>',
    '<button id="next-mode" class="control-btn">⟹ 下一模式</button>',
    '</div>',
    '<div class="flight-modes">',
    '<button data-mode="0" class="mode-btn active">螺旋旋转</button>',
    '<button data-mode="1" class="mode-btn">编队散开</button>',
    '<button data-mode="2" class="mode-btn">波浪涌动</button>',
    '<button data-mode="3" class="mode-btn">漩涡上升</button>',
    '<button data-mode="4" class="mode-btn">分队编队</button>',
    '<button data-mode="5" class="mode-btn">复杂群体</button>',
    '</div>',
    '<div class="metric-grid">',
    '<span>飞行模式</span><strong data-mode-name>螺旋旋转</strong>',
    '<span>模型数量</span><strong>10000</strong>',
    '<span>加载进度</span><strong data-progress>0 / 10000</strong>',
    '<span>耗时</span><strong data-timing>等待开始</strong>',
    '</div>',
  ].join('')
  container.appendChild(panel)

  progressValue = panel.querySelector('[data-progress]')
  timingValue = panel.querySelector('[data-timing]')

  // 绑定控制按钮事件
  document.getElementById('toggle-animation')?.addEventListener('click', toggleAnimation)
  document.getElementById('next-mode')?.addEventListener('click', () => switchMode((currentModeIndex + 1) % 6))

  panel.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', (e: any) => {
      const modeIdx = parseInt(e.target.dataset.mode)
      switchMode(modeIdx)
    })
  })
}

function switchMode(modeIndex: number) {
  currentModeIndex = modeIndex
  animationTime = 0
  const modeName = FLIGHT_MODES[modeIndex].name
  const panel = container.querySelector('[data-mode-name]')
  if (panel) panel.textContent = modeName

  container.querySelectorAll('.mode-btn').forEach((btn, idx) => {
    if (idx === modeIndex) btn.classList.add('active')
    else btn.classList.remove('active')
  })

  if (!isAnimating) toggleAnimation()
}

function toggleAnimation() {
  isAnimating = !isAnimating
  flightController.isAnimating = isAnimating
  const btn = document.getElementById('toggle-animation')
  if (btn) btn.textContent = isAnimating ? '⏸ 暂停动画' : '▶ 开始动画'
  if (isAnimating) viewer.scene.requestRender()
}

function updatePanel(message) {
  if (progressValue) {
    progressValue.textContent = loadedCount + ' / ' + modelCount
  }
  if (timingValue && message) {
    timingValue.textContent = message
  }
}

function addMissionContext() {
  const halfWidth = ((columns - 1) * spacingMeters) / 2 + 260
  const halfHeight = ((rows - 1) * spacingMeters) / 2 + 260
  const west = center.lon + metersToLongitudeDegrees(-halfWidth, center.lat)
  const east = center.lon + metersToLongitudeDegrees(halfWidth, center.lat)
  const south = center.lat + metersToLatitudeDegrees(-halfHeight)
  const north = center.lat + metersToLatitudeDegrees(halfHeight)

  viewer.entities.add({
    rectangle: {
      coordinates: Cesium.Rectangle.fromDegrees(west, south, east, north),
      height: 0,
      material: Cesium.Color.fromCssColorString('#1f8fff').withAlpha(0.05),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString('#79d7ff').withAlpha(0.62),
    },
  })

  viewer.entities.add({
    polyline: {
      positions: [
        Cesium.Cartesian3.fromDegrees(west, south, 380),
        Cesium.Cartesian3.fromDegrees(east, south, 380),
        Cesium.Cartesian3.fromDegrees(east, north, 380),
        Cesium.Cartesian3.fromDegrees(west, north, 380),
        Cesium.Cartesian3.fromDegrees(west, south, 380),
      ],
      width: 3,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.22,
        color: Cesium.Color.CYAN.withAlpha(0.72),
      }),
    },
  })

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(center.lon, center.lat, 680),
    point: {
      pixelSize: 11,
      color: Cesium.Color.fromCssColorString('#ffd166'),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text: '10000 个动态飞行的无人机集群\\n支持 6 种飞行模式编队',
      font: '600 14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK.withAlpha(0.78),
      outlineWidth: 4,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -30),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })
}

function createModelLayouts() {
  const random = createSeededRandom(2026)
  const layouts = []

  for (let i = 0; i < modelCount; i++) {
    const row = Math.floor(i / columns)
    const column = i % columns
    const x = (column - (columns - 1) / 2) * spacingMeters
    const y = (row - (rows - 1) / 2) * spacingMeters
    const wave = Math.sin(column * 0.28) + Math.cos(row * 0.22)
    const jitterX = (random() - 0.5) * 14
    const jitterY = (random() - 0.5) * 14

    layouts.push({
      lon: center.lon + metersToLongitudeDegrees(x + jitterX, center.lat),
      lat: center.lat + metersToLatitudeDegrees(y + jitterY),
      altitude: 250 + wave * 28 + random() * 72,
      heading: Cesium.Math.toRadians(18 + wave * 5 + (random() - 0.5) * 12),
    })
  }

  return layouts
}

function createModelMatrix(layout) {
  const position = Cesium.Cartesian3.fromDegrees(layout.lon, layout.lat, layout.altitude)
  const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
    position,
    new Cesium.HeadingPitchRoll(layout.heading, 0, 0)
  )
  return Cesium.Matrix4.multiplyByUniformScale(modelMatrix, modelScale, modelMatrix)
}

let baseLayouts: any[] = []
let models: Cesium.Model[] = []

function calculateDronePosition(droneId: number, row: number, col: number, time: number, layout: any) {
  const modes = ['helical', 'scatter', 'wave', 'vortex', 'formation', 'complex']
  const mode = modes[currentModeIndex]

  const baseX = layout.x || 0
  const baseY = layout.y || 0
  const distance = Math.sqrt(baseX * baseX + baseY * baseY)
  let angle = Math.atan2(baseY, baseX)

  let finalX = baseX, finalY = baseY, altitude = layout.altitude, heading = layout.heading

  if (mode === 'helical') {
    const progress = (time % 40) / 40
    angle += progress * Math.PI * 2
    const rotatedX = Math.cos(angle) * distance
    const rotatedY = Math.sin(angle) * distance
    finalX = rotatedX
    finalY = rotatedY
    altitude = layout.altitude + Math.sin(progress * Math.PI * 2) * 120
    heading = layout.heading + progress * Math.PI * 2
  } else if (mode === 'scatter') {
    const progress = (time % 50) / 50
    const swarmId = Math.floor((row * columns + col) / 1000) % 10
    const scatter = Math.sin(progress * Math.PI * 2 + (swarmId / 10) * Math.PI * 2) * 800
    const offsetX = Math.cos(angle) * scatter
    const offsetY = Math.sin(angle) * scatter
    finalX = baseX + offsetX
    finalY = baseY + offsetY
    altitude = layout.altitude + Math.abs(scatter) / 5
  } else if (mode === 'wave') {
    const progress = (time % 30) / 30
    const waveHeight = Math.sin((col / columns + progress) * Math.PI * 4) * 200
    const sway = Math.sin((col / columns + progress) * Math.PI * 6) * 150
    finalX = baseX + sway
    finalY = baseY
    altitude = layout.altitude + waveHeight
  } else if (mode === 'vortex') {
    const progress = (time % 45) / 45
    const rotationMultiplier = distance / 5000
    angle += progress * Math.PI * 4 * rotationMultiplier
    const rotatedX = Math.cos(angle) * distance
    const rotatedY = Math.sin(angle) * distance
    finalX = rotatedX
    finalY = rotatedY
    altitude = layout.altitude + progress * 600
    heading = layout.heading + progress * Math.PI * 4
  } else if (mode === 'formation') {
    const progress = (time % 60) / 60
    const isTopHalf = row < rows / 2
    const isLeftHalf = col < columns / 2
    let formationId = isTopHalf && isLeftHalf ? 0 : isTopHalf && !isLeftHalf ? 1 : !isTopHalf && isLeftHalf ? 2 : 3
    const directions = [
      { dx: 0, dy: 1200 },
      { dx: 1200, dy: 0 },
      { dx: -1200, dy: 0 },
      { dx: 0, dy: -1200 },
    ]
    const dir = directions[formationId]
    const offsetX = dir.dx * Math.sin(progress * Math.PI)
    const offsetY = dir.dy * Math.sin(progress * Math.PI)
    finalX = baseX + offsetX
    finalY = baseY + offsetY
    altitude = layout.altitude + Math.sin(progress * Math.PI) * 200
  } else if (mode === 'complex') {
    const progress = (time % 80) / 80
    const rotation = progress * Math.PI * 2
    angle += rotation * 0.8
    const waveAmplitude = Math.sin((row / rows) * Math.PI * 2 + progress * Math.PI) * 400
    const waveDistance = distance + waveAmplitude
    finalX = Math.cos(angle) * waveDistance
    finalY = Math.sin(angle) * waveDistance
    altitude = layout.altitude + Math.sin(rotation) * 150 + Math.sin((row / rows + progress) * Math.PI * 4) * 120
    heading = layout.heading + rotation
  }

  return {
    lon: center.lon + metersToLongitudeDegrees(finalX, centerLat),
    lat: centerLat + metersToLatitudeDegrees(finalY),
    altitude: Math.max(50, altitude),
    heading: heading,
  }
}

async function addMassiveModelPrimitives() {
  const layouts = createModelLayouts()
  baseLayouts = layouts
  const totalStart = performance.now()
  console.log('开始创建 Model Primitive，总数：', modelCount)

  for (let start = 0; start < layouts.length; start += batchSize) {
    const batchStart = performance.now()
    const batch = layouts.slice(start, start + batchSize)

    const batchModels = await Promise.all(batch.map((layout) => {
      return Cesium.Model.fromGltfAsync({
        url: modelUri,
        modelMatrix: createModelMatrix(layout),
        allowPicking: false,
        shadows: Cesium.ShadowMode.DISABLED,
      })
    }))

    batchModels.forEach((model, idx) => {
      viewer.scene.primitives.add(model)
      models.push(model)
      const layoutIdx = start + idx
      baseLayouts[layoutIdx].x = (batch[idx % batch.length].lon - center.lon) * 111320
      baseLayouts[layoutIdx].y = (batch[idx % batch.length].lat - centerLat) * 110540
    })

    loadedCount += batchModels.length
    if (firstBatchMs === null) {
      firstBatchMs = Math.round(performance.now() - totalStart)
      console.log('首批模型加载耗时：', firstBatchMs, 'ms')
    }

    const totalMs = Math.round(performance.now() - totalStart)
    const batchMs = Math.round(performance.now() - batchStart)
    console.log('Model Primitive 加载进度：', loadedCount + '/' + modelCount, '本批耗时：' + batchMs + 'ms', '累计：' + totalMs + 'ms')
    updatePanel('首批 ' + firstBatchMs + 'ms / 累计 ' + totalMs + 'ms')
    viewer.scene.requestRender()
    await nextFrame()
  }

  const finalMs = Math.round(performance.now() - totalStart)
  updatePanel('完成 ' + finalMs + 'ms')

  // 使用 preRender 事件更新动画
  viewer.scene.preRender.addEventListener(() => {
    if (isAnimating && models.length > 0) {
      const now = performance.now()
      const deltaTime = (now - lastFrameTime) / 1000
      lastFrameTime = now
      animationTime += deltaTime

      for (let i = 0; i < models.length; i++) {
        const row = Math.floor(i / columns)
        const col = i % columns
        const position = calculateDronePosition(i, row, col, animationTime, baseLayouts[i])

        const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
          Cesium.Cartesian3.fromDegrees(position.lon, position.lat, position.altitude),
          new Cesium.HeadingPitchRoll(position.heading, 0, 0)
        )
        Cesium.Matrix4.multiplyByUniformScale(modelMatrix, modelScale, modelMatrix)
        models[i].modelMatrix = modelMatrix
      }

      viewer.scene.requestRender()
    }
  })

  viewer.scene.requestRender()
  console.log('Model Primitive 全量加载完成：', modelCount, '个，总耗时：', finalMs, 'ms')
}

addPanel()
addMissionContext()

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(center.lon + 0.025, center.lat - 0.036, 11200),
  orientation: {
    heading: Cesium.Math.toRadians(20),
    pitch: Cesium.Math.toRadians(-36),
    roll: 0,
  },
  duration: 1.8,
})

void addMassiveModelPrimitives()

console.log('模型文件：', modelUri)
console.log('万级模型案例：10000 个 Model Primitive 真实飞机模型')
console.log('性能建议：Model Primitive 比 Entity.model 更轻；生产级万级模型建议继续做 GPU Instancing / 3D Tiles')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
.cesium-viewer-toolbar { top: 72px; right: 18px; }
.massive-drone-panel {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 420px;
  padding: 16px 18px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(6, 16, 30, 0.96), rgba(9, 28, 48, 0.88));
  border: 1px solid rgba(125, 215, 255, 0.28);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(14px);
  color: #eff9ff;
  font: 12px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  pointer-events: auto;
  z-index: 10;
}
.massive-drone-panel .panel-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 6px;
}
.massive-drone-panel .panel-desc {
  color: rgba(239, 249, 255, 0.78);
  margin-bottom: 10px;
  font-size: 11px;
}
.massive-drone-panel .control-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.massive-drone-panel .control-btn {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid rgba(125, 215, 255, 0.5);
  border-radius: 6px;
  background: rgba(31, 143, 255, 0.12);
  color: #7dd7ff;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.massive-drone-panel .control-btn:hover {
  background: rgba(31, 143, 255, 0.22);
  border-color: rgba(125, 215, 255, 0.8);
}
.massive-drone-panel .flight-modes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-bottom: 10px;
}
.massive-drone-panel .mode-btn {
  padding: 5px 10px;
  border: 1px solid rgba(125, 215, 255, 0.3);
  border-radius: 4px;
  background: rgba(9, 28, 48, 0.6);
  color: rgba(239, 249, 255, 0.7);
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.massive-drone-panel .mode-btn:hover {
  border-color: rgba(125, 215, 255, 0.6);
  background: rgba(31, 143, 255, 0.15);
}
.massive-drone-panel .mode-btn.active {
  background: rgba(31, 143, 255, 0.25);
  border-color: rgba(125, 215, 255, 0.8);
  color: #7dd7ff;
  font-weight: 600;
}
.massive-drone-panel .metric-grid {
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 4px 10px;
  font-size: 11px;
}
.massive-drone-panel .metric-grid span {
  color: rgba(239, 249, 255, 0.62);
}
.massive-drone-panel .metric-grid strong {
  font-weight: 650;
  color: #7dd7ff;
}
`,
  },
  guide: {
    features: ['10000 个动态飞行的 air.glb Model Primitive', '6 种飞行模式：螺旋旋转/编队散开/波浪涌动/漩涡上升/分队编队/复杂群体', 'preRender 事件驱动实时动画更新', '交互式模式切换和动画控制'],
    points: [
      '绕过 Entity.model，减少 DataSource 和 Visualizer 层开销',
      '每帧更新 modelMatrix 实现流畅的群体飞行动画',
      '支持 6 种不同的飞行模式，展示不同的群体运动效果',
      '点击按钮切换模式或暂停/继续动画',
      '生产项目可基于此扩展更复杂的群体行为算法',
    ],
  },
}
