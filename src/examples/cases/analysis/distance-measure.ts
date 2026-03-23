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
    text: '距离面积量算',
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
console.log('📌 距离面积量算 — 完整实现开发中')
`

export const meta: ExampleMeta = {
  id: 'distance-measure',
  title: '距离与面积量算',
  category: '空间分析',
  description: '点击地图绘制折线/多边形，实时计算段距离、总长度和多边形面积，支持贴地模式与三维空间量算。',
  tags: ['测量', '距离', '面积'],
  level: 'medium',
  files: {
    'main.ts': mainTs,
    'style.css': css,
  },
  guide: {
    features: ['ScreenSpaceEventHandler 鼠标拾取', 'EllipsoidGeodesic 大地线距离', '球面面积公式', '动态折线/多边形绘制'],
    points: ['globe.pick 拾取地形表面坐标', 'EllipsoidGeodesic 考虑地球曲率', '大于 100km 时曲率误差显著'],
  },
}
