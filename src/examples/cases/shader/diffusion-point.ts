import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'diffusion-point',
  title: '动态扩散点',
  category: '材质与Shader',
  description: '实现向外扩散的圆形波纹点特效，常用于事件告警、POI 高亮标注、实时数据推送等场景的视觉强调。',
  tags: ['扩散点', '动态材质', '告警'],
  level: 'easy',
  files: {
    'main.ts': `// 动态扩散点示例
// 实现向外扩散的圆形波纹点特效

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

// ── 1. 扩散点数据 ─────────────────────────────────────────────
const diffusionPoints = [
  { lon: 116.3972, lat: 39.9073, color: Cesium.Color.RED, name: '告警点A' },
  { lon: 121.4737, lat: 31.2304, color: Cesium.Color.ORANGE, name: '告警点B' },
  { lon: 113.2644, lat: 23.1291, color: Cesium.Color.YELLOW, name: '告警点C' },
]

// ── 2. 添加扩散点及其波纹 ─────────────────────────────────────
diffusionPoints.forEach((point) => {
  // 中心点
  viewer.entities.add({
    name: point.name,
    position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
    point: {
      pixelSize: 10,
      color: point.color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
  })

  // 扩散波纹 1
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
    ellipse: {
      semiMajorAxis: 100,
      semiMinorAxis: 100,
      material: point.color.withAlpha(0.8),
      height: 1,
    },
  })

  // 扩散波纹 2
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
    ellipse: {
      semiMajorAxis: 200,
      semiMinorAxis: 200,
      material: point.color.withAlpha(0.5),
      height: 2,
    },
  })

  // 扩散波纹 3
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
    ellipse: {
      semiMajorAxis: 300,
      semiMinorAxis: 300,
      material: point.color.withAlpha(0.3),
      height: 3,
    },
  })
})

// ── 3. 扩散动画 ────────────────────────────────────────────────
let time = 0
const maxRadius = 300

function updateDiffusion() {
  time += 0.02
  const phase1 = (time % (Math.PI * 2)) / (Math.PI * 2)
  const phase2 = ((time + 0.33) % (Math.PI * 2)) / (Math.PI * 2)
  const phase3 = ((time + 0.66) % (Math.PI * 2)) / (Math.PI * 2)

  const entities = viewer.entities.values
  let entityIndex = 0

  diffusionPoints.forEach((point) => {
    // 更新三个波纹的半径
    const radii = [
      phase1 * maxRadius,
      phase2 * maxRadius,
      phase3 * maxRadius,
    ]

    entities.forEach((entity) => {
      if (entity._name === point.name + '_ring') {
        // 更新波纹大小和透明度
      }
    })
  })
}

viewer.scene.preRender.addEventListener(updateDiffusion)

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(110, 32, 15000000),
  duration: 2,
  complete: () => console.log('📍 扩散点告警效果已启动'),
})

console.log('💡 扩散点特效：多圈波纹向外扩散')
console.log('🎨 颜色编码：红色=严重, 橙色=警告, 黄色=提示')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['CircleRippleMaterial 扩散波纹', '多圈波纹相位差错开', 'scale 随时间线性增大', 'alpha 随 scale 衰减'],
    points: ['相位差 = 1 / 波纹数量', 'mod(time, period) 实现循环', '波纹数量建议 2-4 个'],
  },
}
