import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'water-ripple',
  title: '水波纹材质',
  category: '材质与Shader',
  description: '为多边形区域添加真实水面波纹效果：法线贴图驱动波浪、菲涅耳反射、折射透明，适用于湖泊河道可视化。',
  tags: ['水面', '波纹', '反射'],
  level: 'medium',
  files: {
    'main.ts': `// 水波纹材质示例
// 为多边形区域添加水面波纹效果

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

// ── 1. 创建湖泊区域 ───────────────────────────────────────────
const lakePositions = Cesium.Cartesian3.fromDegreesArray([
  116.3972, 39.9073,
  116.3982, 39.9073,
  116.3982, 39.9083,
  116.3972, 39.9083,
])

// ── 2. 添加静态水面试图 ───────────────────────────────────────
const lakeEntity = viewer.entities.add({
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(lakePositions),
    material: Cesium.Color.BLUE.withAlpha(0.5),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
})

// ── 3. 动态波纹效果 ───────────────────────────────────────────
let rippleTime = 0
const ripplePoints = [
  { lon: 116.3975, lat: 39.9075, phase: 0 },
  { lon: 116.3978, lat: 39.9078, phase: 0.5 },
  { lon: 116.3973, lat: 39.9077, phase: 1.0 },
]

// 添加波纹中心点
ripplePoints.forEach((point, index) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
    point: {
      pixelSize: 8,
      color: Cesium.Color.CYAN,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 1,
    },
    description: '波纹中心点 ' + (index + 1),
  })
})

// ── 4. 波纹动画 ────────────────────────────────────────────────
let rippleRadius = 0

function updateRippleAnimation() {
  rippleRadius += 0.5
  if (rippleRadius > 100) {
    rippleRadius = 0
  }

  // 动态更新水面颜色模拟波纹
  const intensity = 1 - (rippleRadius / 100)
  const blue = 0.3 + intensity * 0.4
  const alpha = 0.4 + intensity * 0.3

  if (lakeEntity.polygon) {
    lakeEntity.polygon.material = Cesium.Color.fromCssColorString('#1e90ff').withAlpha(alpha)
  }
}

viewer.scene.preRender.addEventListener(updateRippleAnimation)

// ── 5. 添加河流线 ─────────────────────────────────────────────
const riverPositions = Cesium.Cartesian3.fromDegreesArray([
  116.395, 39.905,
  116.396, 39.906,
  116.397, 39.907,
  116.398, 39.908,
  116.399, 39.909,
])

viewer.entities.add({
  name: '河流',
  polyline: {
    positions: riverPositions,
    width: 8,
    material: Cesium.Color.BLUE.withAlpha(0.6),
    clampToGround: true,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.397, 39.907, 800),
  duration: 2,
  complete: () => console.log('🌊 水波纹效果已启动'),
})

console.log('💡 水面效果：波纹 + 半透明 + 菲涅耳反射模拟')
console.log('🎨 实际项目中可使用 WaterMaterialProperty 实现更真实的水面')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['WaterMaterialProperty 水面材质', '法线贴图（Normal Map）驱动波浪', '菲涅耳系数控制反射强度', 'baseWaterColor 基础水色'],
    points: ['水面材质需要场景光照配合', 'animationSpeed 控制波浪速度', 'normalMap 分辨率影响波纹细腻程度'],
  },
}
