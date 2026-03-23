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
    text: '矩形圆形扇形',
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 500000),
  duration: 1.5,
})
console.log('📌 矩形圆形扇形 — 完整实现开发中')
`

export const meta: ExampleMeta = {
  id: 'rectangle-circle',
  title: '矩形、圆与扇形',
  category: '面与几何体',
  description: '绘制矩形、圆形、椭圆、扇形等规则几何面，支持贴地、挤出、旋转等属性，配合 Primitive 实现大量渲染。',
  tags: ['矩形', '圆形', '扇形'],
  level: 'easy',
  files: {
    'main.ts': mainTs,
    'style.css': css,
  },
  guide: {
    features: ['RectangleGraphics 矩形', 'EllipseGraphics 圆/椭圆', '扇形（startAngle/stopAngle）', '正多边形近似圆形'],
    points: ['EllipseGraphics semiMajorAxis/semiMinorAxis 半轴（米）', '扇形通过限制角度范围实现', 'rotation 属性可旋转矩形'],
  },
}
