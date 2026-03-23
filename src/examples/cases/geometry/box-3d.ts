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
    text: '立体盒子圆锥',
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
console.log('📌 立体盒子圆锥 — 完整实现开发中')
`

export const meta: ExampleMeta = {
  id: 'box-3d',
  title: '立体盒子与圆锥',
  category: '面与几何体',
  description: '绘制三维盒子、圆锥、四棱锥、光锥等立体几何体，展示统计柱状图（圆锥/盒子编码数值）应用场景。',
  tags: ['盒子', '圆锥', '立体几何'],
  level: 'easy',
  files: {
    'main.ts': mainTs,
    'style.css': css,
  },
  guide: {
    features: ['BoxGraphics 盒子', 'CylinderGraphics 圆柱/圆锥', '四棱锥（自定义 Geometry）', '圆锥追踪体动画'],
    points: ['CylinderGraphics topRadius=0 即为圆锥', '立体几何可用于统计图表', 'Primitive 合并渲染 10000+ 个几何体'],
  },
}
