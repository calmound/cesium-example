import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'pipe-line',
  title: '管道线',
  category: '线与路径',
  description: '渲染具有截面形状的三维管道，支持圆形、方形截面，可添加流动纹理模拟液体/气体传输效果。',
  tags: ['管道', '走廊', 'Corridor'],
  level: 'medium',
  files: {
    'main.ts': `// 管道线示例：Corridor vs PolylineVolume
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

// ── 管道路径点 ─────────────────────────────────────
const pipePath = [
  Cesium.Cartesian3.fromDegrees(116.3, 39.8, 10000),
  Cesium.Cartesian3.fromDegrees(116.5, 39.7, 12000),
  Cesium.Cartesian3.fromDegrees(116.7, 39.6, 15000),
  Cesium.Cartesian3.fromDegrees(116.9, 39.5, 18000),
  Cesium.Cartesian3.fromDegrees(117.0, 39.4, 20000),
]

// ── CorridorGraphics（矩形截面走廊）───────────────
viewer.entities.add({
  name: '矩形管道（Corridor）',
  corridor: {
    positions: pipePath,
    width: 2000,
    height: 5000,
    material: Cesium.Color.BLUE.withAlpha(0.6),
    cornerType: Cesium.CornerType.ROUNDED,
  },
})

// ── PolylineVolumeGraphics（圆形截面管道）─────────
function createCircleShape(radius: number): Cesium.Cartesian2[] {
  const shape: Cesium.Cartesian2[] = []
  const segments = 32
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    shape.push(new Cesium.Cartesian2(Math.cos(angle) * radius, Math.sin(angle) * radius))
  }
  return shape
}

const circleShape = createCircleShape(800)

viewer.entities.add({
  name: '圆形管道（PolylineVolume）',
  polylineVolume: {
    positions: pipePath,
    shape: new Cesium.CallbackProperty(() => circleShape, false),
    material: new Cesium.ColorMaterialProperty(Cesium.Color.CYAN.withAlpha(0.7)),
    cornerType: Cesium.CornerType.ROUNDED,
  },
})

console.log('✅ 添加 Corridor（矩形）和 PolylineVolume（圆形）管道')

// ── 添加第二条方形管道 ─────────────────────────────
viewer.entities.add({
  name: '方形管道',
  corridor: {
    positions: [
      Cesium.Cartesian3.fromDegrees(116.2, 39.6, 8000),
      Cesium.Cartesian3.fromDegrees(116.4, 39.5, 8000),
      Cesium.Cartesian3.fromDegrees(116.6, 39.4, 8000),
    ],
    width: 1500,
    height: 3000,
    material: Cesium.Color.ORANGE.withAlpha(0.6),
    cornerType: Cesium.CornerType.MITERED,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.6, 39.6, 150000),
  duration: 2,
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['CorridorGraphics 走廊（矩形截面）', 'PolylineVolumeGraphics 管道（圆形截面）', '流动纹理 UV 动画', '管道高度与地形融合'],
    points: ['PolylineVolume shape 定义截面多边形', 'Corridor 性能更好（无截面旋转）', '流动效果通过 CallbackProperty 驱动'],
  },
}
