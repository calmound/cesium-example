import type { ExampleMeta } from '../../types'

const css = `/* 在此添加自定义样式 */
.cesium-widget-credits { display: none !important; }
`

const mainTs = `\
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
  position: Cesium.Cartesian3.fromDegrees(116.39, 40.1),
  label: {
    text: '可视域分析',
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 40.1, 50000),
  duration: 1.5,
})
console.log('📌 可视域分析 — 完整实现开发中')
`

export const meta: ExampleMeta = {
  id: 'viewshed-analysis',
  title: '可视域分析',
  category: '空间分析',
  description: '从指定观察点分析周围区域的可见性，将可见区域标注为绿色、遮挡区域标注为红色，辅助选址规划。',
  tags: ['视域', '可视分析', '阴影贴图'],
  level: 'hard',
  files: {
    'main.ts': mainTs,
    'style.css': css,
  },
  guide: {
    features: ['Shadow Map 阴影贴图实现可视域', '射线投射（Ray Casting）遮挡检测', '可视域渐变色渲染', '动态调节观察角度与距离'],
    points: ['视域分析本质是阴影贴图的变体', '地形分辨率影响分析精度', '大范围分析需 WebWorker 分帧计算'],
  },
}
