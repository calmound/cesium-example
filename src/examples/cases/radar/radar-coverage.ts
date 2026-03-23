import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'radar-coverage',
  title: '雷达探测范围',
  category: '雷达与卫星',
  description: '可视化相控阵雷达、固定算法干扰雷达、双曲面雷达等多种雷达的三维探测范围，支持参数动态调节。',
  tags: ['雷达', '探测范围', '相控阵'],
  level: 'hard',
  files: {
    'main.ts': `// 雷达探测范围示例
// 可视化相控阵雷达、固定算法干扰雷达、双曲面雷达等多种雷达的三维探测范围

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

// ── 1. 相控阵雷达（椭球体近似） ──────────────────────────────────
const radarPosition = Cesium.Cartesian3.fromDegrees(116.3972, 39.9073, 0)
const radarRadius = 200000 // 200km 探测半径

// 添加相控阵雷达基地
viewer.entities.add({
  position: radarPosition,
  point: {
    pixelSize: 12,
    color: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: '相控阵雷达',
    font: 'bold 14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

// 椭球体覆盖范围（相控阵雷达）
viewer.entities.add({
  position: radarPosition,
  ellipsoid: {
    radii: new Cesium.Cartesian3(radarRadius, radarRadius, radarRadius * 0.4),
    material: Cesium.Color.CYAN.withAlpha(0.2),
    outline: true,
    outlineColor: Cesium.Color.CYAN,
    outlineWidth: 2,
    slicePartitions: 64,
    stackPartitions: 64,
  },
})

// ── 2. 固定算法干扰雷达（圆锥体） ──────────────────────────────────
const jammerPosition = Cesium.Cartesian3.fromDegrees(116.6, 39.8, 0)
const jammerHeight = 50000
const jammerRadius = 80000

viewer.entities.add({
  position: jammerPosition,
  point: {
    pixelSize: 12,
    color: Cesium.Color.ORANGE,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: '干扰雷达',
    font: 'bold 14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

// 圆锥体覆盖范围
viewer.entities.add({
  position: jammerPosition,
  cylinder: {
    length: jammerHeight,
    topRadius: 0,
    bottomRadius: jammerRadius,
    material: Cesium.Color.ORANGE.withAlpha(0.15),
    outline: true,
    outlineColor: Cesium.Color.ORANGE,
    numberOfVerticalLines: 32,
    slices: 64,
  },
})

// ── 3. 双曲面雷达（自定义wall） ───────────────────────────────────
const hyperPosition = Cesium.Cartesian3.fromDegrees(116.8, 39.9, 0)

viewer.entities.add({
  position: hyperPosition,
  point: {
    pixelSize: 12,
    color: Cesium.Color.YELLOW,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
  },
  label: {
    text: '双曲面雷达',
    font: 'bold 14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

// 双曲面用 wall 近似模拟
const wallPositions = []
const wallHeight = 60000
for (let i = 0; i <= 360; i += 5) {
  const angle = (i * Math.PI) / 180
  const r = 100000 + 30000 * Math.cos(angle * 2)
  const x = r * Math.cos(angle)
  const y = r * Math.sin(angle)
  const lon = 116.8 + (x / 111000)
  const lat = 39.9 + (y / 111000)
  wallPositions.push(Cesium.Math.toRadians(lon), Cesium.Math.toRadians(lat), wallHeight)
}

viewer.entities.add({
  wall: {
    positions: Cesium.Cartesian3.fromRadiansArrayHeights(wallPositions),
    material: Cesium.Color.YELLOW.withAlpha(0.2),
    outline: true,
    outlineColor: Cesium.Color.YELLOW,
  },
})

// ── 4. 雷达波束扫描动画 ──────────────────────────────────────────
let scanAngle = 0
function updateScanBeam() {
  scanAngle += 0.02
  if (scanAngle > Math.PI * 2) scanAngle -= Math.PI * 2
}

const scanLineEntity = viewer.entities.add({
  position: radarPosition,
  polyline: {
    positions: new Cesium.CallbackProperty(() => {
      updateScanBeam()
      const positions = []
      for (let i = 0; i <= 100; i++) {
        const angle = scanAngle
        const r = (i / 100) * radarRadius
        const x = r * Math.cos(angle)
        const y = r * Math.sin(angle)
        const lon = 116.3972 + (x / 111000)
        const lat = 39.9073 + (y / 111000)
        positions.push(Cesium.Cartesian3.fromDegrees(lon, lat, 0))
      }
      return positions
    }, false),
    width: 3,
    material: new Cesium.ColorMaterialProperty(
      new Cesium.CallbackProperty(() => {
        return Cesium.Color.GREEN.withAlpha(0.8)
      }, false)
    ),
  },
})

// ── 5. 相机飞入 ─────────────────────────────────────────────────
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.6, 39.85, 500000),
  duration: 2,
  complete: () => console.log('📡 雷达覆盖范围已加载'),
})

console.log('📌 雷达覆盖范围示例：')
console.log('🟢 青色 - 相控阵雷达（椭球体）')
console.log('🟠 橙色 - 干扰雷达（圆锥体）')
console.log('🟡 黄色 - 双曲面雷达（Wall）')
console.log('💡 调整 radarRadius 可修改探测半径')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['椭球体 / 圆锥体 / 双曲面几何', '雷达波束扫描动画', '探测半径与仰角参数化', '多基站协同覆盖范围叠加'],
    points: ['相控阵雷达用椭球体近似覆盖范围', '双曲面需要自定义 Geometry', '覆盖范围叠加用半透明渲染'],
  },
}
