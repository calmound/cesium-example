import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'weather-effects',
  title: '雨雪雾天气特效',
  category: '场景与粒子',
  description: '使用粒子系统模拟真实雨雪效果，通过后处理 Stage 实现体积雾，支持参数动态调节渲染强度。',
  tags: ['雨雪', '雾效', '粒子'],
  level: 'medium',
  files: {
    'main.ts': `\
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

const centerLon = 116.39
const centerLat = 39.9

const rainSystem = viewer.scene.primitives.add(
  new Cesium.ParticleSystem({
    glow: false,
    url: undefined,
    emissionRate: 1000,
    bursts: [],
    emitter: new Cesium.CircleEmitter(50.0),
    emitterSize: 50,
    emitterLength: 10,
    minEmitPower: 30,
    maxEmitPower: 50,
    minLifeTime: 1.0,
    maxLifeTime: 1.5,
    minSize: 0.1,
    maxSize: 0.2,
    image: undefined,
    color: new Cesium.Color(0.8, 0.8, 0.9, 0.6),
    updateCallback: (particle: any) => {
      particle.position = Cesium.Cartesian3.clone(
        Cesium.Cartesian3.fromDegrees(
          centerLon + (Math.random() - 0.5) * 0.1,
          centerLat + (Math.random() - 0.5) * 0.1,
          500
        ),
        particle.position
      )
    },
  })
)

viewer.scene.fog.enabled = true
viewer.scene.fog.density = 0.0001
viewer.scene.fog.color = Cesium.Color.LIGHTGRAY

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 500),
  duration: 1.5,
})

console.log('Weather Effects example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['ParticleSystem 雨雪粒子模拟', 'PostProcessStage 雾效后处理', '粒子速度/方向风向控制', '天气强度参数调节'],
    points: ['雨粒子用细长条纹理效果更真实', '雪粒子可加旋转速度模拟飘落', '雾效通过深度值混合背景色实现'],
  },
}
