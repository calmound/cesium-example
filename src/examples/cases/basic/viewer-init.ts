import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'viewer-init',
  title: 'Viewer 初始化配置',
  category: '基础操作',
  description: '掌握 Cesium.Viewer 的完整配置项：隐藏 UI 控件、设置默认底图、配置时钟、开启/关闭大气光照，搭建干净的三维场景容器。',
  tags: ['Viewer', '初始化', '配置'],
  level: 'easy',
  files: {
    'main.ts': `// Viewer 初始化配置详解
const viewer = new Cesium.Viewer(container, {
  // ── 底图（使用 OSM，无需 Ion Token）────────────
  baseLayerPicker: false,
  baseLayer: new Cesium.ImageryLayer(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: 'OpenStreetMap contributors',
    })
  ),

  // ── 隐藏默认 UI 控件 ───────────────────────────
  animation: false,            // 动画控件
  timeline: false,             // 时间轴
  geocoder: false,             // 地名搜索
  homeButton: false,           // Home 按钮
  sceneModePicker: false,      // 场景模式切换
  navigationHelpButton: false, // 导航帮助
  fullscreenButton: false,     // 全屏按钮
  infoBox: false,              // 点击弹窗
  selectionIndicator: false,   // 选中高亮框
})

viewerRef.current = viewer

// ── 大气与环境光照 ─────────────────────────────
viewer.scene.skyAtmosphere.show = true      // 大气光晕
viewer.scene.fog.enabled = true             // 地平线雾效
viewer.scene.globe.enableLighting = true    // 日照光照（随时间变化）
viewer.scene.globe.showGroundAtmosphere = true  // 地面大气

// ── 时钟配置 ──────────────────────────────────
viewer.clock.shouldAnimate = true   // 启动时钟（大气光照随之变化）
viewer.clock.multiplier = 1.0       // 1 倍速

// ── requestRenderMode：降低 GPU 占用 ────────────
// 场景静止时暂停渲染，有变化时才重绘
viewer.scene.requestRenderMode = false  // 保持实时渲染（光照动画需要）

// ── 初始视角 ──────────────────────────────────
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 12000000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-90),
    roll: 0,
  },
})

console.log('✅ Viewer 初始化完成')
console.log('🌍 大气光照：已开启（enableLighting = true）')
console.log('⏱️  时钟运行中，multiplier =', viewer.clock.multiplier)
console.log('📍 初始视角：北京上空 12,000 km')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['Viewer 构造参数详解', '隐藏默认 UI 控件', '设置初始视角与底图', '开启场景光照与大气'],
    points: ['imageryProvider 已废弃，改用 baseLayer', 'shouldAnimate=true 启动时钟', 'requestRenderMode 降低 GPU 占用'],
  },
}
