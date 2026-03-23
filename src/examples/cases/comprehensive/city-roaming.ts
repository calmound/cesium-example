import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'city-roaming',
  title: '城市漫游系统',
  category: '综合应用',
  description: '综合运用地形、OSM 建筑、glTF 模型、后处理效果，实现第一人称城市漫步与自动巡游路径播放。',
  tags: ['城市', '漫游', '第一人称'],
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
    text: '城市漫游',
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(121.47, 31.23, 200),
  duration: 1.5,
})
console.log('📌 城市漫游 — 完整实现开发中')
`,
    'style.css': `/* 在此添加自定义样式 */
.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['第一人称相机控制器', 'OSM Buildings + 地形组合', 'Bloom + AmbientOcclusion 后处理', '自动巡游路径关键帧插值'],
    points: ['第一人称需禁用默认 CameraController', 'Bloom 效果增强城市夜景质感', '巡游路径建议用 CatmullRom 样条插值'],
  },
}
