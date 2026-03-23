import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'contour-line',
  title: '等高线',
  category: '地形分析',
  description: '在地形表面叠加等高线渲染效果，通过 Material 着色器按高程值绘制等高线，支持自定义间距与颜色。',
  tags: ['等高线', '地形材质', 'Material'],
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

async function initTerrain() {
  const terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
    'https://www.cesium.com/ion/stk/terrain/world',
    { requestVertexNormals: true }
  )
  viewer.terrainProvider = terrainProvider

  viewer.scene.globe.material = new Cesium.Material({
    fabric: {
      type: 'ElevationContour',
      uniforms: {
        spacing: 100.0,
        width: 2.0,
        level: 1,
        color: Cesium.Color.YELLOW,
        glowWidth: 10.0,
        glowColor: Cesium.Color.ORANGE,
      },
    },
  })

  viewer.scene.globe.material = new Cesium.ElevationContourMaterial({
    spacing: 100,
    width: 2.0,
    color: Cesium.Color.YELLOW,
    glowColor: Cesium.Color.ORANGE,
    glowWidth: 0.5,
  })
}

initTerrain()

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 80000),
  duration: 2,
})

const contourLabel = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 500),
  label: {
    text: '等高线间距: 100m',
    font: 'bold 16px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -20),
    backgroundColor: new Cesium.Color(0, 0, 0, 0.5),
    backgroundPadding: new Cesium.Cartesian2(8, 4),
  },
})

console.log('等高线示例已加载')
console.log('等高线间距: 100m')
console.log('等高线颜色: 黄色')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['ElevationContourMaterial 等高线材质', 'ContourLineSpacing 等高距设置', '坡度渐变色斑图叠加', '高程数值标注'],
    points: ['Cesium 内置 ElevationContourMaterial', 'spacing 单位为米', '等高线与坡度图可叠加显示'],
  },
}
