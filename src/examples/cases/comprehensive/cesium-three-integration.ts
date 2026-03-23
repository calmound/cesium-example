import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'cesium-three-integration',
  title: 'Cesium 融合 Three.js',
  category: '综合应用',
  description: '将 Cesium 三维地球与 Three.js 渲染器同步，共享相机矩阵，实现地理场景与 Three.js 特效的无缝叠加。',
  tags: ['Three.js', '融合', '渲染'],
  level: 'hard',
  files: {
    'main.ts': `\
// 🚧 占位代码 — 完整实现即将到来
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

viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.39, 39.9),
  label: {
    text: 'Cesium + Three.js',
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 10000),
  duration: 1.5,
})
console.log('📌 Cesium + Three.js — 完整实现开发中')
`,
    'style.css': `/* 在此添加自定义样式 */
.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['共享 WebGL Context 或双 Canvas 叠加', 'Cesium 相机矩阵同步到 Three.js', '坐标系对齐（WGS84 → Three ENU）', 'requestAnimationFrame 统一渲染循环'],
    points: ['推荐双 Canvas 方式避免 WebGL 状态冲突', '相机同步需每帧更新投影矩阵', '坐标原点取当前场景中心减少精度损失'],
  },
}
