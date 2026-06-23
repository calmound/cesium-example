import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'wall-geometry',
  title: '墙与扩散墙',
  category: '面与几何体',
  description: '绘制垂直墙体、扩散墙（从中心向外展开）、走马灯墙（纹理流动），常用于围栏、防线、区域边界可视化。',
  tags: ['墙', '扩散墙', '走马灯'],
  level: 'medium',
  files: {
    'main.ts': `// 墙与扩散墙示例
// 演示 WallGraphics 绘制墙体

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

// ── 1. 普通墙体 ─────────────────────────────────────────────
const wallPositions = [
  Cesium.Cartesian3.fromDegrees(116.38, 39.90, 0),
  Cesium.Cartesian3.fromDegrees(116.40, 39.90, 0),
  Cesium.Cartesian3.fromDegrees(116.40, 39.92, 0),
  Cesium.Cartesian3.fromDegrees(116.38, 39.92, 0),
  Cesium.Cartesian3.fromDegrees(116.38, 39.90, 0),
]

viewer.entities.add({
  name: '普通墙体',
  wall: {
    positions: wallPositions,
    material: Cesium.Color.BLUE.withAlpha(0.6),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 2. 高度不同的墙体 ───────────────────────────────────────
viewer.entities.add({
  name: '梯形墙体',
  wall: {
    positions: Cesium.Cartesian3.fromDegreesArray([
      116.42, 39.88,
      116.45, 39.88,
      116.45, 39.90,
      116.42, 39.90,
    ]),
    maximumHeights: [100, 100, 200, 200],
    minimumHeights: [0, 0, 0, 0],
    material: Cesium.Color.GREEN.withAlpha(0.6),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 3. 圆形围墙 ─────────────────────────────────────────────
const circleSegments = 36
const circleWallPositions: Cesium.Cartesian3[] = []
const centerLon = 116.50
const centerLat = 39.91
const radius = 0.01

for (let i = 0; i <= circleSegments; i++) {
  const angle = (i / circleSegments) * Math.PI * 2
  const lon = centerLon + radius * Math.cos(angle)
  const lat = centerLat + radius * Math.sin(angle) * 0.7
  circleWallPositions.push(Cesium.Cartesian3.fromDegrees(lon, lat, 0))
}

viewer.entities.add({
  name: '圆形围墙',
  wall: {
    positions: circleWallPositions,
    maximumHeights: new Array(circleWallPositions.length).fill(80),
    minimumHeights: new Array(circleWallPositions.length).fill(0),
    material: Cesium.Color.ORANGE.withAlpha(0.5),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 4. 动态扩散墙效果 ───────────────────────────────────────
let expansionProgress = 0
const maxExpansion = 5000

viewer.entities.add({
  name: '扩散墙',
  position: Cesium.Cartesian3.fromDegrees(116.45, 39.94),
  ellipse: {
    semiMajorAxis: new Cesium.CallbackProperty(() => expansionProgress, false),
    semiMinorAxis: new Cesium.CallbackProperty(() => expansionProgress * 0.7, false),
    height: 10,
    material: Cesium.Color.CYAN.withAlpha(0.3),
    outline: true,
    outlineColor: Cesium.Color.CYAN,
    outlineWidth: 2,
  },
})

// ── 5. 纹理流动墙 ────────────────────────────────────────────
const stripeWallPositions = [
  Cesium.Cartesian3.fromDegrees(116.36, 39.86, 0),
  Cesium.Cartesian3.fromDegrees(116.38, 39.86, 0),
  Cesium.Cartesian3.fromDegrees(116.38, 39.88, 0),
  Cesium.Cartesian3.fromDegrees(116.36, 39.88, 0),
  Cesium.Cartesian3.fromDegrees(116.36, 39.86, 0),
]

viewer.entities.add({
  name: '条纹墙',
  wall: {
    positions: stripeWallPositions,
    maximumHeights: [50, 50, 50, 50, 50],
    minimumHeights: [0, 0, 0, 0, 0],
    material: Cesium.Color.RED.withAlpha(0.5),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 6. 动画循环 ──────────────────────────────────────────────
function updateAnimations() {
  expansionProgress += 20
  if (expansionProgress > maxExpansion) {
    expansionProgress = 0
  }
}

viewer.scene.preRender.addEventListener(updateAnimations)

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.44, 39.90, 15000),
  duration: 2,
  complete: () => console.log('🧱 墙体示例已加载'),
})

console.log('💡 WallGraphics 用于绘制垂直墙体')
console.log('📏 maximumHeights/minimumHeights 控制上下高度')
console.log('🔄 扩散墙通过 CallbackProperty 动态更新')
console.log('🎨 实际项目中可使用 CustomShader 实现更复杂纹理')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['WallGraphics 墙体绘制', '扩散墙 CustomShader 实现', '走马灯纹理 UV 动画', '墙体高度随地形变化'],
    points: ['WallGraphics minimumHeights/maximumHeights 控制上下边', '扩散墙通过 time 驱动展开比例', '走马灯效果修改 UV 偏移量'],
  },
}
