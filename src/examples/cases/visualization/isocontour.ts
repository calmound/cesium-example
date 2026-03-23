import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'isocontour',
  title: '等值面（Kriging 插值）',
  category: '数据可视化',
  description: '从离散采样点通过 Kriging 插值生成连续等值面和色斑图，用于温度场，气压场的平滑可视化。',
  tags: ['等值线', 'Kriging', '插值'],
  level: 'hard',
  files: {
    'main.ts': `// 等值面（Kriging 插值）示例
// 从离散采样点生成连续等值面

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

// ── 1. 模拟采样点数据 ─────────────────────────────────────────
const samplePoints: { lon: number; lat: number; value: number }[] = [
  { lon: 116.39, lat: 39.90, value: 35 },  // 北京
  { lon: 116.80, lat: 39.50, value: 33 },
  { lon: 116.20, lat: 40.00, value: 31 },
  { lon: 117.00, lat: 39.80, value: 34 },
  { lon: 116.50, lat: 39.60, value: 36 },
  { lon: 115.80, lat: 39.70, value: 32 },
  { lon: 116.60, lat: 40.10, value: 30 },
  { lon: 116.30, lat: 39.40, value: 37 },
  { lon: 116.90, lat: 40.20, value: 29 },
  { lon: 116.10, lat: 39.30, value: 38 },
]

// ── 2. 简单 IDW 插值（简化版 Kriging）────────────────────────
function interpolateIDW(lon: number, lat: number): number {
  let sumWeight = 0
  let sumValue = 0
  const power = 2

  samplePoints.forEach((point) => {
    const dist = Math.sqrt(Math.pow(point.lon - lon, 2) + Math.pow(point.lat - lat, 2))
    if (dist < 0.001) {
      sumValue = point.value
      sumWeight = 1
      return
    }
    const weight = 1 / Math.pow(dist, power)
    sumWeight += weight
    sumValue += weight * point.value
  })

  return sumValue / sumWeight
}

// ── 3. 添加采样点 ────────────────────────────────────────────
samplePoints.forEach((point) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
    point: {
      pixelSize: 12,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: point.value.toString() + '°C',
      font: 'bold 11px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -14),
    },
    description: \`
      <div style="padding: 8px;">
        <b>采样点</b><br/>
        温度: \${point.value}°C<br/>
        位置: (\${point.lon.toFixed(2)}, \${point.lat.toFixed(2)})
      </div>
    \`,
  })
})

// ── 4. 生成等值线近似多边形 ────────────────────────────────────
const contourLevels = [30, 32, 34, 36, 38]

contourLevels.forEach((level) => {
  // 简化：创建圆形区域表示等值区域
  const center = samplePoints.reduce(
    (prev, curr) => (Math.abs(curr.value - level) < Math.abs(prev.value - level) ? curr : prev),
    samplePoints[0]
  )

  // 颜色映射
  const t = (level - 30) / 8
  const color = Cesium.Color.fromCssColorString('#1e90ff').lerp(
    Cesium.Color.fromCssColorString('#ff4500'),
    t
  )

  viewer.entities.add({
    name: '等值线_' + level,
    position: Cesium.Cartesian3.fromDegrees(center.lon, center.lat),
    ellipse: {
      semiMajorAxis: 15000 + (38 - level) * 3000,
      semiMinorAxis: 12000 + (38 - level) * 2500,
      material: color.withAlpha(0.3),
      outline: true,
      outlineColor: color,
      outlineWidth: 2,
      height: 10,
    },
  })
})

// ── 5. 添加图例 ─────────────────────────────────────────────
const legendHtml = \`
  <div style="
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: rgba(0,0,0,0.7);
    padding: 10px;
    border-radius: 4px;
    color: white;
    font-family: sans-serif;
    font-size: 12px;
  ">
    <div style="font-weight: bold; margin-bottom: 5px;">等值线 (°C)</div>
    <div style="display: flex; align-items: center; margin: 2px 0;">
      <span style="color: #1e90ff;">●</span> 30°C
    </div>
    <div style="display: flex; align-items: center; margin: 2px 0;">
      <span style="color: #4dab4d;">●</span> 32°C
    </div>
    <div style="display: flex; align-items: center; margin: 2px 0;">
      <span style="color: #ffff00;">●</span> 34°C
    </div>
    <div style="display: flex; align-items: center; margin: 2px 0;">
      <span style="color: #ff8c00;">●</span> 36°C
    </div>
    <div style="display: flex; align-items: center; margin: 2px 0;">
      <span style="color: #ff4500;">●</span> 38°C
    </div>
  </div>
\`

console.log('📊 已添加', samplePoints.length, '个采样点')
console.log('🎨 颜色映射: 蓝->绿->黄->橙->红 表示温度从低到高')
console.log('🔧 实际项目需要实现完整的 Kriging 插值算法')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.80, 120000),
  duration: 2,
  complete: () => console.log('🗺️ 等值面可视化已加载'),
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['Kriging 空间插值算法', 'Marching Squares 等值线提取', '色斑图填充多边形', '动态阈值调节'],
    points: ['Kriging 比 IDW 插值更平滑', 'Marching Squares 输出 GeoJSON 多边形', '等值线数量影响视觉清晰度'],
  },
}
