import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'camera-control',
  title: '相机控制',
  category: '基础操作',
  description: '掌握 Cesium 相机系统：flyTo、lookAt、setView、rotateTo 等常用视角操作，理解相机姿态（heading/pitch/roll）与坐标关系。',
  tags: ['camera', 'flyTo', '视角'],
  level: 'easy',
  files: {
    'main.ts': `// 相机控制示例
const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false,
  animation: false, timeline: false, geocoder: false,
  homeButton: false, sceneModePicker: false,
  navigationHelpButton: false, fullscreenButton: false,
  baseLayer: new Cesium.ImageryLayer(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: 'OpenStreetMap contributors',
    })
  ),
})
viewerRef.current = viewer

// ── 几个重要地点 ──────────────────────────────
const cities = [
  { name: '成都', lon: 104.06, lat: 30.67, color: Cesium.Color.RED },
  { name: '上海', lon: 121.47, lat: 31.23, color: Cesium.Color.YELLOW },
  { name: '广州', lon: 113.26, lat: 23.13, color: Cesium.Color.CYAN },
  { name: '北京', lon: 116.39, lat: 39.9,  color: Cesium.Color.LIME },
]

cities.forEach(({ name, lon, lat, color }) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    point: { pixelSize: 10, color, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
    label: {
      text: name, font: '14px sans-serif',
      fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2, style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -14),
    },
  })
})

// ── 1. flyTo：平滑飞行 ────────────────────────
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(104.06, 30.67, 800000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-45),
    roll: 0,
  },
  duration: 3,
  complete: () => console.log('✅ flyTo 成都完成'),
})

// ── 2. 3 秒后：setView 即时跳转 ───────────────
setTimeout(() => {
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(121.47, 31.23, 500000),
    orientation: {
      heading: Cesium.Math.toRadians(30),
      pitch: Cesium.Math.toRadians(-60),
      roll: 0,
    },
  })
  console.log('⚡ setView 跳转上海（无动画）')
}, 4000)

// ── 3. 6 秒后：flyTo 全国视角 ─────────────────
setTimeout(() => {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(108, 35, 5000000),
    duration: 2,
    complete: () => console.log('🌏 回到全国视角'),
  })
}, 7000)

console.log('🎥 相机控制演示开始...')
console.log('📐 Heading/Pitch/Roll 均用弧度表示')
console.log('🌍 flyTo → setView → flyTo 序列演示中')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['flyTo 平滑飞行动画', 'setView 即时跳转', 'lookAt 围绕目标点旋转', 'screenSpaceCameraController 交互限制'],
    points: ['Heading/Pitch/Roll 用弧度表示', 'camera.position 为 Cartesian3 世界坐标', '飞行 duration=0 等价于 setView'],
  },
}
