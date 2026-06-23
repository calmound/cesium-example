import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'city-roaming',
  title: '城市漫游系统',
  category: '综合应用',
  description: '综合运用地形、OSM 建筑、glTF 模型、后处理效果，实现第一人称城市漫步与自动巡游路径播放。',
  tags: ['城市', '漫游', '第一人称'],
  level: 'hard',
  files: {
    'main.ts': `// 城市漫游系统示例
// 演示相机路径漫游

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

// ── 1. 模拟建筑物 ─────────────────────────────────────
const buildings = [
  { lon: 121.47, lat: 31.23, height: 150, color: Cesium.Color.fromCssColorString('#3a5f80') },
  { lon: 121.472, lat: 31.232, height: 120, color: Cesium.Color.fromCssColorString('#4a708b') },
  { lon: 121.468, lat: 31.228, height: 100, color: Cesium.Color.fromCssColorString('#5f9ea0') },
  { lon: 121.475, lat: 31.235, height: 180, color: Cesium.Color.fromCssColorString('#2f4f4f') },
  { lon: 121.465, lat: 31.225, height: 90, color: Cesium.Color.fromCssColorString('#4682b4') },
]

buildings.forEach((b) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(b.lon, b.lat, b.height / 2),
    box: {
      dimensions: new Cesium.Cartesian3(25, 25, b.height),
      material: b.color.withAlpha(0.9),
      outline: true,
      outlineColor: Cesium.Color.WHITE,
    },
  })
})

// ── 2. 道路标注 ─────────────────────────────────────────
const roads = [
  { name: '世纪大道', coords: [[121.46, 31.22], [121.48, 31.24]] },
  { name: '人民路', coords: [[121.465, 31.21], [121.47, 31.245]] },
]

roads.forEach((road) => {
  viewer.entities.add({
    polyline: {
      positions: road.coords.map(c => Cesium.Cartesian3.fromDegrees(c[0], c[1])),
      width: 4,
      material: Cesium.Color.GRAY,
    },
  })
})

// ── 3. 漫游路径关键帧 ────────────────────────────────────
const keyframes = [
  { time: 0, lon: 121.47, lat: 31.22, heading: 0, pitch: -0.2 },
  { time: 5, lon: 121.472, lat: 31.225, heading: 45, pitch: -0.15 },
  { time: 10, lon: 121.475, lat: 31.23, heading: 90, pitch: -0.1 },
  { time: 15, lon: 121.473, lat: 31.235, heading: 135, pitch: -0.15 },
  { time: 20, lon: 121.47, lat: 31.238, heading: 180, pitch: -0.2 },
]

// ── 4. 相机插值 ─────────────────────────────────────────
let roamingTime = 0
let isRoaming = true

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function updateRoamingCamera() {
  if (!isRoaming) return

  roamingTime += 0.016 * 2 // 加速

  const totalDuration = keyframes[keyframes.length - 1].time
  const t = roamingTime % totalDuration

  let frame1 = keyframes[0]
  let frame2 = keyframes[0]

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (t >= keyframes[i].time && t < keyframes[i + 1].time) {
      frame1 = keyframes[i]
      frame2 = keyframes[i + 1]
      break
    }
  }

  const segmentDuration = frame2.time - frame1.time
  const localT = segmentDuration > 0 ? (t - frame1.time) / segmentDuration : 0

  const lon = lerp(frame1.lon, frame2.lon, localT)
  const lat = lerp(frame1.lat, frame2.lat, localT)
  const heading = lerp(frame1.heading, frame2.heading, localT)
  const pitch = lerp(frame1.pitch, frame2.pitch, localT)

  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, 30),
    orientation: {
      heading: Cesium.Math.toRadians(heading),
      pitch: pitch,
      roll: 0,
    },
  })
}

viewer.scene.preRender.addEventListener(updateRoamingCamera)

// ── 5. 漫游状态标注 ────────────────────────────────────
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(121.46, 31.21, 50),
  label: {
    text: '🚶 城市漫游中...',
    font: 'bold 16px sans-serif',
    fillColor: Cesium.Color.CYAN,
    outlineColor: Cesium.Color.BLACK,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.TOP,
  },
})

// ── 6. 路径可视化 ───────────────────────────────────────
viewer.entities.add({
  polyline: {
    positions: keyframes.map(k => Cesium.Cartesian3.fromDegrees(k.lon, k.lat, 5)),
    width: 2,
    material: Cesium.Color.CYAN,
  },
})

keyframes.forEach((kf, i) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(kf.lon, kf.lat, 5),
    point: {
      pixelSize: 6,
      color: Cesium.Color.CYAN,
    },
    label: {
      text: 'P' + (i + 1),
      font: '10px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10),
    },
  })
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(121.47, 31.23, 200),
  duration: 2,
  complete: () => console.log('🏙️ 城市漫游已启动'),
})

console.log('💡 城市漫游系统示例')
console.log('🚶 相机沿预设路径自动漫游')
console.log('📍 P1-P5 为路径关键帧')
console.log('🎥 heading/pitch 控制相机朝向')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['第一人称相机控制器', 'OSM Buildings + 地形组合', 'Bloom + AmbientOcclusion 后处理', '自动巡游路径关键帧插值'],
    points: ['第一人称需禁用默认 CameraController', 'Bloom 效果增强城市夜景质感', '巡游路径建议用 CatmullRom 样条插值'],
  },
}
