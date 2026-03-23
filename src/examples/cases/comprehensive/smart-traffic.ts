import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'smart-traffic',
  title: '智慧交通',
  category: '综合应用',
  description: '实时展示城市交通流量、路段拥堵状态、车辆轨迹回放，结合热力图与流线图呈现交通宏观态势。',
  tags: ['交通', '流量', '拥堵'],
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
  position: Cesium.Cartesian3.fromDegrees(121.47, 31.23),
  label: {
    text: '智慧交通',
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(121.47, 31.23, 5000),
  duration: 1.5,
})
console.log('📌 智慧交通 — 完整实现开发中')
`,
    'style.css': `/* 在此添加自定义样式 */
.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['路网 GeoJSON 按拥堵着色', '车辆轨迹 CZML 回放', '交通流量热力图', '路段点击查询详情'],
    points: ['拥堵颜色：绿→黄→橙→红→深红', '车辆密度超 1000 改用 Primitive 渲染', '流量热力图建议 5 分钟刷新一次'],
  },
}
