import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'underground-mode',
  title: '地表透明（地下模式）',
  category: '地形分析',
  description: '将地球表面设为半透明，露出地下管网、隧道等地下设施，实现"透视地球"的地下空间可视化效果。',
  tags: ['地下模式', '透明', '地下管网'],
  level: 'medium',
  files: {
    'main.ts': `const viewer = new Cesium.Viewer(container, {
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

viewer.scene.globe.depthTestAgainstTerrain = false

const centerLon = 116.39
const centerLat = 39.9

const undergroundColor = new Cesium.Color(0.1, 0.1, 0.15, 1.0)

viewer.scene.globe.translucency = {
  enabled: true,
  frontFaceAlpha: 0.3,
  frontFaceAlphaByDistance: new Cesium.NearFarScalar(1000, 0.3, 50000, 0.1),
  backFaceAlpha: 0.1,
  backFaceAlphaByDistance: new Cesium.NearFarScalar(1000, 0.1, 50000, 0.05),
  enabled: true,
}

viewer.scene.globe.undergroundColor = undergroundColor
viewer.scene.globe.undergroundColorAlphaByDistance = new Cesium.NearFarScalar(
  1000,
  0.0,
  10000,
  0.5
)

const pipeMaterial = new Cesium.ColorMaterialProperty(
  Cesium.Color.CYAN.withAlpha(0.9)
)

const pipe1 = viewer.entities.add({
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArray([
      centerLon - 0.05, centerLat,
      centerLon - 0.03, centerLat,
      centerLon - 0.01, centerLat + 0.01,
      centerLon + 0.01, centerLat + 0.02,
    ]),
    width: 8,
    material: pipeMaterial,
    clampToGround: false,
  },
})

const pipe2 = viewer.entities.add({
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArray([
      centerLon, centerLat - 0.03,
      centerLon, centerLat,
      centerLon + 0.02, centerLat + 0.01,
      centerLon + 0.03, centerLat + 0.02,
    ]),
    width: 6,
    material: new Cesium.ColorMaterialProperty(
      Cesium.Color.ORANGE.withAlpha(0.9)
    ),
    clampToGround: false,
  },
})

const tunnelEntity = viewer.entities.add({
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      centerLon - 0.05, centerLat + 0.02, -50,
      centerLon + 0.05, centerLat + 0.02, -50,
    ]),
    width: 15,
    material: new Cesium.ColorMaterialProperty(
      Cesium.Color.GRAY.withAlpha(0.7)
    ),
    clampToGround: false,
  },
})

const undergroundLabel = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, -20),
  label: {
    text: '地下管网系统',
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -20),
    backgroundColor: new Cesium.Color(0, 0.2, 0.2, 0.7),
    backgroundPadding: new Cesium.Cartesian2(10, 5),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 5000),
  duration: 2,
})

viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 3000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-45),
    roll: 0,
  },
})

console.log('地下模式示例已加载')
console.log('translucency.frontFaceAlpha:', viewer.scene.globe.translucency.frontFaceAlpha)
console.log('地下颜色:', undergroundColor)
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['globe.translucency 地球透明度', 'globe.undergroundColor 地下填充色', 'cameraUnderground 地下相机支持', '地下管线模型加载'],
    points: ['translucency.enabled=true 开启透明模式', 'frontFaceAlpha 控制正面透明度', '地下模式需关闭 depthTestAgainstTerrain'],
  },
}
