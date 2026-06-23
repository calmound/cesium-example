import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'typhoon-track',
  title: '台风路径追踪',
  category: '综合应用',
  description: '展示台风历史路径与强度变化，动画回放台风移动过程，圆圈大小表达影响半径，颜色表达强度等级。',
  tags: ['台风', '气象', '路径'],
  level: 'medium',
  files: {
    'main.ts': `// 台风路径追踪示例
// 演示气象路径可视化

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

// ── 1. 台风数据 ─────────────────────────────────────────
const typhoonData = [
  { time: '2024-09-01 08:00', lon: 130.5, lat: 18.2, pressure: 920, speed: 55, windLevel: 16 },
  { time: '2024-09-01 14:00', lon: 129.8, lat: 19.1, pressure: 925, speed: 52, windLevel: 15 },
  { time: '2024-09-02 08:00', lon: 128.5, lat: 21.3, pressure: 935, speed: 48, windLevel: 15 },
  { time: '2024-09-02 14:00', lon: 126.9, lat: 23.5, pressure: 940, speed: 45, windLevel: 14 },
  { time: '2024-09-03 08:00', lon: 124.8, lat: 25.8, pressure: 950, speed: 42, windLevel: 14 },
  { time: '2024-09-03 14:00', lon: 122.5, lat: 27.5, pressure: 960, speed: 38, windLevel: 13 },
  { time: '2024-09-04 08:00', lon: 120.2, lat: 28.9, pressure: 970, speed: 35, windLevel: 12 },
  { time: '2024-09-04 14:00', lon: 118.5, lat: 29.8, pressure: 980, speed: 30, windLevel: 11 },
  { time: '2024-09-05 08:00', lon: 116.8, lat: 30.5, pressure: 990, speed: 25, windLevel: 10 },
]

// ── 2. 强度等级颜色 ────────────────────────────────────
function getWindLevelColor(level: number): Cesium.Color {
  if (level >= 17) return Cesium.Color.fromCssColorString('#8b0000') // 深红
  if (level >= 15) return Cesium.Color.RED
  if (level >= 13) return Cesium.Color.ORANGE
  if (level >= 10) return Cesium.Color.YELLOW
  return Cesium.Color.GREEN
}

// ── 3. 绘制路径线 ────────────────────────────────────────
const pathPositions = typhoonData.map(d => Cesium.Cartesian3.fromDegrees(d.lon, d.lat))

viewer.entities.add({
  name: '台风路径',
  polyline: {
    positions: pathPositions,
    width: 3,
    material: Cesium.Color.BLUE,
  },
})

// ── 4. 绘制路径节点 ─────────────────────────────────────
typhoonData.forEach((point, index) => {
  const color = getWindLevelColor(point.windLevel)

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
    point: {
      pixelSize: 10 + point.windLevel,
      color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: 'L' + (index + 1),
      font: 'bold 10px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -12),
    },
    description: \`
      <div style="padding: 10px;">
        <h3>台风位置 \${index + 1}</h3>
        <p><b>时间:</b> \${point.time}</p>
        <p><b>位置:</b> \${point.lon}°E, \${point.lat}°N</p>
        <p><b>中心气压:</b> \${point.pressure} hPa</p>
        <p><b>风速:</b> \${point.speed} m/s</p>
        <p><b>风力:</b> \${point.windLevel} 级</p>
      </div>
    \`,
  })
})

// ── 5. 当前台风影响圈 ───────────────────────────────────
const currentPoint = typhoonData[typhoonData.length - 1]

// 七级风圈
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(currentPoint.lon, currentPoint.lat),
  ellipse: {
    semiMajorAxis: 300000,
    semiMinorAxis: 300000,
    material: Cesium.Color.YELLOW.withAlpha(0.2),
    outline: true,
    outlineColor: Cesium.Color.YELLOW,
    outlineWidth: 2,
  },
})

// 十级风圈
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(currentPoint.lon, currentPoint.lat),
  ellipse: {
    semiMajorAxis: 150000,
    semiMinorAxis: 150000,
    material: Cesium.Color.ORANGE.withAlpha(0.3),
    outline: true,
    outlineColor: Cesium.Color.ORANGE,
    outlineWidth: 2,
  },
})

// 十二级风圈
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(currentPoint.lon, currentPoint.lat),
  ellipse: {
    semiMajorAxis: 80000,
    semiMinorAxis: 80000,
    material: Cesium.Color.RED.withAlpha(0.4),
    outline: true,
    outlineColor: Cesium.Color.RED,
    outlineWidth: 3,
  },
})

// 当前点标注
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(currentPoint.lon, currentPoint.lat),
  billboard: {
    image: createTyphoonSymbol(),
    width: 50,
    height: 50,
  },
  label: {
    text: '台风编号2415',
    font: 'bold 14px sans-serif',
    fillColor: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

// ── 6. 台风符号 ─────────────────────────────────────────
function createTyphoonSymbol(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#ff4444'
  ctx.beginPath()
  ctx.arc(32, 32, 28, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'white'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(32, 32, 20, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 24px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('T', 32, 32)

  return canvas
}

// ── 7. 图例 ─────────────────────────────────────────────
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.5, 18),
  label: {
    text: '🟥17级+ 🟥15-16级 🟧13-14级 🟨10-12级 🟩<10级',
    font: '12px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(125, 25, 5000000),
  duration: 2,
  complete: () => console.log('🌀 台风路径已加载'),
})

console.log('💡 台风路径追踪示例')
console.log('🔴 颜色表示风力等级')
console.log('📍 路径节点从左到右为时间序列')
console.log('⭕ 圆圈表示各等级风圈范围')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['台风路径折线与节点标注', '影响半径动态圆圈', '强度等级颜色编码', '动画逐步展示路径'],
    points: ['台风圆圈半径对应 7/10/12 级风圈', '路径节点时间间隔 6 小时', '动画速度可按实际时间比例播放'],
  },
}
