import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'uav-track',
  title: '低空无人机实时轨迹',
  category: '雷达与卫星',
  description: '接收无人机实时遥测数据，在三维场景中展示飞行姿态、航迹、传感器投影范围，支持多机协同显示。',
  tags: ['无人机', 'UAV', '实时轨迹'],
  level: 'hard',
  files: {
    'main.ts': `// 低空无人机实时轨迹示例
// 接收无人机实时遥测数据，在三维场景中展示飞行姿态、航迹、传感器投影范围

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

// ── 1. 模拟无人机遥测数据 ───────────────────────────────────────
interface UAVTelemetry {
  id: string
  latitude: number
  longitude: number
  altitude: number
  heading: number
  pitch: number
  roll: number
  timestamp: number
}

const uavData: UAVTelemetry[] = [
  { id: 'UAV-001', latitude: 39.9073, longitude: 116.3972, altitude: 500, heading: 45, pitch: 0, roll: 0, timestamp: Date.now() },
  { id: 'UAV-001', latitude: 39.9083, longitude: 116.3982, altitude: 520, heading: 50, pitch: 5, roll: 10, timestamp: Date.now() + 1000 },
  { id: 'UAV-001', latitude: 39.9093, longitude: 116.3995, altitude: 540, heading: 55, pitch: 8, roll: -5, timestamp: Date.now() + 2000 },
  { id: 'UAV-001', latitude: 39.9100, longitude: 116.4010, altitude: 560, heading: 60, pitch: 3, roll: 8, timestamp: Date.now() + 3000 },
  { id: 'UAV-001', latitude: 39.9105, longitude: 116.4028, altitude: 580, heading: 65, pitch: 0, roll: 0, timestamp: Date.now() + 4000 },
]

// ── 2. 存储轨迹点 ───────────────────────────────────────────────
const trackPositions: Cesium.Cartesian3[] = []

// ── 3. 添加无人机实体 ──────────────────────────────────────────
const uavEntity = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(39.9073, 116.3972, 500),
  point: {
    pixelSize: 15,
    color: Cesium.Color.LIME,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: 'UAV-001',
    font: 'bold 14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -25),
    scaleByDistance: new Cesium.NearFarScalar(1000, 1.0, 50000, 0.5),
  },
  model: {
    uri: undefined, // 可加载无人机模型
    scale: 1.0,
    minimumPixelSize: 64,
  },
})

// ── 4. 传感器投影锥体 ───────────────────────────────────────────
const sensorEntity = viewer.entities.add({
  position: new Cesium.CallbackProperty(() => {
    return uavEntity.position.getValue(Cesium.JulianDate.now())
  }, false),
  cylinder: {
    length: 300,
    topRadius: 0,
    bottomRadius: 150,
    material: Cesium.Color.BLUE.withAlpha(0.15),
    outline: true,
    outlineColor: Cesium.Color.BLUE,
    slices: 32,
  },
})

// ── 5. 轨迹线 ─────────────────────────────────────────────────
const trackEntity = viewer.entities.add({
  polyline: {
    positions: new Cesium.CallbackProperty(() => {
      return trackPositions
    }, false),
    width: 3,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.3,
      color: Cesium.Color.LIME,
    }),
    arcType: Cesium.ArcType.NONE,
  },
})

// ── 6. 模拟实时数据更新 ────────────────────────────────────────
let dataIndex = 0
function updateUAVPosition() {
  if (dataIndex >= uavData.length) {
    dataIndex = 0
  }

  const data = uavData[dataIndex]
  const position = Cesium.Cartesian3.fromDegrees(data.longitude, data.latitude, data.altitude)

  uavEntity.position = position
  trackPositions.push(position)

  if (trackPositions.length > 1000) {
    trackPositions.shift()
  }

  dataIndex++
}

// 每秒更新一次
setInterval(updateUAVPosition, 1000)

// ── 7. 添加多机协同 ────────────────────────────────────────────
const uav2Entity = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(39.9100, 116.4000, 450),
  point: {
    pixelSize: 15,
    color: Cesium.Color.ORANGE,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: 'UAV-002',
    font: 'bold 14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -25),
  },
})

// UAV-2 的轨迹
viewer.entities.add({
  polyline: {
    positions: [
      Cesium.Cartesian3.fromDegrees(39.9100, 116.4000, 450),
      Cesium.Cartesian3.fromDegrees(39.9110, 116.4010, 460),
      Cesium.Cartesian3.fromDegrees(39.9120, 116.4020, 470),
      Cesium.Cartesian3.fromDegrees(39.9130, 116.4030, 480),
    ],
    width: 3,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.3,
      color: Cesium.Color.ORANGE,
    }),
    arcType: Cesium.ArcType.NONE,
  },
})

// ── 8. 相机飞入 ────────────────────────────────────────────────
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.4, 39.91, 2000),
  duration: 2,
  complete: () => console.log('🚁 无人机轨迹已启动'),
})

console.log('📌 UAV-001 绿色 - 实时数据更新中...')
console.log('📌 UAV-002 橙色 - 双机协同示例')
console.log('💡 实际使用 WebSocket 接收实时数据')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['WebSocket 实时位置数据接收', 'SampledPositionProperty 位置平滑', '无人机模型姿态同步', '传感器投影锥体渲染'],
    points: ['实时数据推荐使用滑动窗口缓存', '位置更新频率 > 5Hz 时需节流', '多机用颜色区分身份'],
  },
}
