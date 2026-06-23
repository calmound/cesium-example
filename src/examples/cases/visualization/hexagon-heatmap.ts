import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'hexagon-heatmap',
  title: '蜂窝热力图',
  category: '数据可视化',
  description: '将离散空间点聚合到规则六边形网格，用挤出高度、颜色和标注同时编码强度，适合做城市热点分布分析。',
  tags: ['蜂窝图', '六边形聚合', '热力'],
  level: 'medium',
  files: {
    'main.ts': `// 蜂窝热力图示例
// 将离散点聚合到规则六边形网格

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

viewer.scene.globe.depthTestAgainstTerrain = true
viewer.scene.highDynamicRange = true

// ── 1. 生成模拟热点点数据 ────────────────────────────────────
type SamplePoint = { lon: number; lat: number; value: number }
type HexCell = { q: number; r: number; count: number; value: number; lon: number; lat: number }

const centerLon = 116.3974
const centerLat = 39.9093
const lonMeter = 111320 * Math.cos(Cesium.Math.toRadians(centerLat))
const latMeter = 110540
const hexRadius = 1800
const sampleCount = 520

const hotspots = [
  { lon: 116.3974, lat: 39.9093, weight: 1.0 },
  { lon: 116.4145, lat: 39.9164, weight: 0.85 },
  { lon: 116.3846, lat: 39.9008, weight: 0.72 },
  { lon: 116.429, lat: 39.8945, weight: 0.58 },
]

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function metersToDegrees(dx: number, dy: number) {
  return {
    lon: dx / lonMeter,
    lat: dy / latMeter,
  }
}

function generateSamples(): SamplePoint[] {
  const samples: SamplePoint[] = []

  hotspots.forEach((hotspot) => {
    const hotspotCount = Math.floor(sampleCount * hotspot.weight * 0.35)
    for (let i = 0; i < hotspotCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.sqrt(Math.random()) * 5200 * hotspot.weight
      const dx = Math.cos(angle) * radius
      const dy = Math.sin(angle) * radius
      const offset = metersToDegrees(dx, dy)
      samples.push({
        lon: hotspot.lon + offset.lon,
        lat: hotspot.lat + offset.lat,
        value: randomBetween(30, 100) * hotspot.weight,
      })
    }
  })

  while (samples.length < sampleCount) {
    const dx = randomBetween(-11000, 11000)
    const dy = randomBetween(-9000, 9000)
    const offset = metersToDegrees(dx, dy)
    samples.push({
      lon: centerLon + offset.lon,
      lat: centerLat + offset.lat,
      value: randomBetween(8, 45),
    })
  }

  return samples
}

// ── 2. 点坐标映射到六边形网格 ────────────────────────────────
function worldToAxial(lon: number, lat: number) {
  const x = (lon - centerLon) * lonMeter
  const y = (lat - centerLat) * latMeter

  const q = ((Math.sqrt(3) / 3) * x - y / 3) / hexRadius
  const r = ((2 / 3) * y) / hexRadius

  return cubeRound(q, r)
}

function cubeRound(qFloat: number, rFloat: number) {
  let q = Math.round(qFloat)
  let r = Math.round(rFloat)
  let s = Math.round(-qFloat - rFloat)

  const qDiff = Math.abs(q - qFloat)
  const rDiff = Math.abs(r - rFloat)
  const sDiff = Math.abs(s + qFloat + rFloat)

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s
  } else if (rDiff > sDiff) {
    r = -q - s
  } else {
    s = -q - r
  }

  return { q, r }
}

function axialToWorld(q: number, r: number) {
  const x = hexRadius * Math.sqrt(3) * (q + r / 2)
  const y = hexRadius * 1.5 * r
  const offset = metersToDegrees(x, y)
  return {
    lon: centerLon + offset.lon,
    lat: centerLat + offset.lat,
  }
}

function createHexagonDegrees(lon: number, lat: number, radius: number) {
  const positions: number[] = []
  for (let i = 0; i < 6; i++) {
    const angle = Cesium.Math.toRadians(60 * i - 30)
    const dx = Math.cos(angle) * radius
    const dy = Math.sin(angle) * radius
    const offset = metersToDegrees(dx, dy)
    positions.push(lon + offset.lon, lat + offset.lat)
  }
  return positions
}

const samples = generateSamples()
const buckets = new Map<string, HexCell>()

samples.forEach((point) => {
  const { q, r } = worldToAxial(point.lon, point.lat)
  const key = q + ',' + r
  const current = buckets.get(key)

  if (current) {
    current.count += 1
    current.value += point.value
    return
  }

  const center = axialToWorld(q, r)
  buckets.set(key, {
    q,
    r,
    count: 1,
    value: point.value,
    lon: center.lon,
    lat: center.lat,
  })
})

const cells = Array.from(buckets.values())
  .filter((cell) => cell.count >= 3)
  .sort((a, b) => b.count - a.count)

const maxCount = cells[0]?.count ?? 1
const maxValue = Math.max(...cells.map((cell) => cell.value), 1)
const cellCenters = cells.map((cell) =>
  Cesium.Cartesian3.fromDegrees(cell.lon, cell.lat, getExtrudedHeight(cell.count, cell.value) * 0.35)
)
const boundingSphere = Cesium.BoundingSphere.fromPoints(cellCenters)

// ── 3. 颜色与高度映射 ────────────────────────────────────────
const colorStops = [
  Cesium.Color.fromCssColorString('#1d4ed8'),
  Cesium.Color.fromCssColorString('#06b6d4'),
  Cesium.Color.fromCssColorString('#facc15'),
  Cesium.Color.fromCssColorString('#f97316'),
  Cesium.Color.fromCssColorString('#dc2626'),
]

function getHexColor(intensity: number) {
  const t = Cesium.Math.clamp(intensity, 0, 1)
  const segment = Math.min(Math.floor(t * (colorStops.length - 1)), colorStops.length - 2)
  const localT = t * (colorStops.length - 1) - segment
  return Cesium.Color.lerp(colorStops[segment], colorStops[segment + 1], localT, new Cesium.Color())
}

function getExtrudedHeight(count: number, value: number) {
  const countFactor = Math.pow(count / maxCount, 0.78)
  const valueFactor = Math.pow(value / maxValue, 0.72)
  return 600 + countFactor * 9500 + valueFactor * 7000
}

// ── 4. 绘制蜂窝网格 ──────────────────────────────────────────
cells.forEach((cell, index) => {
  const intensity = Cesium.Math.clamp(
    (cell.count / maxCount) * 0.7 + (cell.value / maxValue) * 0.3,
    0,
    1
  )
  const color = getHexColor(intensity)
  const extrudedHeight = getExtrudedHeight(cell.count, cell.value)
  const polygonDegrees = createHexagonDegrees(cell.lon, cell.lat, hexRadius * 0.94)

  viewer.entities.add({
    name: '蜂窝单元_' + index,
    polygon: {
      hierarchy: Cesium.Cartesian3.fromDegreesArray(polygonDegrees),
      height: 0,
      extrudedHeight,
      material: color.withAlpha(0.78),
      outline: true,
      outlineColor: color.brighten(0.18, new Cesium.Color()).withAlpha(0.95),
      perPositionHeight: false,
    },
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(
        polygonDegrees.concat(polygonDegrees[0], polygonDegrees[1])
      ),
      width: 1.5,
      material: color.withAlpha(0.45),
      clampToGround: false,
    },
    description: \`
      <div style="padding: 12px 14px; min-width: 220px;">
        <h3 style="margin: 0 0 8px; font-size: 16px;">蜂窝聚合单元</h3>
        <p style="margin: 4px 0;"><b>轴坐标:</b> q=\${cell.q}, r=\${cell.r}</p>
        <p style="margin: 4px 0;"><b>采样点数:</b> \${cell.count}</p>
        <p style="margin: 4px 0;"><b>累计强度:</b> \${cell.value.toFixed(1)}</p>
        <p style="margin: 4px 0;"><b>中心:</b> \${cell.lon.toFixed(4)}, \${cell.lat.toFixed(4)}</p>
      </div>
    \`,
  })

  if (cell.count >= maxCount * 0.78) {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(cell.lon, cell.lat, extrudedHeight + 500),
      label: {
        text: String(cell.count),
        font: '600 13px sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.fromCssColorString('#0f172a'),
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })
  }
})

// ── 5. 辅助图层与图例 ────────────────────────────────────────
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(centerLon, centerLat),
  point: {
    pixelSize: 10,
    color: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.fromCssColorString('#0f172a'),
    outlineWidth: 2,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
  label: {
    text: '北京热点核心区',
    font: '600 14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -18),
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
})

const legendHtml = [
  '<div class="hex-legend">',
  '  <div class="hex-legend__title">蜂窝热力图</div>',
  '  <div class="hex-legend__subtitle">颜色 + 挤出高度编码热点强度</div>',
  '  <div class="hex-legend__ramp"></div>',
  '  <div class="hex-legend__labels"><span>低</span><span>中</span><span>高</span></div>',
  '  <div class="hex-legend__meta">六边形半径: 1.8km</div>',
  '  <div class="hex-legend__meta">样本点数: ' + samples.length + '</div>',
  '  <div class="hex-legend__meta">有效网格: ' + cells.length + '</div>',
  '</div>',
].join('')

const legend = document.createElement('div')
legend.innerHTML = legendHtml
document.body.appendChild(legend.firstChild!)

console.log('🔷 原始样本点:', samples.length)
console.log('蜂窝网格单元:', cells.length)
console.log('📏 使用规则六边形 polygon 挤出，而不是圆柱近似')
console.log('🎨 颜色与高度共同表达热点强度')

viewer.camera.flyToBoundingSphere(boundingSphere, {
  offset: new Cesium.HeadingPitchRange(
    Cesium.Math.toRadians(8),
    Cesium.Math.toRadians(-72),
    boundingSphere.radius * 12
  ),
  duration: 2.2,
  complete: () => console.log('🟡 蜂窝热力图已加载'),
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }

.hex-legend {
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 220px;
  padding: 14px 14px 12px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.82);
  color: #e2e8f0;
  font-family: 'SFMono-Regular', Consolas, monospace;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(10px);
}

.hex-legend__title {
  font-size: 15px;
  font-weight: 700;
}

.hex-legend__subtitle,
.hex-legend__meta {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.4;
  color: rgba(226, 232, 240, 0.78);
}

.hex-legend__ramp {
  height: 10px;
  margin-top: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, #1d4ed8 0%, #06b6d4 25%, #facc15 55%, #f97316 78%, #dc2626 100%);
}

.hex-legend__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  color: rgba(226, 232, 240, 0.72);
}
`,
  },
  guide: {
    features: ['规则六边形网格聚合', 'Polygon 挤出表达数量强度', '热点采样模拟与轴坐标映射', '图例面板与高值标注'],
    points: ['蜂窝图应先做点到网格的聚合，而不是直接摆放随机柱体', '真实业务可替换为 H3 或 GeoHash 网格索引体系', '高度编码建议使用幂次或对数缩放，避免头部值压扁其他单元'],
  },
}
