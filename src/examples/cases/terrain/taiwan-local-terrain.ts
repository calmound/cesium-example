import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'taiwan-local-terrain',
  title: '地形',
  category: '地形分析',
  description: '加载 public/terrain 中的 quantized-mesh 地形数据，定位到台湾附近，演示本地地形服务、高程采样、地形遮挡和贴地标注。',
  tags: ['本地地形', '台湾', 'Quantized Mesh', 'DEM'],
  level: 'medium',
  files: {
    'main.ts': `const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false, animation: false, timeline: false,
  geocoder: false, homeButton: false, sceneModePicker: false,
  navigationHelpButton: false, fullscreenButton: false,
  baseLayer: false,
})
viewerRef.current = viewer

const terrainUrl = '/terrain'
const taiwanBounds = Cesium.Rectangle.fromDegrees(119.6, 21.6, 122.2, 25.5)
const taiwanBoundary = Cesium.Cartesian3.fromDegreesArray([
  119.6, 21.6,
  122.2, 21.6,
  122.2, 25.5,
  119.6, 25.5,
  119.6, 21.6,
])
const sampleSites = [
  { name: '玉山', lon: 120.9575, lat: 23.4700 },
  { name: '雪山', lon: 121.2310, lat: 24.3830 },
  { name: '阿里山', lon: 120.8050, lat: 23.5080 },
  { name: '台北盆地', lon: 121.5654, lat: 25.0330 },
]

viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(120.95, 23.75, 320000),
  orientation: {
    heading: Cesium.Math.toRadians(4),
    pitch: Cesium.Math.toRadians(-48),
    roll: 0,
  },
})

async function loadBaseMap() {
  const fallbackProvider = await Cesium.TileMapServiceImageryProvider.fromUrl(
    Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
  )
  const fallbackLayer = viewer.imageryLayers.addImageryProvider(fallbackProvider)
  fallbackLayer.brightness = 1.25
  fallbackLayer.contrast = 1.05
  fallbackLayer.saturation = 1.1

  const imageryProvider = new Cesium.UrlTemplateImageryProvider({
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    credit: 'Esri World Imagery',
    maximumLevel: 19,
  })
  const imageryLayer = viewer.imageryLayers.addImageryProvider(imageryProvider)
  imageryLayer.brightness = 1.08
  imageryLayer.contrast = 1.08
  imageryLayer.saturation = 1.05
  console.log('高清影像底图: Esri World Imagery')
}

async function loadLocalTerrain() {
  try {
    const terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(terrainUrl, {
      requestVertexNormals: true,
      requestMetadata: true,
    })

    viewer.terrainProvider = terrainProvider
    viewer.scene.globe.depthTestAgainstTerrain = true
    viewer.scene.globe.enableLighting = false
    viewer.scene.globe.terrainExaggeration = 1.6
    viewer.scene.globe.terrainExaggerationRelativeHeight = 0

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(120.95, 23.75, 260000),
      orientation: {
        heading: Cesium.Math.toRadians(4),
        pitch: Cesium.Math.toRadians(-48),
        roll: 0,
      },
      duration: 1.8,
    })

    viewer.entities.add({
      name: '地形覆盖范围',
      rectangle: {
        coordinates: taiwanBounds,
        material: Cesium.Color.CYAN.withAlpha(0.025),
        height: 0,
      },
    })

    viewer.entities.add({
      name: '地形覆盖边界',
      polyline: {
        positions: taiwanBoundary,
        width: 2,
        clampToGround: true,
        material: Cesium.Color.CYAN.withAlpha(0.9),
      },
    })

    const cartographics = sampleSites.map((site) =>
      Cesium.Cartographic.fromDegrees(site.lon, site.lat)
    )
    const sampled = await Cesium.sampleTerrainMostDetailed(terrainProvider, cartographics)

    sampled.forEach((position, index) => {
      const site = sampleSites[index]
      const height = position.height ?? 0
      const labelText = \`\${site.name}\\n\${height.toFixed(0)} m\`

      viewer.entities.add({
        name: site.name,
        position: Cesium.Cartesian3.fromRadians(
          position.longitude,
          position.latitude,
          height + 120
        ),
        point: {
          pixelSize: 10,
          color: Cesium.Color.ORANGE,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
          text: labelText,
          font: 'bold 14px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(0, -16),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      })

      console.log(\`\${site.name}: \${height.toFixed(2)} m\`)
    })

    const wallPositions = sampled.map((position) =>
      Cesium.Cartesian3.fromRadians(position.longitude, position.latitude, position.height ?? 0)
    )
    wallPositions.push(wallPositions[0])

    viewer.entities.add({
      name: '采样点连线',
      polyline: {
        positions: wallPositions,
        width: 3,
        clampToGround: true,
        material: Cesium.Color.YELLOW.withAlpha(0.85),
      },
    })

    console.log('本地台湾地形加载完成:', terrainUrl)
    console.log('layer.json maxzoom=9, scheme=tms, projection=EPSG:4326')
  } catch (error) {
    console.error('本地地形加载失败:', error)
    console.log('请确认 public/terrain/layer.json 和 .terrain 切片可通过 /terrain 访问')
  }
}

loadBaseMap().catch((error) => {
  console.error('本地底图加载失败:', error)
})
loadLocalTerrain()
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['CesiumTerrainProvider.fromUrl 加载本地 quantized-mesh', 'requestVertexNormals 使用地形法线增强光照', 'sampleTerrainMostDetailed 读取台湾高程', 'depthTestAgainstTerrain 验证地形遮挡'],
    points: ['public/terrain 会被 Vite 作为静态资源暴露到 /terrain', 'layer.json 中 scheme=tms、projection=EPSG:4326，Cesium 会按元数据请求切片', '本案例不依赖 Cesium ion token，适合离线地形数据演示'],
  },
}
