import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'volume-calculation',
  title: '方量计算',
  category: '空间分析',
  description: '基于设计高程与现状地形计算挖填方量，生成挖填方分布图，常用于土方工程量估算。',
  tags: ['方量', '土方', '挖填'],
  level: 'hard',
  files: {
    'main.ts': `// 方量计算示例
// 演示土方挖填计算的基本原理

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

// ── 1. 设计参数 ─────────────────────────────────────────
const designElevation = 50 // 设计高程（米）
const gridSize = 20 // 采样网格大小
const cellArea = 100 // 每格面积（平方米）

// ── 2. 模拟高程数据 ─────────────────────────────────────
// 实际项目中从地形数据采样
const terrainGrid: number[][] = []
for (let i = 0; i < gridSize; i++) {
  const row: number[] = []
  for (let j = 0; j < gridSize; j++) {
    // 模拟丘陵地形：中心高，四周低
    const centerDist = Math.sqrt(Math.pow(i - gridSize/2, 2) + Math.pow(j - gridSize/2, 2))
    const elevation = 30 + 40 * Math.exp(-centerDist * 0.1) + (Math.random() - 0.5) * 10
    row.push(elevation)
  }
  terrainGrid.push(row)
}

// ── 3. 计算挖填方量 ─────────────────────────────────────
let totalCut = 0 // 挖方
let totalFill = 0 // 填方

const cutVolumes: { lon: number; lat: number; vol: number }[] = []
const fillVolumes: { lon: number; lat: number; vol: number }[] = []

const originLon = 116.38
const originLat = 39.88
const cellSizeLon = 0.001
const cellSizeLat = 0.001

for (let i = 0; i < gridSize; i++) {
  for (let j = 0; j < gridSize; j++) {
    const currentElevation = terrainGrid[i][j]
    const heightDiff = designElevation - currentElevation

    const centerLon = originLon + i * cellSizeLon
    const centerLat = originLat + j * cellSizeLat

    if (heightDiff > 0) {
      // 填方（设计高程高于现状）
      const vol = heightDiff * cellArea
      totalFill += vol
      fillVolumes.push({ lon: centerLon, lat: centerLat, vol })
    } else {
      // 挖方（现状高于设计高程）
      const vol = Math.abs(heightDiff) * cellArea
      totalCut += vol
      cutVolumes.push({ lon: centerLon, lat: centerLat, vol })
    }
  }
}

// ── 4. 可视化挖填区域 ───────────────────────────────────
const maxVol = Math.max(
  ...cutVolumes.map(v => v.vol),
  ...fillVolumes.map(v => v.vol)
)

cutVolumes.forEach((cell, index) => {
  if (index % 3 !== 0) return // 稀疏采样

  const intensity = cell.vol / maxVol
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(cell.lon, cell.lat, cell.vol / 2),
    box: {
      dimensions: new Cesium.Cartesian3(
        cellSizeLon * 111000 * 50,
        cellSizeLat * 111000 * 50,
        cell.vol / cellArea * 2
      ),
      material: Cesium.Color.RED.withAlpha(0.7),
      outline: true,
      outlineColor: Cesium.Color.DARKRED,
    },
  })
})

fillVolumes.forEach((cell, index) => {
  if (index % 3 !== 0) return

  const intensity = cell.vol / maxVol
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(cell.lon, cell.lat, cell.vol / 2),
    box: {
      dimensions: new Cesium.Cartesian3(
        cellSizeLon * 111000 * 50,
        cellSizeLat * 111000 * 50,
        cell.vol / cellArea * 2
      ),
      material: Cesium.Color.GREEN.withAlpha(0.7),
      outline: true,
      outlineColor: Cesium.Color.DARKGREEN,
    },
  })
})

// ── 5. 添加设计高程平面 ──────────────────────────────────
const planePositions = [
  Cesium.Cartesian3.fromDegrees(originLon, originLat, designElevation),
  Cesium.Cartesian3.fromDegrees(originLon + gridSize * cellSizeLon, originLat, designElevation),
  Cesium.Cartesian3.fromDegrees(originLon + gridSize * cellSizeLon, originLat + gridSize * cellSizeLat, designElevation),
  Cesium.Cartesian3.fromDegrees(originLon, originLat + gridSize * cellSizeLat, designElevation),
]

viewer.entities.add({
  name: '设计高程面',
  polygon: {
    hierarchy: planePositions,
    material: Cesium.Color.BLUE.withAlpha(0.2),
    outline: true,
    outlineColor: Cesium.Color.BLUE,
    outlineWidth: 3,
  },
})

// ── 6. 添加图例 ─────────────────────────────────────────
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(originLon + gridSize * cellSizeLon * 0.8, originLat + gridSize * cellSizeLat * 0.2),
  label: {
    text: '设计高程: ' + designElevation + 'm',
    font: 'bold 14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  },
})

// ── 7. 统计信息 ────────────────────────────────────────
console.log('📊 方量计算结果:')
console.log('🔴 挖方量:', totalCut.toFixed(0), '立方米')
console.log('🟢 填方量:', totalFill.toFixed(0), '立方米')
console.log('⚖️  净方量:', (totalFill - totalCut).toFixed(0), '立方米')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(
    originLon + gridSize * cellSizeLon / 2,
    originLat + gridSize * cellSizeLat / 2,
    300
  ),
  duration: 2,
  complete: () => console.log('📐 方量计算已加载'),
})

console.log('💡 挖方: 现状高于设计高程（需开挖）')
console.log('💡 填方: 设计高程高于现状（需填土）')
console.log('📦 方量 = 面积 × 平均高差')
`,
  'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['密集高程采样网格化', '设计高程与现状高程差值', '挖方/填方分区着色', '方量累积计算'],
    points: ['采样密度直接影响计算精度', '挖方（现状 > 设计）/ 填方（现状 < 设计）', '方量 = 面积 × 平均高差'],
  },
}
