import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'flight-path',
  title: '飞行路径与模型跟踪',
  category: '线与路径',
  description: '沿预设路径平滑飞行的三维模型：自动朝向速度方向、尾迹线实时绘制、相机锁定跟随目标。',
  tags: ['飞行路径', '模型跟踪', 'CZML'],
  level: 'medium',
  files: {
    'main.ts': `// 飞行路径与模型跟踪示例
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

// ── 飞行路径关键点 ─────────────────────────────────
const flightWaypoints = [
  { time: 0, position: [116.39, 39.9, 5000] },
  { time: 10, position: [117.0, 39.5, 8000] },
  { time: 25, position: [117.5, 39.0, 12000] },
  { time: 40, position: [118.0, 38.5, 10000] },
  { time: 55, position: [118.5, 38.0, 8000] },
  { time: 70, position: [119.0, 37.5, 6000] },
  { time: 85, position: [119.5, 37.0, 4000] },
  { time: 100, position: [120.0, 36.5, 3000] },
]

// ── 创建采样位置属性 ──────────────────────────────
const positionProperty = new Cesium.SampledPositionProperty()

flightWaypoints.forEach(({ time, position }) => {
  const [lon, lat, alt] = position
  const julianDate = Cesium.JulianDate.now()
  Cesium.JulianDate.addSeconds(julianDate, time, julianDate)
  positionProperty.addSample(julianDate, Cesium.Cartesian3.fromDegrees(lon, lat, alt))
})

// ── 创建速度朝向属性 ───────────────────────────────
const orientationProperty = new Cesium.VelocityOrientationProperty(positionProperty)

// ── 配置时钟 ───────────────────────────────────────
const startTime = Cesium.JulianDate.now()
const stopTime = Cesium.JulianDate.addSeconds(startTime, 100)
viewer.clock.startTime = startTime
viewer.clock.stopTime = stopTime
viewer.clock.currentTime = startTime
viewer.clock.multiplier = 1
viewer.clock.shouldAnimate = true

// ── 添加飞机模型实体 ────────────────────────────────
const airplaneEntity = viewer.entities.add({
  name: '飞机',
  position: positionProperty,
  orientation: orientationProperty,
  model: {
    uri: 'https://cesium.com/public/Sandcastle/SampleData/Models/CesiumAir/Cesium_Air.glb',
    scale: 2,
    minimumPixelSize: 32,
  },
  path: {
    resolution: 1,
    width: 2,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.3,
      color: Cesium.Color.CYAN,
    }),
    trailTime: 60,
  },
  point: {
    pixelSize: 0,
  },
})

console.log('✈️ 添加飞机模型，沿预设路径飞行')

// ── 添加飞行路径线 ────────────────────────────────
const pathPositions = flightWaypoints.map((wp) =>
  Cesium.Cartesian3.fromDegrees(wp.position[0], wp.position[1], wp.position[2])
)

viewer.entities.add({
  name: '飞行路径线',
  polyline: {
    positions: pathPositions,
    width: 2,
    material: Cesium.Color.YELLOW.withAlpha(0.5),
    followSurface: false,
  },
})

// ── 添加路径点标注 ────────────────────────────────
flightWaypoints.forEach((wp, i) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(wp.position[0], wp.position[1], wp.position[2]),
    label: {
      text: \`WP\${i}\`,
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
      color: Cesium.Color.YELLOW,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
    },
  })
})

// ── 相机跟随飞机 ─────────────────────────────────
viewer.trackedEntity = airplaneEntity

console.log('🎥 相机锁定跟随飞机视角')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(118, 38.5, 200000),
  duration: 2,
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['SampledPositionProperty 路径插值', 'VelocityOrientationProperty 速度朝向', 'viewer.trackedEntity 相机跟随', 'PathGraphics 轨迹尾线'],
    points: ['LAGRANGE 插值比 LINEAR 更平滑', 'trackedEntity 锁定相机视角', 'PathGraphics.trailTime 控制尾线长度'],
  },
}
