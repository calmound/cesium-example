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
    text: '球半球椭球',
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
console.log('📌 球半球椭球 — 完整实现开发中')
`

export const meta: ExampleMeta = {
  id: 'sphere-3d',
  title: '球、半球与椭球',
  category: '面与几何体',
  description: '绘制球体、半球（雷达探测范围）、椭球等弧面几何体，实现多种尺寸与颜色的批量渲染。',
  tags: ['球体', '半球', '椭球'],
  level: 'easy',
  files: {
    'main.ts': mainTs,
    'style.css': css,
  },
  guide: {
    features: ['EllipsoidGraphics 椭球/球体', '半球（cutoutRectangle）', '批量球体 Primitive 合并渲染', '球体作为雷达探测范围'],
    points: ['EllipsoidGraphics 三轴半径控制形状', '半球通过 minimumClock/maximumClock 裁剪', 'Primitive 合并球体显著降低 DrawCall'],
  },
}
