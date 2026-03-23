import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'terrain-excavation',
  title: '地形开挖',
  category: '地形分析',
  description: '在指定区域对地形进行开挖展示，暴露地下截面，支持 ClippingPlanes 方式和 Planes 方式两种实现。',
  tags: ['地形开挖', '裁剪', 'ClippingPlanes'],
  level: 'hard',
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

async function initTerrain() {
  const terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
    'https://www.cesium.com/ion/stk/terrain/world',
    { requestVertexNormals: true }
  )
  viewer.terrainProvider = terrainProvider
}

initTerrain()

const centerLon = 116.39
const centerLat = 39.9
const radius = 0.01

const clippingPlanes = new Cesium.ClippingPlaneCollection({
  planes: [
    new Cesium.ClippingPlane(
      new Cesium.Cartesian3(1.0, 0.0, 0.0),
      Cesium.Math.toRadians(-30)
    ),
    new Cesium.ClippingPlane(
      new Cesium.Cartesian3(-1.0, 0.0, 0.0),
      Cesium.Math.toRadians(-30)
    ),
    new Cesium.ClippingPlane(
      new Cesium.Cartesian3(0.0, 1.0, 0.0),
      Cesium.Math.toRadians(-30)
    ),
    new Cesium.ClippingPlane(
      new Cesium.Cartesian3(0.0, -1.0, 0.0),
      Cesium.Math.toRadians(-30)
    ),
  ],
  enabled: true,
  edgeWidth: 2.0,
  edgeColor: Cesium.Color.CYAN,
})

viewer.scene.globe.clippingPlanes = clippingPlanes

const excavationEntity = viewer.entities.add({
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray([
        centerLon - radius, centerLat - radius,
        centerLon + radius, centerLat - radius,
        centerLon + radius, centerLat + radius,
        centerLon - radius, centerLat + radius,
      ])
    ),
    material: new Cesium.ColorMaterialProperty(
      new Cesium.Color(0.2, 0.4, 0.6, 0.8)
    ),
    height: 0,
    extrudedHeight: -200,
    outline: true,
    outlineColor: Cesium.Color.CYAN,
  },
})

const clipLabel = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 500),
  label: {
    text: '地形开挖区域',
    font: 'bold 16px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 20000),
  duration: 2,
})

console.log('地形开挖示例已加载')
console.log('ClippingPlane 数量:', clippingPlanes.length)
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['ClippingPlaneCollection 地形裁剪', 'Planes 方式多面体开挖', '开挖截面纹理贴图', '与建筑模型联合裁剪'],
    points: ['Globe 和 tileset 分别设置裁剪面', 'softness 参数控制裁剪边缘羽化', '裁剪平面需在地球固连坐标系下定义'],
  },
}
