import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'isocontour',
  title: '等值面（Kriging 插值）',
  category: '数据可视化',
  description: '以监测站采样点为输入，构建平滑插值栅格，叠加色斑面与等值线，展示温度场这类连续空间变量的分布。',
  tags: ['等值线', 'Kriging', '插值', 'Marching Squares'],
  level: 'hard',
  files: {
    'main.ts': `// 等值面（Kriging 插值）示例
// 采样点 -> 栅格插值 -> 色斑面 -> 等值线

const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false,
  animation: false,
  timeline: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,
  baseLayer: new Cesium.ImageryLayer(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: 'OpenStreetMap contributors',
    })
  ),
})
viewerRef.current = viewer

viewer.scene.globe.depthTestAgainstTerrain = true

type SamplePoint = { name: string; lon: number; lat: number; value: number }
type GridField = { cols: number; rows: number; values: number[][]; min: number; max: number }

// ── 1. 模拟监测站数据 ────────────────────────────────────────
const samplePoints: SamplePoint[] = [
  { name: '海淀北', lon: 116.230, lat: 40.035, value: 25.2 },
  { name: '上地', lon: 116.305, lat: 40.042, value: 26.7 },
  { name: '中关村', lon: 116.316, lat: 39.983, value: 28.9 },
  { name: '学院路', lon: 116.360, lat: 39.995, value: 29.8 },
  { name: '望京', lon: 116.485, lat: 40.000, value: 31.1 },
  { name: '朝阳公园', lon: 116.478, lat: 39.943, value: 30.4 },
  { name: '国贸', lon: 116.468, lat: 39.913, value: 31.6 },
  { name: '金融街', lon: 116.356, lat: 39.915, value: 30.7 },
  { name: '西直门', lon: 116.349, lat: 39.946, value: 29.7 },
  { name: '丰台科技园', lon: 116.286, lat: 39.829, value: 32.4 },
  { name: '大红门', lon: 116.418, lat: 39.845, value: 33.1 },
  { name: '亦庄', lon: 116.520, lat: 39.802, value: 34.6 },
  { name: '通州北关', lon: 116.660, lat: 39.920, value: 32.8 },
  { name: '顺义南法信', lon: 116.639, lat: 40.128, value: 29.4 },
]

const lons = samplePoints.map((point) => point.lon)
const lats = samplePoints.map((point) => point.lat)
const west = Math.min(...lons) - 0.045
const east = Math.max(...lons) + 0.045
const south = Math.min(...lats) - 0.035
const north = Math.max(...lats) + 0.035
const rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north)

// ── 2. 平滑插值栅格（高斯核 + 距离衰减，模拟 Kriging 结果）────────────
const gridCols = 96
const gridRows = 72
const bandwidth = 0.09
const trendStrength = 0.18

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function interpolateField(lon: number, lat: number) {
  let weightedValue = 0
  let weightedSum = 0

  samplePoints.forEach((point) => {
    const dx = lon - point.lon
    const dy = lat - point.lat
    const distance2 = dx * dx + dy * dy
    const gaussianWeight = Math.exp(-distance2 / (bandwidth * bandwidth))
    const distanceWeight = 1 / (Math.sqrt(distance2) + 0.015)
    const weight = gaussianWeight * distanceWeight
    weightedValue += point.value * weight
    weightedSum += weight
  })

  const base = weightedValue / weightedSum
  const lonTrend = (lon - west) / (east - west) - 0.5
  const latTrend = (lat - south) / (north - south) - 0.5

  // 给场加入轻微趋势，让等值面更像真实城市热岛分布
  return base + lonTrend * 1.4 * trendStrength - latTrend * 1.8 * trendStrength
}

function buildField(): GridField {
  const values: number[][] = []
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  for (let row = 0; row < gridRows; row++) {
    const lat = south + (row / (gridRows - 1)) * (north - south)
    const rowValues: number[] = []

    for (let col = 0; col < gridCols; col++) {
      const lon = west + (col / (gridCols - 1)) * (east - west)
      const value = interpolateField(lon, lat)
      rowValues.push(value)
      min = Math.min(min, value)
      max = Math.max(max, value)
    }

    values.push(rowValues)
  }

  return { cols: gridCols, rows: gridRows, values, min, max }
}

const field = buildField()
const contourSphere = Cesium.BoundingSphere.fromRectangle3D(rectangle)

function normalize(value: number) {
  return clamp((value - field.min) / (field.max - field.min), 0, 1)
}

const colorStops = [
  { t: 0.0, color: [33, 102, 172] },
  { t: 0.25, color: [103, 169, 207] },
  { t: 0.5, color: [247, 247, 191] },
  { t: 0.75, color: [253, 174, 97] },
  { t: 1.0, color: [215, 25, 28] },
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function getColor(value: number) {
  const t = normalize(value)

  for (let i = 0; i < colorStops.length - 1; i++) {
    const current = colorStops[i]
    const next = colorStops[i + 1]
    if (t >= current.t && t <= next.t) {
      const localT = (t - current.t) / (next.t - current.t)
      return [
        Math.round(lerp(current.color[0], next.color[0], localT)),
        Math.round(lerp(current.color[1], next.color[1], localT)),
        Math.round(lerp(current.color[2], next.color[2], localT)),
      ]
    }
  }

  return colorStops[colorStops.length - 1].color
}

// ── 3. 绘制色斑图并贴回地图 ─────────────────────────────────
function createHeatCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = field.cols
  canvas.height = field.rows
  const context = canvas.getContext('2d')!
  const imageData = context.createImageData(field.cols, field.rows)

  for (let row = 0; row < field.rows; row++) {
    for (let col = 0; col < field.cols; col++) {
      const value = field.values[row][col]
      const color = getColor(value)
      const flippedRow = field.rows - 1 - row
      const index = (flippedRow * field.cols + col) * 4
      imageData.data[index] = color[0]
      imageData.data[index + 1] = color[1]
      imageData.data[index + 2] = color[2]
      imageData.data[index + 3] = 155
    }
  }

  context.putImageData(imageData, 0, 0)
  return canvas
}

const heatCanvas = createHeatCanvas()
viewer.imageryLayers.addImageryProvider(
  new Cesium.SingleTileImageryProvider({
    url: heatCanvas.toDataURL('image/png'),
    rectangle,
    tileWidth: field.cols,
    tileHeight: field.rows,
  })
)

// ── 4. Marching Squares 提取等值线 ───────────────────────────
const contourLevels = [26, 28, 30, 32, 34]

function gridToLon(col: number) {
  return west + (col / (field.cols - 1)) * (east - west)
}

function gridToLat(row: number) {
  return south + (row / (field.rows - 1)) * (north - south)
}

function segmentInterpolate(x1: number, y1: number, v1: number, x2: number, y2: number, v2: number, level: number) {
  const t = v1 === v2 ? 0.5 : (level - v1) / (v2 - v1)
  return [lerp(x1, x2, t), lerp(y1, y2, t)]
}

function buildContourSegments(level: number) {
  const segments: number[][] = []

  for (let row = 0; row < field.rows - 1; row++) {
    for (let col = 0; col < field.cols - 1; col++) {
      const bl = field.values[row][col]
      const br = field.values[row][col + 1]
      const tr = field.values[row + 1][col + 1]
      const tl = field.values[row + 1][col]

      const x0 = gridToLon(col)
      const x1 = gridToLon(col + 1)
      const y0 = gridToLat(row)
      const y1 = gridToLat(row + 1)

      const intersections: number[][] = []

      if ((bl >= level) !== (br >= level)) intersections.push(segmentInterpolate(x0, y0, bl, x1, y0, br, level))
      if ((br >= level) !== (tr >= level)) intersections.push(segmentInterpolate(x1, y0, br, x1, y1, tr, level))
      if ((tr >= level) !== (tl >= level)) intersections.push(segmentInterpolate(x1, y1, tr, x0, y1, tl, level))
      if ((tl >= level) !== (bl >= level)) intersections.push(segmentInterpolate(x0, y1, tl, x0, y0, bl, level))

      if (intersections.length === 2) {
        segments.push([
          intersections[0][0], intersections[0][1],
          intersections[1][0], intersections[1][1],
        ])
      } else if (intersections.length === 4) {
        segments.push([
          intersections[0][0], intersections[0][1],
          intersections[1][0], intersections[1][1],
        ])
        segments.push([
          intersections[2][0], intersections[2][1],
          intersections[3][0], intersections[3][1],
        ])
      }
    }
  }

  return segments
}

function contourColor(level: number) {
  const color = getColor(level)
  return Cesium.Color.fromBytes(color[0], color[1], color[2], 255)
}

contourLevels.forEach((level) => {
  const segments = buildContourSegments(level)
  const color = contourColor(level)

  segments.forEach((segment, index) => {
    viewer.entities.add({
      name: '等值线_' + level + '_' + index,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray(segment),
        width: level >= 32 ? 2.4 : 1.7,
        material: color.withAlpha(0.95),
        clampToGround: true,
      },
    })
  })

  const labelCol = Math.floor(field.cols * 0.64)
  const labelRow = Math.min(field.rows - 1, Math.max(0, Math.floor(((level - field.min) / (field.max - field.min)) * field.rows * 0.55 + 12)))

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(gridToLon(labelCol), gridToLat(labelRow), 30),
    label: {
      text: level.toFixed(0) + '°C',
      font: '600 12px sans-serif',
      fillColor: color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })
})

// ── 5. 添加采样点与说明面板 ─────────────────────────────────
samplePoints.forEach((point) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat, 80),
    point: {
      pixelSize: 10,
      color: Cesium.Color.WHITE,
      outlineColor: contourColor(point.value),
      outlineWidth: 3,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text: point.name + '\\n' + point.value.toFixed(1) + '°C',
      font: '600 12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -18),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    description: \`
      <div style="padding: 10px 12px; min-width: 200px;">
        <h3 style="margin: 0 0 8px;">\${point.name} 监测站</h3>
        <p style="margin: 4px 0;"><b>温度:</b> \${point.value.toFixed(1)}°C</p>
        <p style="margin: 4px 0;"><b>经纬度:</b> \${point.lon.toFixed(3)}, \${point.lat.toFixed(3)}</p>
      </div>
    \`,
  })
})

const legend = document.createElement('div')
legend.className = 'iso-legend'
legend.innerHTML = [
  '<div class="iso-legend__title">城市温度等值面</div>',
  '<div class="iso-legend__subtitle">平滑插值色斑 + Marching Squares 等值线</div>',
  '<div class="iso-legend__ramp"></div>',
  '<div class="iso-legend__labels"><span>' + field.min.toFixed(1) + '°C</span><span>' + field.max.toFixed(1) + '°C</span></div>',
  '<div class="iso-legend__meta">采样站点: ' + samplePoints.length + '</div>',
  '<div class="iso-legend__meta">插值网格: ' + field.cols + ' × ' + field.rows + '</div>',
  '<div class="iso-legend__meta">等值线级别: ' + contourLevels.join(' / ') + '</div>',
].join('')
document.body.appendChild(legend)

console.log('📊 已加载监测站:', samplePoints.length)
console.log('🟪 插值网格:', field.cols + '×' + field.rows)
console.log('🧭 等值线级别:', contourLevels.join(', '))
console.log('🗺️ 当前示例用平滑核插值模拟 Kriging 结果，真实业务可替换为 kriging.js 或服务端插值面')

viewer.camera.flyToBoundingSphere(contourSphere, {
  offset: new Cesium.HeadingPitchRange(
    Cesium.Math.toRadians(0),
    Cesium.Math.toRadians(-68),
    contourSphere.radius * 2.8
  ),
  duration: 2.2,
  complete: () => console.log('🗺️ 等值面可视化已加载'),
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }

.iso-legend {
  position: absolute;
  left: 18px;
  bottom: 18px;
  width: 250px;
  padding: 14px 14px 12px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.84);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #e2e8f0;
  font-family: 'SFMono-Regular', Consolas, monospace;
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(10px);
}

.iso-legend__title {
  font-size: 15px;
  font-weight: 700;
}

.iso-legend__subtitle,
.iso-legend__meta {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(226, 232, 240, 0.8);
}

.iso-legend__ramp {
  height: 10px;
  margin-top: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, #2166ac 0%, #67a9cf 25%, #f7f7bf 50%, #fdae61 75%, #d7191c 100%);
}

.iso-legend__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  color: rgba(226, 232, 240, 0.72);
}
`,
  },
  guide: {
    features: ['平滑插值栅格构建', 'SingleTileImageryProvider 色斑贴图', 'Marching Squares 等值线提取', '监测站点与图例联动'],
    points: ['真实 Kriging 通常需要半变异函数建模，这里用平滑核插值模拟整体工作流', '等值线适合表达阈值边界，色斑面更适合表达整体梯度', '网格分辨率越高，边界越平滑，但前端计算成本也越高'],
  },
}
