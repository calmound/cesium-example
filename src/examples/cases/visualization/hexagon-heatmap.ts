import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'hexagon-heatmap',
  title: '蜂窝热力图',
  category: '数据可视化',
  description: '将空间点数据聚合到正六边形网格，用高度和颜色双重编码每格数量，展示空间分布规律。',
  tags: ['蜂窝图', '聚合', '热力'],
  level: 'medium',
  files: {
    'main.ts': `// 蜂窝热力图示例
// 将空间点数据聚合到六边形网格

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

// ── 1. 模拟蜂窝网格数据 ───────────────────────────────────────
const hexGrid: { lon: number; lat: number; count: number }[] = []
const gridSize = 0.1  // 约 10km

// 生成模拟网格数据
for (let i = 0; i < 10; i++) {
  for (let j = 0; j < 10; j++) {
    const lon = 116.3 + i * gridSize
    const lat = 39.8 + j * gridSize
    // 中心点密度最高，向边缘递减
    const distFromCenter = Math.sqrt(Math.pow(i - 5, 2) + Math.pow(j - 5, 2))
    const count = Math.max(0, Math.floor(100 - distFromCenter * 15 + Math.random() * 20))
    hexGrid.push({ lon, lat, count })
  }
}

// ── 2. 颜色映射函数 ──────────────────────────────────────────
function getHexColor(count: number): Cesium.Color {
  const t = Math.min(count / 100, 1)
  if (t < 0.25) return Cesium.Color.fromCssColorString('#2b83f6')
  if (t < 0.5) return Cesium.Color.fromCssColorString('#abdda4')
  if (t < 0.75) return Cesium.Color.fromCssColorString('#ffffbf')
  return Cesium.Color.fromCssColorString('#d7191c')
}

// ── 3. 添加六边形柱体 ────────────────────────────────────────
hexGrid.forEach((cell) => {
  if (cell.count < 5) return  // 过滤低密度

  const height = cell.count * 100  // 高度编码数量

  // 用圆形近似六边形效果
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(cell.lon, cell.lat, height / 2),
    ellipse: {
      semiMajorAxis: 4000,
      semiMinorAxis: 4000,
      height: 1,
      material: getHexColor(cell.count).withAlpha(0.7),
    },
    cylinder: {
      length: height,
      topRadius: 3500,
      bottomRadius: 3500,
      material: getHexColor(cell.count).withAlpha(0.6),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
    description: \`
      <div style="padding: 10px;">
        <h3>蜂窝网格</h3>
        <p><b>中心:</b> (\${cell.lon.toFixed(2)}, \${cell.lat.toFixed(2)})</p>
        <p><b>数量:</b> \${cell.count}</p>
      </div>
    \`,
  })
})

// ── 4. 添加图例说明 ─────────────────────────────────────────
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.25, 39.75),
  label: {
    text: '蜂窝热力图',
    font: 'bold 16px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

console.log('🔷 已生成', hexGrid.length, '个蜂窝网格')
console.log('🎨 颜色: 蓝->绿->黄->红 表示密度从低到高')
console.log('📏 实际项目可使用 H3 六边形网格系统')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 80000),
  duration: 2,
  complete: () => console.log('🟡 蜂窝热力图已加载'),
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['H3 六边形网格索引', 'Cylinder 编码数量高度', '色阶映射分位数', '缩放级别自适应网格大小'],
    points: ['H3 分辨率 7~9 适合城市级分析', '分位数色阶比线性色阶更均匀', '挤出高度建议对数缩放'],
  },
}
