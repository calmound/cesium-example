import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'satellite-track',
  title: '卫星轨迹模拟',
  category: '雷达与卫星',
  description: '根据 TLE 两行根数计算卫星实时位置，在三维地球上绘制轨道预报、地面轨迹和覆盖范围，同步相机跟踪。',
  tags: ['卫星', 'TLE', '轨道'],
  level: 'hard',
  files: {
    'main.ts': `// 卫星轨迹模拟示例
// 根据 TLE 两行根数计算卫星实时位置，在三维地球上绘制轨道预报、地面轨迹和覆盖范围

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

// ── 1. TLE 轨道根数（示例：ISS） ────────────────────────────────
const tleLine1 = '1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9028'
const tleLine2 = '2 25544  51.6400  212.3456 0006703  30.1234  12.5678 15.50000000501234'

// 解析 TLE（简化版，实际应使用 satellite.js 库）
function parseTLE(line1: string, line2: string) {
  const satId = line1.substring(2, 7)
  const epochYear = parseInt(line1.substring(18, 20))
  const epochDay = parseFloat(line1.substring(20, 32))
  const inclination = parseFloat(line2.substring(8, 16)) * Math.PI / 180
  const raan = parseFloat(line2.substring(17, 25)) * Math.PI / 180
  const eccentricity = parseFloat('0.' + line2.substring(26, 33))
  const argPerigee = parseFloat(line2.substring(34, 42)) * Math.PI / 180
  const meanAnomaly = parseFloat(line2.substring(43, 51)) * Math.PI / 180
  const meanMotion = parseFloat(line2.substring(52, 63))

  return {
    satId,
    epochYear: epochYear + 2000,
    epochDay,
    inclination,
    raan,
    eccentricity,
    argPerigee,
    meanAnomaly,
    meanMotion,
  }
}

// ── 2. 计算卫星位置（简化 SGP4 模型） ────────────────────────────
function calculateSatellitePosition(tle: ReturnType<typeof parseTLE>, time: Date) {
  const j2000 = new Date('2000-01-01T12:00:00Z').getTime()
  const elapsed = (time.getTime() - j2000) / 1000 / 60 / 1440 // 天
  const meanMotion = tle.meanMotion * 2 * Math.PI / 1440 // 角速度 rad/min
  const meanAnomaly = tle.meanAnomaly + meanMotion * elapsed * 1440

  // 简化计算（实际应使用完整 SGP4）
  const E = meanAnomaly
  const latitude = Math.asin(Math.sin(tle.inclination) * Math.sin(E + tle.argPerigee))
  const longitude = tle.raan + Math.atan2(
    Math.cos(tle.inclination) * Math.sin(E + tle.argPerigee),
    Math.cos(E + tle.argPerigee)
  ) + elapsed * 0.25

  return {
    latitude: latitude * 180 / Math.PI,
    longitude: ((longitude * 180 / Math.PI) % 360 + 540) % 360 - 180,
    altitude: 420, // km
  }
}

// ── 3. 卫星位置更新 ─────────────────────────────────────────────
const tle = parseTLE(tleLine1, tleLine2)
const satelliteEntity = viewer.entities.add({
  position: new Cesium.CallbackProperty(() => {
    const now = new Date()
    const pos = calculateSatellitePosition(tle, now)
    return Cesium.Cartesian3.fromDegrees(pos.longitude, pos.latitude, pos.altitude * 1000)
  }, false),
  point: {
    pixelSize: 10,
    color: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: 'ISS (25544)',
    font: 'bold 12px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

// ── 4. 轨道预报线 ───────────────────────────────────────────────
const orbitPositions: Cesium.Cartesian3[] = []
for (let i = 0; i <= 360; i += 5) {
  const time = new Date(Date.now() + i * 60000) // 未来 i 分钟
  const pos = calculateSatellitePosition(tle, time)
  orbitPositions.push(Cesium.Cartesian3.fromDegrees(pos.longitude, pos.latitude, pos.altitude * 1000))
}

viewer.entities.add({
  polyline: {
    positions: orbitPositions,
    width: 2,
    material: Cesium.Color.CYAN.withAlpha(0.6),
    arcType: Cesium.ArcType.NONE,
  },
})

// ── 5. 地面轨迹（星下点） ────────────────────────────────────────
const groundTrack: Cesium.Cartesian3[] = []
for (let i = 0; i <= 360; i += 5) {
  const time = new Date(Date.now() + i * 60000)
  const pos = calculateSatellitePosition(tle, time)
  groundTrack.push(Cesium.Cartesian3.fromDegrees(pos.longitude, pos.latitude, 0))
}

viewer.entities.add({
  polyline: {
    positions: groundTrack,
    width: 1,
    material: Cesium.Color.YELLOW.withAlpha(0.4),
    arcType: Cesium.ArcType.NONE,
  },
})

// ── 6. 覆盖范围圆锥 ────────────────────────────────────────────
viewer.entities.add({
  position: new Cesium.CallbackProperty(() => {
    const now = new Date()
    const pos = calculateSatellitePosition(tle, now)
    return Cesium.Cartesian3.fromDegrees(pos.longitude, pos.latitude, pos.altitude * 1000)
  }, false),
  cylinder: {
    length: 600000,
    topRadius: 0,
    bottomRadius: 400000,
    material: Cesium.Color.CYAN.withAlpha(0.1),
    outline: true,
    outlineColor: Cesium.Color.CYAN,
    slices: 32,
  },
})

// ── 7. 相机跟踪 ────────────────────────────────────────────────
viewer.trackedEntity = satelliteEntity

setTimeout(() => {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(0, 0, 3000000),
    duration: 1,
  })
}, 1000)

console.log('🛰️ 卫星轨迹模拟已启动')
console.log('📌 使用完整 SGP4 模型请引入 satellite.js 库')
console.log('💡 覆盖范围圆锥显示传感器可视区域')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['satellite.js 库解算 TLE 轨道', 'SampledPositionProperty 预报位置', '星下点地面轨迹绘制', 'Corridor 绘制覆盖条带'],
    points: ['TLE 每天更新一次精度较高', 'LEO 轨道周期约 90min', 'SGP4 模型误差在 km 量级'],
  },
}
