import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'terrain-basic',
  title: '地形加载与夸张',
  category: '地形分析',
  description: '加载全球高精度地形，启用地形深度检测，通过 terrainExaggeration 放大地形起伏，突出山地视觉效果。',
  tags: ['地形', '高程', 'DEM'],
  level: 'easy',
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

async function loadTerrain() {
  let terrainProvider: Cesium.TerrainProvider
  let sampledHeightText = 'N/A'
  let labelHeight = 0

  try {
    terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(
      'https://www.arcgis.com/sharing/rest/apps/1/aitfs/terrain-provider',
      { requestVertexNormals: true }
    )
    viewer.terrainProvider = terrainProvider
  } catch {
    terrainProvider = new Cesium.EllipsoidTerrainProvider()
    viewer.terrainProvider = terrainProvider
    console.log('⚠️  地形服务加载失败，使用默认地形')
  }

  try {
    viewer.scene.globe.depthTestAgainstTerrain = true
    viewer.scene.globe.terrainExaggeration = 2.0
    viewer.scene.globe.terrainExaggerationRelativeHeight = 0

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 50000),
      duration: 2,
    })

    const positions = [
      Cesium.Cartesian3.fromDegrees(116.39, 39.9),
      Cesium.Cartesian3.fromDegrees(116.5, 40.0),
    ]

    if (terrainProvider.availability) {
      const heights = await Cesium.sampleTerrainMostDetailed(
        terrainProvider,
        positions
      )

      sampledHeightText = heights[0].height?.toFixed(2) ?? 'N/A'
      labelHeight = heights[0].height ?? 0

      console.log('采样点高程:', heights.map(h => h.height?.toFixed(2) + 'm'))
    } else {
      console.log('⚠️  当前地形不支持 sampleTerrainMostDetailed，跳过高程采样')
    }

    console.log('地形加载完成')

    const label = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(116.39, 39.9, labelHeight + 50),
      label: {
        text: new Cesium.ConstantProperty(
          \`高程: \${sampledHeightText}m\`
        ),
        font: 'bold 16px sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -20),
      },
    })

    console.log('terrainExaggeration:', viewer.scene.globe.terrainExaggeration)
  } catch (error) {
    console.error('地形加载失败:', error)
  }
}

loadTerrain()
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['CesiumTerrainProvider.fromUrl 加载地形', 'terrainExaggeration 地形夸张系数', 'depthTestAgainstTerrain 地形遮挡', 'sampleTerrainMostDetailed 高程采样'],
    points: ['地形数据按 LOD 流式加载', 'terrainExaggeration 推荐 1.5-3 倍', '高程采样是异步操作（返回 Promise）'],
  },
}
