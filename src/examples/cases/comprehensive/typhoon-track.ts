import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'typhoon-track',
  title: '台风路径追踪',
  category: '综合应用',
  description: '展示台风历史路径与强度变化，动画回放台风移动过程，圆圈大小表达影响半径，颜色表达强度等级。',
  tags: ['台风', '气象', '路径'],
  level: 'medium',
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
  position: Cesium.Cartesian3.fromDegrees(130, 25),
  label: {
    text: '台风路径',
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(130, 25, 3000000),
  duration: 1.5,
})
console.log('📌 台风路径 — 完整实现开发中')
`,
    'style.css': `/* 在此添加自定义样式 */
.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['台风路径折线与节点标注', '影响半径动态圆圈', '强度等级颜色编码', '动画逐步展示路径'],
    points: ['台风圆圈半径对应 7/10/12 级风圈', '路径节点时间间隔 6 小时', '动画速度可按实际时间比例播放'],
  },
}
