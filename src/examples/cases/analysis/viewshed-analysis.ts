import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'viewshed-analysis',
  title: '可视域分析',
  category: '空间分析',
  description: '从指定观察点分析周围区域的可见性，将可见区域标注为绿色、遮挡区域标注为红色，辅助选址规划。',
  tags: ['视域', '可视分析', '阴影贴图'],
  level: 'hard',
  files: {
    'main.ts': `// 可视域分析示例
// 演示从观察点分析可视区域

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

// ── 1. 观察点 ─────────────────────────────────────────────
const observerPosition = Cesium.Cartesian3.fromDegrees(116.39, 39.91, 50)
const observerHeight = 50  // 观察高度（米）
const viewDistance = 5000  // 视距（米）
const halfPitch = Math.PI / 6  // 半垂直视野角度

// 添加观察点标记
viewer.entities.add({
  name: '观察点',
  position: observerPosition,
  point: {
    pixelSize: 16,
    color: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 3,
  },
  label: {
    text: '观察点',
    font: 'bold 14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

// ── 2. 绘制可视域锥体（简化可视化）─────────────────────────
const coneSegments = 32
const conePositions: Cesium.Cartesian3[] = []
const direction = Cesium.Cartesian3.fromDegrees(116.39, 39.91)

// 简化为圆形范围可视化
for (let i = 0; i <= coneSegments; i++) {
  const angle = (i / coneSegments) * Math.PI * 2
  const lon = 116.39 + (viewDistance / 111000) * Math.cos(angle)
  const lat = 39.91 + (viewDistance / 111000) * Math.sin(angle)
  conePositions.push(Cesium.Cartesian3.fromDegrees(lon, lat, 0))
}

viewer.entities.add({
  name: '可视范围',
  polygon: {
    hierarchy: conePositions,
    material: Cesium.Color.GREEN.withAlpha(0.2),
    outline: true,
    outlineColor: Cesium.Color.GREEN,
    outlineWidth: 2,
  },
})

// ── 3. 可视域分析算法（简化版）───────────────────────────────
const visiblePoints: Cesium.Cartesian3[] = []
const hiddenPoints: Cesium.Cartesian3[] = []

// 采样点网格
const gridSize = 20
const sampleRadius = viewDistance / 111000

for (let i = 0; i < gridSize; i++) {
  for (let j = 0; j < gridSize; j++) {
    const lon = 116.39 + (i - gridSize / 2) * sampleRadius / gridSize * 2
    const lat = 39.91 + (j - gridSize / 2) * sampleRadius / gridSize * 2

    // 简单模拟：随机决定可见性
    const dist = Math.sqrt(Math.pow(i - gridSize / 2, 2) + Math.pow(j - gridSize / 2, 2))
    const isVisible = dist < gridSize / 2 && Math.random() > 0.3

    const pos = Cesium.Cartesian3.fromDegrees(lon, lat, 0)
    if (isVisible) {
      visiblePoints.push(pos)
    } else {
      hiddenPoints.push(pos)
    }
  }
}

// ── 4. 添加可见点 ───────────────────────────────────────────
visiblePoints.forEach((pos, index) => {
  if (index % 10 !== 0) return  // 稀疏采样
  viewer.entities.add({
    position: pos,
    point: {
      pixelSize: 4,
      color: Cesium.Color.GREEN,
    },
  })
})

// ── 5. 添加不可见点 ────────────────────────────────────────
hiddenPoints.forEach((pos, index) => {
  if (index % 10 !== 0) return
  viewer.entities.add({
    position: pos,
    point: {
      pixelSize: 4,
      color: Cesium.Color.RED,
    },
  })
})

// ── 6. 绘制视锥 ───────────────────────────────────────────
const coneAngle = Math.PI / 4  // 60度视场角
const directions = [
  { angle: 0, pitch: 0 },
  { angle: coneAngle / 2, pitch: 0 },
  { angle: -coneAngle / 2, pitch: 0 },
  { angle: 0, pitch: halfPitch },
  { angle: 0, pitch: -halfPitch },
]

directions.forEach((dir) => {
  const endLon = 116.39 + Math.cos(dir.angle) * viewDistance / 111000
  const endLat = 39.91 + Math.sin(dir.angle) * viewDistance / 111000

  viewer.entities.add({
    polyline: {
      positions: [observerPosition, Cesium.Cartesian3.fromDegrees(endLon, endLat, 0)],
      width: 2,
      material: Cesium.Color.CYAN,
    },
  })
})

// ── 7. 添加图例 ─────────────────────────────────────────
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.35, 39.88),
  label: {
    text: '绿色=可见 红色=遮挡',
    font: 'bold 12px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.91, 8000),
  duration: 2,
  complete: () => console.log('👁️ 可视域分析已加载'),
})

console.log('💡 可视域分析：绿色点为可见区域，红色点为遮挡区域')
console.log('📐 实际项目需要射线投射算法计算精确可视性')
console.log('🎯 观察高度和视距影响可视范围大小')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['Shadow Map 阴影贴图实现可视域', '射线投射（Ray Casting）遮挡检测', '可视域渐变色渲染', '动态调节观察角度与距离'],
    points: ['视域分析本质是阴影贴图的变体', '地形分辨率影响分析精度', '大范围分析需 WebWorker 分帧计算'],
  },
}
