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
    text: '多边形面',
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 300000),
  duration: 1.5,
})
console.log('📌 多边形面 — 完整实现开发中')
`

export const meta: ExampleMeta = {
  id: 'polygon-face',
  title: '多边形面',
  category: '面与几何体',
  description: '绘制各类多边形：普通多边形、孔洞多边形、贴地多边形、挤出建筑体，对比 Entity 与 Primitive 批量渲染。',
  tags: ['多边形', 'PolygonGraphics', 'Primitive'],
  level: 'easy',
  files: {
    'main.ts': mainTs,
    'style.css': css,
  },
  guide: {
    features: ['PolygonGraphics 多边形配置', 'PolygonHierarchy 孔洞多边形', 'extrudedHeight 挤出高度（建筑体）', 'Primitive 批量合并渲染'],
    points: ['孔洞多边形节点需逆时针', 'extrudedHeight 从地面挤出', 'PerInstanceColorAppearance 每实例着色'],
  },
}
