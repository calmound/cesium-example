import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'diffusion-point',
  title: '动态扩散点',
  category: '材质与Shader',
  description: '实现 3 圈循环扩散的圆形波纹点特效，使用 CallbackProperty 驱动半径与透明度变化，适合事件告警、POI 高亮和实时数据推送。',
  tags: ['扩散点', '动态材质', 'CallbackProperty'],
  level: 'easy',
  files: {
    'main.ts': `// 动态扩散点示例
// 使用 CallbackProperty 驱动三圈扩散波纹

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

viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#07111d')
viewer.scene.fog.enabled = false

// ── 1. 扩散点数据 ─────────────────────────────────────────────
const diffusionPoints = [
  { lon: 116.3972, lat: 39.9073, color: Cesium.Color.RED, name: '告警点A' },
  { lon: 121.4737, lat: 31.2304, color: Cesium.Color.ORANGE, name: '告警点B' },
  { lon: 113.2644, lat: 23.1291, color: Cesium.Color.YELLOW, name: '告警点C' },
]

function createRingMaterial(color, startDelayMs, cycleMs) {
  const startTime = performance.now()

  return new Cesium.ColorMaterialProperty(
    new Cesium.CallbackProperty(() => {
      let elapsed = (performance.now() - startTime - startDelayMs) % cycleMs
      if (elapsed < 0) {
        elapsed += cycleMs
      }

      const progress = elapsed / cycleMs
      const fade = 1 - progress
      return color.withAlpha(Math.max(0.02, fade * 0.75))
    }, false)
  )
}

function createRingRadius(startDelayMs, cycleMs, maxRadius) {
  const startTime = performance.now()

  return new Cesium.CallbackProperty(() => {
    let elapsed = (performance.now() - startTime - startDelayMs) % cycleMs
    if (elapsed < 0) {
      elapsed += cycleMs
    }

    const progress = elapsed / cycleMs
    return 18 + progress * maxRadius
  }, false)
}

// ── 2. 添加扩散点及其波纹 ─────────────────────────────────────
const ringOffsets = [0, 700, 1400]
const ringCycleMs = 2100
const ringMaxRadius = 320

diffusionPoints.forEach((point, index) => {
  const position = Cesium.Cartesian3.fromDegrees(point.lon, point.lat)
  const staggerOffset = index * 160

  viewer.entities.add({
    name: point.name,
    position,
    point: {
      pixelSize: 10,
      color: point.color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text: point.name,
      font: '600 12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK.withAlpha(0.7),
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -18),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })

  ringOffsets.forEach((delayMs, ringIndex) => {
    const effectiveDelay = delayMs + staggerOffset

    viewer.entities.add({
      name: point.name + '-ring-' + (ringIndex + 1),
      position,
      ellipse: {
        semiMajorAxis: createRingRadius(effectiveDelay, ringCycleMs, ringMaxRadius),
        semiMinorAxis: createRingRadius(effectiveDelay, ringCycleMs, ringMaxRadius),
        material: createRingMaterial(point.color, effectiveDelay, ringCycleMs),
        height: 1 + ringIndex * 0.5,
      },
    })
  })
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.3972, 35.2, 6200000),
  duration: 2,
  complete: () => console.log('📍 扩散点告警效果已启动'),
})

console.log('💡 扩散点特效：每个点包含 3 圈循环扩散波纹')
console.log('🎨 使用 CallbackProperty 分别驱动半径和透明度')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['3 圈循环扩散波纹', 'CallbackProperty 驱动半径增长', 'ColorMaterialProperty 控制透明度衰减', '多点共用同一动画模板'],
    points: ['每圈独立相位偏移，形成连续扩散感', '用 CallbackProperty 直接驱动 Entity 属性，避免空 preRender 循环', '半径和透明度一起变化，扩散感更自然'],
  },
}
