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
  position: Cesium.Cartesian3.fromDegrees(121.47, 31.23),
  label: {
    text: '日照分析',
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(121.47, 31.23, 1000),
  duration: 1.5,
})
console.log('📌 日照分析 — 完整实现开发中')
`

export const meta: ExampleMeta = {
  id: 'sunshine-analysis',
  title: '日照分析',
  category: '空间分析',
  description: '模拟任意日期时刻的太阳位置与建筑阴影，计算指定区域的日照时长，用于建筑规划日照评估。',
  tags: ['日照', '阴影', '太阳'],
  level: 'hard',
  files: {
    'main.ts': mainTs,
    'style.css': css,
  },
  guide: {
    features: ['scene.shadows 全局阴影开启', 'JulianDate 设置模拟时刻', 'viewer.clock 控制时间推进', 'Simon1994PlanetaryPositions 太阳位置'],
    points: ['shadows 开启会显著降低渲染性能', '软阴影（softShadows）需 WebGL2', '日照时长需逐小时采样计算'],
  },
}
