import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'massive-drone-primitive',
  title: '万级无人机集群',
  category: '综合应用',
  description: '使用 Cesium.Model.fromGltfAsync 创建 10000 个 air.glb Model Primitive，展示比 Entity.model 更轻的万级模型渲染基线。',
  tags: ['Model Primitive', '性能优化', '无人机集群'],
  level: 'hard',
  files: {
    'main.ts': `// 万级无人机集群：10000 个 air.glb Model Primitive
// 说明：绕过 Entity.model，直接使用 Cesium.Model.fromGltfAsync 创建 Primitive 模型实例。

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
    '<div class="panel-title">Model Primitive 万级渲染</div>',
    '<div class="panel-desc">当前案例通过 Cesium.Model.fromGltfAsync 创建 10000 个 /model/air.glb。</div>',
    '<div class="metric-grid">',
    '<span>模型文件</span><strong>/model/air.glb</strong>',
    '<span>模型数量</span><strong>10000</strong>',
    '<span>对象类型</span><strong>Model Primitive</strong>',
    '<span>加载方式</span><strong>按批异步创建</strong>',
    '<span>拾取</span><strong>allowPicking: false</strong>',
    '<span>加载进度</span><strong data-progress>0 / 10000</strong>',
    '<span>耗时</span><strong data-timing>等待开始</strong>',
    '</div>',
    '<div class="panel-note">这比 Entity.model 少一层 DataSource/Visualizer 开销；生产级仍建议继续升级到 GPU Instancing 或 3D Tiles。</div>',
  ].join('')
  container.appendChild(panel)
  progressValue = panel.querySelector('[data-progress]')
  timingValue = panel.querySelector('[data-timing]')
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
      text: '10000 个 air.glb Model Primitive\\n绕过 Entity.model 的万级模型基线',
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

async function addMassiveModelPrimitives() {
  const layouts = createModelLayouts()
  const totalStart = performance.now()
  console.log('开始创建 Model Primitive，总数：', modelCount)

  for (let start = 0; start < layouts.length; start += batchSize) {
    const batchStart = performance.now()
    const batch = layouts.slice(start, start + batchSize)

    const models = await Promise.all(batch.map((layout) => {
      return Cesium.Model.fromGltfAsync({
        url: modelUri,
        modelMatrix: createModelMatrix(layout),
        allowPicking: false,
        shadows: Cesium.ShadowMode.DISABLED,
      })
    }))

    models.forEach((model) => {
      viewer.scene.primitives.add(model)
    })

    loadedCount += models.length
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
  width: 360px;
  padding: 16px 18px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(6, 16, 30, 0.96), rgba(9, 28, 48, 0.88));
  border: 1px solid rgba(125, 215, 255, 0.28);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.32);
  backdrop-filter: blur(14px);
  color: #eff9ff;
  font: 12px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  pointer-events: none;
  z-index: 10;
}
.massive-drone-panel .panel-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
}
.massive-drone-panel .panel-desc {
  color: rgba(239, 249, 255, 0.78);
  margin-bottom: 12px;
}
.massive-drone-panel .metric-grid {
  display: grid;
  grid-template-columns: 82px 1fr;
  gap: 4px 10px;
}
.massive-drone-panel .metric-grid span {
  color: rgba(239, 249, 255, 0.62);
}
.massive-drone-panel .metric-grid strong {
  font-weight: 650;
}
.massive-drone-panel .panel-note {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(125, 215, 255, 0.18);
  color: rgba(239, 249, 255, 0.72);
}
`,
  },
  guide: {
    features: ['10000 个 air.glb Model Primitive', 'Cesium.Model.fromGltfAsync 批量创建', 'allowPicking: false 降低拾取开销', 'requestRenderMode 静态场景优化'],
    points: ['绕过 Entity.model，减少 DataSource 和 Visualizer 层开销', '按批异步加载避免一次性阻塞主线程', '生产项目可把这个版本作为 GPU Instancing / 3D Tiles 优化前的基线'],
  },
}
