import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'water-ripple',
  title: '水波纹材质',
  category: '材质与Shader',
  description: '使用 Cesium 内建 Water 材质为湖面添加波纹动画，演示 normalMap、frequency、animationSpeed 与 specularIntensity 的原生用法。',
  tags: ['水面', 'WaterType', '材质'],
  level: 'medium',
  files: {
    'main.ts': `// 水波纹材质示例
// 使用 Cesium 内建 Water 材质为湖面添加真实波纹动画

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

viewer.scene.globe.enableLighting = true
viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#081421')
viewer.scene.globe.depthTestAgainstTerrain = true
viewer.scene.skyAtmosphere.hueShift = -0.18
viewer.scene.skyAtmosphere.saturationShift = -0.45
viewer.scene.fog.enabled = false
viewer.scene.postProcessStages.fxaa.enabled = true

const waterNormalMap = Cesium.buildModuleUrl('Assets/Textures/waterNormals.jpg')

// ── 1. 创建湖泊区域 ───────────────────────────────────────────
const lakePositions = Cesium.Cartesian3.fromDegreesArray([
  116.3958, 39.9066,
  116.3968, 39.9062,
  116.3982, 39.9062,
  116.3990, 39.9070,
  116.3991, 39.9079,
  116.3985, 39.9086,
  116.3973, 39.9088,
  116.3960, 39.9084,
  116.3955, 39.9074,
])

const waterMaterial = Cesium.Material.fromType(Cesium.Material.WaterType, {
  baseWaterColor: new Cesium.Color(0.04, 0.28, 0.44, 0.86),
  blendColor: new Cesium.Color(0.04, 0.55, 0.78, 0.42),
  normalMap: waterNormalMap,
  frequency: 14.0,
  animationSpeed: 0.015,
  amplitude: 1.1,
  specularIntensity: 0.75,
  fadeFactor: 1.0,
})

const infoPanel = document.createElement('div')
infoPanel.style.cssText = [
  'position:absolute',
  'top:16px',
  'left:16px',
  'width:300px',
  'padding:14px 16px',
  'border-radius:16px',
  'background:linear-gradient(180deg, rgba(6,18,30,0.94), rgba(7,34,52,0.8))',
  'border:1px solid rgba(111,208,255,0.22)',
  'box-shadow:0 16px 38px rgba(0,0,0,0.28)',
  'backdrop-filter:blur(12px)',
  'color:#e8f7ff',
  'font:12px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  'pointer-events:none',
  'z-index:10',
].join(';')
infoPanel.innerHTML = [
  '<div style="font-size:15px;font-weight:700;margin-bottom:8px">WaterType 水波纹</div>',
  '<div style="opacity:0.78;margin-bottom:10px">原生 Water 材质会基于 normalMap 和 czm_frameNumber 自动生成波纹与高光。</div>',
  '<div style="display:grid;grid-template-columns:110px 1fr;gap:4px 10px">',
  '<span style="opacity:0.65">normalMap</span><span>waterNormals.jpg</span>',
  '<span style="opacity:0.65">frequency</span><span>14.0，控制波浪密度</span>',
  '<span style="opacity:0.65">animationSpeed</span><span>0.015，控制流动速度</span>',
  '<span style="opacity:0.65">specularIntensity</span><span>0.75，控制镜面高光</span>',
  '</div>',
].join('')
container.appendChild(infoPanel)

// ── 2. 添加水面与岸线 ───────────────────────────────────────
const lakeEntity = viewer.entities.add({
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(lakePositions),
    material: waterMaterial,
    outline: true,
    outlineColor: Cesium.Color.fromCssColorString('#b6ecff').withAlpha(0.6),
  },
})

viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.3974, 39.9075, 0),
  point: {
    pixelSize: 8,
    color: Cesium.Color.fromCssColorString('#b6ecff'),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
})

viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.3974, 39.9075, 0),
  label: {
    text: '湖心波纹中心',
    font: '600 12px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK.withAlpha(0.75),
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -18),
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.3974, 39.9075, 1100),
  orientation: {
    heading: Cesium.Math.toRadians(-20),
    pitch: Cesium.Math.toRadians(-34),
    roll: 0,
  },
  duration: 2,
  complete: () => console.log('🌊 Cesium Water 材质水面已启动'),
})

console.log('💡 已使用 Cesium.Material.WaterType 构建水面材质')
console.log('🧩 波纹由 normalMap + frequency + animationSpeed 驱动')
console.log('✨ 可继续调整 baseWaterColor / blendColor / amplitude / specularIntensity')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['Cesium.Material.WaterType 原生水面材质', 'waterNormals.jpg 法线贴图驱动波纹', 'baseWaterColor / blendColor 控制水色过渡', 'frequency / animationSpeed / amplitude 调节波形'],
    points: ['Water 材质会随 czm_frameNumber 自动流动，不需要手写 preRender 更新 alpha', 'normalMap 是水面波纹是否明显的关键', 'polygon 的 st 映射决定水纹铺陈密度'],
  },
}
