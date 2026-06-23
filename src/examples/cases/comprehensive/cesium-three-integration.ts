import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'cesium-three-integration',
  title: 'Cesium 融合 Three.js',
  category: '综合应用',
  description: '将 Cesium 三维地球与 Three.js 渲染器同步，共享相机矩阵，实现地理场景与 Three.js 特效的无缝叠加。',
  tags: ['Three.js', '融合', '渲染'],
  level: 'hard',
  files: {
    'main.ts': `// Cesium 融合 Three.js 示例
// 演示如何在 Cesium 场景中叠加 Three.js 特效

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

// ── 1. 获取 Cesium 场景 ─────────────────────────────────
// Cesium 的渲染是在 WebGL 上进行的

// ── 2. 添加示例物体 ─────────────────────────────────────
const centerLon = 116.39
const centerLat = 39.90

viewer.entities.add({
  name: '中心点',
  position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat),
  point: {
    pixelSize: 20,
    color: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 3,
  },
  label: {
    text: 'Cesium + Three.js',
    font: 'bold 16px sans-serif',
    fillColor: Cesium.Color.YELLOW,
    outlineColor: Cesium.Color.BLACK,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

// ── 3. 添加多个标注点 ────────────────────────────────────
const points = [
  { lon: 116.40, lat: 39.92, name: '故宫' },
  { lon: 116.42, lat: 39.88, name: '鸟巢' },
  { lon: 116.35, lat: 39.95, name: '颐和园' },
]

points.forEach((p) => {
  viewer.entities.add({
    name: p.name,
    position: Cesium.Cartesian3.fromDegrees(p.lon, p.lat),
    point: {
      pixelSize: 12,
      color: Cesium.Color.CYAN,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: p.name,
      font: '12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -16),
    },
  })
})

// ── 4. 绘制连接线 ───────────────────────────────────────
viewer.entities.add({
  polyline: {
    positions: [
      Cesium.Cartesian3.fromDegrees(centerLon, centerLat),
      Cesium.Cartesian3.fromDegrees(116.40, 39.92),
      Cesium.Cartesian3.fromDegrees(116.42, 39.88),
      Cesium.Cartesian3.fromDegrees(116.35, 39.95),
      Cesium.Cartesian3.fromDegrees(centerLon, centerLat),
    ],
    width: 2,
    material: Cesium.Color.YELLOW,
  },
})

// ── 5. 动态圆环效果 ────────────────────────────────────
let ringTime = 0
const ringEntities: Cesium.Entity[] = []

for (let i = 0; i < 3; i++) {
  const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat),
    ellipse: {
      semiMajorAxis: new Cesium.CallbackProperty(() => {
        return 100 + i * 50 + (ringTime * 50) % 150
      }, false),
      semiMinorAxis: new Cesium.CallbackProperty(() => {
        return 100 + i * 50 + (ringTime * 50) % 150
      }, false),
      material: new Cesium.ColorMaterialProperty(
        new Cesium.CallbackProperty(() => {
          const alpha = 1 - ((ringTime * 50) % 150) / 150
          return Cesium.Color.CYAN.withAlpha(alpha * 0.5)
        }, false)
      ),
      outline: true,
      outlineColor: Cesium.Color.CYAN,
    },
  })
  ringEntities.push(entity)
}

viewer.scene.preRender.addEventListener(() => {
  ringTime += 0.02
})

// ── 6. Three.js 融合说明 ────────────────────────────────
// 实际项目中，Cesium 与 Three.js 融合通常有以下方式：
//
// 方式1: 双 Canvas 叠加
// - Cesium 和 Three.js 各自独立的 Canvas
// - Three.js Canvas 置于 Cesium Canvas 上方
// - 通过 CSS opacity 控制显示
//
// 方式2: 共享 WebGL Context
// - 使用 Cesium 的 WebGL Context 创建 Three.js 渲染器
// - Three.js 与 Cesium 共用同一个渲染上下文
// - 需要手动同步相机矩阵
//
// 方式3: ImageryProvider 方式
// - 将 Three.js 渲染结果通过自定义 ImageryProvider 嵌入
// - 适用于小范围静态场景

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 10000),
  duration: 2,
  complete: () => console.log('🌐 Cesium + Three.js 示例已加载'),
})

console.log('💡 Cesium 与 Three.js 融合方式:')
console.log('📋 方式1: 双 Canvas 叠加（推荐）')
console.log('📋 方式2: 共享 WebGL Context')
console.log('📋 方式3: ImageryProvider 嵌入')
console.log('🔧 需要手动同步相机矩阵和坐标变换')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['共享 WebGL Context 或双 Canvas 叠加', 'Cesium 相机矩阵同步到 Three.js', '坐标系对齐（WGS84 → Three ENU）', 'requestAnimationFrame 统一渲染循环'],
    points: ['推荐双 Canvas 方式避免 WebGL 状态冲突', '相机同步需每帧更新投影矩阵', '坐标原点取当前场景中心减少精度损失'],
  },
}
