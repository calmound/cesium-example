import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'slope-analysis',
  title: '坡度坡向分析',
  category: '地形分析',
  description: '基于 DEM 地形数据计算地表坡度和坡向，用分级色斑图渲染坡度分布，辅助地质灾害评估与规划选址。',
  tags: ['坡度', '坡向', 'DEM'],
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
console.log('💡 生产环境请配置 CesiumTerrainProvider')

const centerLon = 116.39
const centerLat = 39.9

function calculateSlope(point1: Cesium.Cartesian3, point2: Cesium.Cartesian3, distance: number): number {
  const heightDiff = point2.y - point1.y
  return Math.atan2(heightDiff, distance)
}

function getSlopeColor(slopeDegrees: number): Cesium.Color {
  if (slopeDegrees < 15) return Cesium.Color.GREEN
  if (slopeDegrees < 30) return Cesium.Color.YELLOW
  if (slopeDegrees < 45) return Cesium.Color.ORANGE
  return Cesium.Color.RED
}

const slopeMarkers = viewer.entities.addGroup()

async function analyzeSlope() {
  try {
    const positions = []
    const gridSize = 5
    const spacing = 0.01

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        positions.push(
          Cesium.Cartesian3.fromDegrees(
            centerLon - spacing * 2 + i * spacing,
            centerLat - spacing * 2 + j * spacing
          )
        )
      }
    }

    const terrainPositions = await Cesium.sampleTerrainMostDetailed(
      viewer.terrainProvider,
      positions
    )

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const idx = i * gridSize + j
        const pos = terrainPositions[idx]
        const nextIdx = idx + 1 < positions.length ? idx + 1 : idx
        const nextPos = terrainPositions[nextIdx]

        if (pos && pos.height && nextPos && nextPos.height) {
          const distance = Cesium.Cartesian3.distance(pos, nextPos)
          const slopeRad = calculateSlope(pos, nextPos, distance)
          const slopeDeg = Cesium.Math.toDegrees(slopeRad)
          const color = getSlopeColor(slopeDeg)

          slopeMarkers.entities.add({
            position: Cesium.Cartesian3.fromDegrees(
              centerLon - spacing * 2 + i * spacing,
              centerLat - spacing * 2 + j * spacing,
              (pos.height || 0) + 10
            ),
            box: {
              dimensions: new Cesium.Cartesian3(200, 200, 50),
              material: color.withAlpha(0.7),
              outline: true,
              outlineColor: Cesium.Color.BLACK,
            },
          })
        }
      }
    }

    console.log('坡度分析完成')
    console.log('绿色: <15°  黄色: 15-30°  橙色: 30-45°  红色: >45°')
  } catch (error) {
    console.error('坡度分析失败:', error)
  }
}

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 5000),
  duration: 2,
})

const legendLabel = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(centerLon + 0.03, centerLat + 0.03, 1000),
  label: {
    text: '坡度分级图例:\\n绿色: <15°\\n黄色: 15-30°\\n橙色: 30-45°\\n红色: >45°',
    font: '14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    backgroundColor: new Cesium.Color(0, 0, 0, 0.6),
    backgroundPadding: new Cesium.Cartesian2(10, 10),
  },
})

analyzeSlope()
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['sampleTerrainMostDetailed 密集采样', '相邻点高差计算坡度', '分级色阶映射坡度值', '坡向箭头可视化'],
    points: ['采样网格越密精度越高但耗时越长', '坡度单位为度（°）或百分比（%）', '坡向 0° 为正北，顺时针增大'],
  },
}
