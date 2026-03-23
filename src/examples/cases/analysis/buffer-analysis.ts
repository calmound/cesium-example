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
  position: Cesium.Cartesian3.fromDegrees(116.39, 39.9),
  label: {
    text: '缓冲区分析',
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 200000),
  duration: 1.5,
})
console.log('📌 缓冲区分析 — 完整实现开发中')
`

export const meta: ExampleMeta = {
  id: 'buffer-analysis',
  title: '缓冲区分析',
  category: '空间分析',
  description: '对点、线、面要素生成指定半径的缓冲区，用于分析影响范围、服务覆盖区域、安全隔离带等空间关系。',
  tags: ['缓冲区', '空间分析', 'Turf.js'],
  level: 'medium',
  files: {
    'main.ts': mainTs,
    'style.css': css,
  },
  guide: {
    features: ['Turf.js buffer 缓冲区计算', '点缓冲（圆形）/ 线缓冲 / 面缓冲', '缓冲区叠加分析（交集/并集）', '缓冲区样式渲染'],
    points: ['Turf.js 在 WGS84 椭球上计算更精确', '单位可选 meters/kilometers/miles', '复杂多边形缓冲区计算较慢'],
  },
}
