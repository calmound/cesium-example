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
    text: '方量计算',
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 30000),
  duration: 1.5,
})
console.log('📌 方量计算 — 完整实现开发中')
`

export const meta: ExampleMeta = {
  id: 'volume-calculation',
  title: '方量计算',
  category: '空间分析',
  description: '基于设计高程与现状地形计算挖填方量，生成挖填方分布图，常用于土方工程量估算。',
  tags: ['方量', '土方', '挖填'],
  level: 'hard',
  files: {
    'main.ts': mainTs,
    'style.css': css,
  },
  guide: {
    features: ['密集高程采样网格化', '设计高程与现状高程差值', '挖方/填方分区着色', '方量累积计算'],
    points: ['采样密度直接影响计算精度', '挖方（现状 > 设计）/ 填方（现状 < 设计）', '方量 = 面积 × 平均高差'],
  },
}
