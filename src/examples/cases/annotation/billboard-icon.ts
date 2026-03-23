import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'billboard-icon',
  title: '图标 Billboard',
  category: '点标注',
  description: '在地图上放置图片图标，支持 Canvas 动态绘制图标、字体图标、AQI 等级气泡图、可拖拽图标等效果。',
  tags: ['Billboard', '图标', '图片'],
  level: 'easy',
  files: {
    'main.ts': `// Billboard 图标示例
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

// ── 用 Canvas 动态绘制各类图标 ─────────────────

// 方式 A：Canvas 绘制彩色圆形图标
function makeCircleIcon(color, size = 48) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const r = size / 2
  // 外圈白色
  ctx.beginPath()
  ctx.arc(r, r, r - 2, 0, Math.PI * 2)
  ctx.fillStyle = 'white'
  ctx.fill()
  // 内圈彩色
  ctx.beginPath()
  ctx.arc(r, r, r - 6, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  return canvas
}

// 方式 B：Canvas 绘制定位图钉图标
function makePinIcon(color, size = 48) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size * 1.4
  const ctx = canvas.getContext('2d')
  const r = size / 2
  const tipY = size * 1.3

  // 圆头
  ctx.beginPath()
  ctx.arc(r, r, r - 2, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 3
  ctx.stroke()

  // 尖尾
  ctx.beginPath()
  ctx.moveTo(r - 10, r + 10)
  ctx.lineTo(r, tipY)
  ctx.lineTo(r + 10, r + 10)
  ctx.fillStyle = color
  ctx.fill()

  // 中心白点
  ctx.beginPath()
  ctx.arc(r, r, 8, 0, Math.PI * 2)
  ctx.fillStyle = 'white'
  ctx.fill()

  return canvas
}

// ── 添加各类 Billboard ──────────────────────────
const pois = [
  { lon: 121.47, lat: 31.23, name: '上海', icon: makePinIcon('#e74c3c') },
  { lon: 116.39, lat: 39.9,  name: '北京', icon: makePinIcon('#3498db') },
  { lon: 113.26, lat: 23.13, name: '广州', icon: makePinIcon('#2ecc71') },
  { lon: 104.06, lat: 30.67, name: '成都', icon: makePinIcon('#f39c12') },
  { lon: 120.15, lat: 30.28, name: '杭州', icon: makeCircleIcon('#9b59b6') },
  { lon: 114.31, lat: 30.52, name: '武汉', icon: makeCircleIcon('#1abc9c') },
]

pois.forEach(({ lon, lat, name, icon }) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    billboard: {
      image: icon,
      width: 40,
      height: 56,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, 0),
      // 近处显示（避免远处叠加混乱）
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 4000000),
      // 缩放随距离变化
      scaleByDistance: new Cesium.NearFarScalar(500000, 1.2, 3000000, 0.6),
    },
    label: {
      text: name, font: 'bold 13px sans-serif',
      fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2, style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -62),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3000000),
    },
  })
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116, 32, 2500000),
  duration: 2,
})

console.log('🗺️  Billboard 图标演示')
console.log('📌 定位图钉：北京/上海/广州/成都（Canvas 绘制）')
console.log('⭕ 圆形图标：杭州/武汉（Canvas 绘制）')
console.log('💡 scaleByDistance 使图标随距离缩放')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['BillboardGraphics 图片图标配置', 'BillboardCollection 批量高性能图标', 'Canvas 动态绘制图标纹理', '字体图标（iconfont）渲染'],
    points: ['image 支持 URL / Canvas / HTMLImageElement', 'sizeInMeters 控制世界空间缩放', 'pixelOffset 精确控制偏移'],
  },
}
