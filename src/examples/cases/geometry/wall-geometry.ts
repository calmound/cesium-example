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
    text: '墙与扩散墙',
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 100000),
  duration: 1.5,
})
console.log('📌 墙与扩散墙 — 完整实现开发中')
`

export const meta: ExampleMeta = {
  id: 'wall-geometry',
  title: '墙与扩散墙',
  category: '面与几何体',
  description: '绘制垂直墙体、扩散墙（从中心向外展开）、走马灯墙（纹理流动），常用于围栏、防线、区域边界可视化。',
  tags: ['墙', '扩散墙', '走马灯'],
  level: 'medium',
  files: {
    'main.ts': mainTs,
    'style.css': css,
  },
  guide: {
    features: ['WallGraphics 墙体绘制', '扩散墙 CustomShader 实现', '走马灯纹理 UV 动画', '墙体高度随地形变化'],
    points: ['WallGraphics minimumHeights/maximumHeights 控制上下边', '扩散墙通过 time 驱动展开比例', '走马灯效果修改 UV 偏移量'],
  },
}
