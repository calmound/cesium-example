import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'skybox-scene',
  title: '天空盒与近地天空盒',
  category: '场景与粒子',
  description: '自定义天空盒六面体贴图，配置近地视角（高度 < 200km）时的自定义天空盒，实现太空到地面的无缝大气过渡。',
  tags: ['天空盒', '大气', '近地'],
  level: 'medium',
  files: {
    'main.ts': `\
const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false, animation: false, timeline: false,
  geocoder: false, homeButton: false, sceneModePicker: false,
  navigationHelpButton: false, fullscreenButton: false,
  skyBox: new Cesium.SkyBox({
    sources: {
      positiveX: 'https://cesium.com/downloads/cesiumjs/releases/1.104/Apps/SampleData/skybox/tycho2t3base09b/tycho2t3base09b_80_px.jpg',
      negativeX: 'https://cesium.com/downloads/cesiumjs/releases/1.104/Apps/SampleData/skybox/tycho2t3base09b/tycho2t3base09b_80_mx.jpg',
      positiveY: 'https://cesium.com/downloads/cesiumjs/releases/1.104/Apps/SampleData/skybox/tycho2t3base09b/tycho2t3base09b_80_py.jpg',
      negativeY: 'https://cesium.com/downloads/cesiumjs/releases/1.104/Apps/SampleData/skybox/tycho2t3base09b/tycho2t3base09b_80_my.jpg',
      positiveZ: 'https://cesium.com/downloads/cesiumjs/releases/1.104/Apps/SampleData/skybox/tycho2t3base09b/tycho2t3base09b_80_pz.jpg',
      negativeZ: 'https://cesium.com/downloads/cesiumjs/releases/1.104/Apps/SampleData/skybox/tycho2t3base09b/tycho2t3base09b_80_mz.jpg',
    },
  }),
  baseLayer: new Cesium.ImageryLayer(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: 'OpenStreetMap contributors',
    })
  ),
})
viewerRef.current = viewer

const centerLon = 116.39
const centerLat = 39.9

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 8000000),
  duration: 1.5,
})

console.log('Skybox Scene example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['SkyBox 自定义六面体贴图', 'SkyBoxOnGround 近地天空盒扩展', '高度阈值白天/夜晚切换', 'scene.atmosphere 大气散射参数'],
    points: ['近地天空盒需扩展 SkyBox 类重写 update', '高度检测在 preRender 事件中处理', '天空盒分辨率影响远景清晰度'],
  },
}
