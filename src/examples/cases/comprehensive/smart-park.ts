import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'smart-park',
  title: '智慧园区',
  category: '综合应用',
  description: '基于真实园区 3D Tiles 数据，集成人员定位、设备告警、视频监控、环境传感器等 IoT 数据的综合可视化平台。',
  tags: ['智慧园区', 'IoT', '3DTiles'],
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
  position: Cesium.Cartesian3.fromDegrees(114.06, 22.54),
  label: {
    text: '智慧园区',
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(114.06, 22.54, 300),
  duration: 1.5,
})
console.log('📌 智慧园区 — 完整实现开发中')
`,
    'style.css': `/* 在此添加自定义样式 */
.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['3D Tiles 园区模型加载', '实时人员位置更新', '告警点扩散动画', '视频融合监控'],
    points: ['WebSocket 接收实时位置数据', '告警级别对应颜色/动画强度', '建议分楼层管理实体'],
  },
}
