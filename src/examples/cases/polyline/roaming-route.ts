import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'roaming-route',
  title: '漫游路线（室内/空中）',
  category: '线与路径',
  description: '沿关键帧路径平滑漫游：室内建筑穿行、空中无人机巡航、战机绕圈轨迹，支持第一视角与跟踪视角切换。',
  tags: ['漫游', '室内', '无人机'],
  level: 'medium',
  files: {
    'main.ts': `// 漫游路线（室内/空中）示例
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

// ── 漫游路线数据 ─────────────────────────────────
const roamingWaypoints = [
  { time: 0, position: [121.47, 31.23, 200] },
  { time: 15, position: [121.48, 31.24, 200] },
  { time: 30, position: [121.49, 31.23, 200] },
  { time: 45, position: [121.48, 31.22, 200] },
  { time: 60, position: [121.47, 31.23, 200] },
]

// ── 创建采样位置属性 ──────────────────────────────
const positionProperty = new Cesium.SampledPositionProperty()

roamingWaypoints.forEach(({ time, position }) => {
  const [lon, lat, alt] = position
  const julianDate = Cesium.JulianDate.now()
  Cesium.JulianDate.addSeconds(julianDate, time, julianDate)
  positionProperty.addSample(julianDate, Cesium.Cartesian3.fromDegrees(lon, lat, alt))
})

// ── 创建速度朝向属性 ───────────────────────────────
const orientationProperty = new Cesium.VelocityOrientationProperty(positionProperty)

// ── 配置时钟 ───────────────────────────────────────
const startTime = Cesium.JulianDate.now()
const stopTime = Cesium.JulianDate.addSeconds(startTime, 60)
viewer.clock.startTime = startTime
viewer.clock.stopTime = stopTime
viewer.clock.currentTime = startTime
viewer.clock.multiplier = 1
viewer.clock.shouldAnimate = true

// ── 添加漫游模型实体 ────────────────────────────────
const roamingEntity = viewer.entities.add({
  name: '漫游模型',
  position: positionProperty,
  orientation: orientationProperty,
  model: {
    uri: 'https://cesium.com/public/Sandcastle/SampleData/Models/CesiumAir/Cesium_Air.glb',
    scale: 1,
    minimumPixelSize: 32,
  },
  path: {
    resolution: 1,
    width: 2,
    material: Cesium.Color.LIME,
    trailTime: 60,
  },
  point: {
    pixelSize: 0,
  },
})

console.log('🚀 添加漫游模型，沿关键帧路径平滑移动')

// ── 添加路径线 ────────────────────────────────
const pathPositions = roamingWaypoints.map((wp) =>
  Cesium.Cartesian3.fromDegrees(wp.position[0], wp.position[1], wp.position[2])
)

viewer.entities.add({
  name: '漫游路径线',
  polyline: {
    positions: pathPositions,
    width: 2,
    material: Cesium.Color.YELLOW.withAlpha(0.5),
    followSurface: false,
  },
})

// ── 添加路径点标注 ────────────────────────────────
roamingWaypoints.forEach((wp, i) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(wp.position[0], wp.position[1], wp.position[2]),
    label: {
      text: \`P\${i}\`,
      font: 'bold 11px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 1,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -12),
    },
    point: {
      pixelSize: 6,
      color: Cesium.Color.CYAN,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
    },
  })
})

// ── 相机跟随漫游体 ─────────────────────────────────
viewer.trackedEntity = roamingEntity

console.log('🎥 相机锁定跟随漫游视角')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(121.48, 31.23, 5000),
  duration: 2,
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['关键帧路径 CatmullRom 插值', '第一视角相机绑定', '室内坐标系建立', '漫游速度与时间轴联动'],
    points: ['室内漫游需要精确的建筑模型坐标', 'CatmullRom 插值路径更自然', '需禁用默认相机控制器'],
  },
}
