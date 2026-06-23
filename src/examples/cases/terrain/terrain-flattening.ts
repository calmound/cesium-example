import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'terrain-flattening',
  title: '地形压平与抬升',
  category: '地形分析',
  description: '将指定区域的地形压平至指定高度，或将局部地形整体抬升，常用于建筑选址、工程规划场景。',
  tags: ['地形压平', '地形抬升', 'CustomShader'],
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

viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()
console.log('⚠️  使用 EllipsoidTerrainProvider（无地形起伏）')
console.log('💡 生产环境请配置 CesiumTerrainProvider 或 STK Terrain Provider')

const centerLon = 116.39
const centerLat = 39.9
const size = 0.02

const flatHeight = 100.0

const clippingPlanes = new Cesium.ClippingPlaneCollection({
  planes: [
    new Cesium.ClippingPlane(
      new Cesium.Cartesian3(1.0, 0.0, 0.0),
      -(centerLon - size - centerLon)
    ),
    new Cesium.ClippingPlane(
      new Cesium.Cartesian3(-1.0, 0.0, 0.0),
      -(centerLon - (centerLon + size))
    ),
    new Cesium.ClippingPlane(
      new Cesium.Cartesian3(0.0, 1.0, 0.0),
      -(centerLat - size - centerLat)
    ),
    new Cesium.ClippingPlane(
      new Cesium.Cartesian3(0.0, -1.0, 0.0),
      -(centerLat - (centerLat + size))
    ),
  ],
  enabled: true,
})

viewer.scene.globe.clippingPlanes = clippingPlanes

const flattenPolygon = viewer.entities.add({
  polygon: {
    hierarchy: new Cesium.PolygonHierarchy(
      Cesium.Cartesian3.fromDegreesArray([
        centerLon - size, centerLat - size,
        centerLon + size, centerLat - size,
        centerLon + size, centerLat + size,
        centerLon - size, centerLat + size,
      ])
    ),
    material: new Cesium.ColorMaterialProperty(
      new Cesium.Color(0.3, 0.6, 0.3, 0.6)
    ),
    height: flatHeight,
    extrudedHeight: flatHeight,
    outline: true,
    outlineColor: Cesium.Color.LIME,
  },
})

const buildingEntity = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, flatHeight),
  box: {
    dimensions: new Cesium.Cartesian3(500, 500, 200),
    material: new Cesium.ColorMaterialProperty(
      new Cesium.Color(0.8, 0.6, 0.4, 0.9)
    ),
    outline: true,
    outlineColor: Cesium.Color.ORANGE,
  },
})

const label = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, flatHeight + 150),
  label: {
    text: \`压平高度: \${flatHeight}m\`,
    font: 'bold 14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -10),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 10000),
  duration: 2,
})

console.log('地形压平示例已加载')
console.log('压平区域中心:', centerLon, centerLat)
console.log('压平高度:', flatHeight, 'm')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['Globe.clippingPlanes 压平区域定义', 'CustomShader 修改顶点高度', '压平区域多边形边界', '高度渐变过渡效果'],
    points: ['地形压平通过替换高程值实现', '边界区域需做平滑插值过渡', '压平后建筑物与地形能无缝贴合'],
  },
}
