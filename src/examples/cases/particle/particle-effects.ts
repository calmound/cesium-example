import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'particle-effects',
  title: '粒子效果',
  category: '场景与粒子',
  description: '使用 Cesium 粒子系统模拟火焰、烟雾、爆炸等自然效果，调节发射速率、寿命、重力等物理参数。',
  tags: ['粒子', '火焰', '烟雾'],
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
const emitterPosition = Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 50)

const fireSystem = viewer.scene.primitives.add(
  new Cesium.ParticleSystem({
    glow: true,
    emissionRate: 50,
    emitter: new Cesium.ConeEmitter(5.0),
    emitterSize: 10,
    minEmitPower: 1,
    maxEmitPower: 3,
    minLifeTime: 0.5,
    maxLifeTime: 1.5,
    minSize: 15,
    maxSize: 30,
    color: new Cesium.Color(1.0, 0.5, 0.0, 1.0),
    updateCallback: (particle: any) => {
      particle.position = Cesium.Cartesian3.clone(emitterPosition, particle.position)
    },
  })
)

viewer.entities.add({
  position: emitterPosition,
  box: {
    dimensions: new Cesium.Cartesian3(10, 10, 10),
    material: Cesium.Color.GRAY,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 2000),
  duration: 1.5,
})

console.log('Particle Effects example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['ParticleSystem 粒子系统配置', 'emissionRate / lifetime 发射参数', 'startColor/endColor 颜色渐变', 'gravity / wind 物理模拟'],
    points: ['粒子纹理推荐 32x32 白色圆形', 'emitter 支持 Box/Circle/Cone/Sphere', 'updateCallback 每帧自定义粒子行为'],
  },
}
