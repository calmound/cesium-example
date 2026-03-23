import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: '3dtiles-basic',
  title: '3D Tiles 基础加载',
  category: '3D Tiles',
  description: '加载 3D Tiles 格式数据集（建筑、点云、倾斜摄影），调节最大屏幕空间误差（SSE）平衡精度与性能。',
  tags: ['3DTiles', '倾斜摄影', '点云'],
  level: 'easy',
  files: {
    'main.ts': `// 3D Tiles 基础加载示例
// 演示加载 3D Tiles 格式数据集，调节 SSE 平衡精度与性能

const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false, animation: false, timeline: false,
  geocoder: false, homeButton: false, sceneModePicker: false,
  navigationHelpButton: false, fullscreenButton: false,
})
viewerRef.current = viewer

// ── 1. 加载 3D Tiles 瓦片集 ───────────────────────────────────
const tileset = new Cesium.Cesium3DTileset.fromUrl(
  'https://data.macity.com/3dtiles/melbourne/tileset.json'
)

tileset.readyPromise.then(() => {
  viewer.scene.primitives.add(tileset)

  // 飞行到瓦片集边界
  viewer.zoomTo(
    tileset,
    new Cesium.HeadingPitchRange(0, -0.5, 0)
  )
  console.log('✓ 3D Tiles 加载完成')
})

// ── 2. 最大屏幕空间误差（SSE）控制 ──────────────────────────────
// SSE 越小，渲染精度越高，但性能开销越大
tileset.maximumScreenSpaceError = 16 // 默认值 16

// ── 3. 样式控制 ────────────────────────────────────────────────
const defaultStyle = new Cesium.Cesium3DTileStyle({
  color: {
    conditions: [
      ['height >= 300', 'rgb(45, 0, 75)'],
      ['height >= 200', 'rgb(102, 0, 140)'],
      ['height >= 100', 'rgb(170, 0, 255)'],
      ['height >= 50', 'rgb(221, 136, 255)'],
      ['true', 'rgb(255, 230, 255)'],
    ],
  },
})

// 根据高度着色
tileset.style = defaultStyle

// ── 4. 显示/隐藏控制 ───────────────────────────────────────────
let tilesetVisible = true

// ── 5. 调试选项（可选）─────────────────────────────────────────
// tileset.debugShowBoundingVolume = true  // 显示边界框
// tileset.debugShowContentBoundingVolume = true  // 显示内容边界

// ── 6. GUI 控制面板 ───────────────────────────────────────────
// const gui = new Cesium.Viewer('container', { selectionIndicator: false })

// 创建控制面板（模拟）
console.log('3D Tiles 基础控制：')
console.log('- maximumScreenSpaceError: 调节渲染精度 (1-128)')
console.log('- style: 高度着色样式')
console.log('- show: 瓦片集显隐控制')

// ── 7. 清理 ────────────────────────────────────────────────────
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(144.9631, -37.814, 500),
  duration: 2,
})

console.log('📍 3D Tiles 数据来源: Melbourne Photogrammetry')
console.log('💡 SSE 越小精度越高，但渲染开销越大')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['Cesium3DTileset.fromUrl 加载瓦片集', 'maximumScreenSpaceError 细节层次控制', 'Cesium3DTileStyle 样式表达式', 'show/hide 瓦片集显隐'],
    points: ['3D Tiles 按视野流式加载', 'SSE 越小精度越高但性能越差', 'debugShowBoundingVolume 辅助调试'],
  },
}
