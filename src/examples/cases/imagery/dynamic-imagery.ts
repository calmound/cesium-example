import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'dynamic-imagery',
  title: '动态时序影像',
  category: '影像服务',
  description: '根据时钟时间动态切换影像图层，实现气象、遥感、历史地图等随时间变化的时序影像播放效果。',
  tags: ['时序', '动态影像', '时钟'],
  level: 'medium',
  files: {
    'main.ts': `// 动态时序影像示例
// 演示根据时钟时间动态切换影像图层

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

// ── 1. 配置时钟时间轴 ───────────────────────────────────────────
viewer.clock.startTime = Cesium.JulianDate.fromIso8601('2024-01-01T00:00:00Z')
viewer.clock.stopTime = Cesium.JulianDate.fromIso8601('2024-01-07T00:00:00Z')
viewer.clock.currentTime = viewer.clock.startTime.clone()
viewer.clock.multiplier = 3600  // 1秒 = 1小时
viewer.clock.shouldAnimate = true

// ── 2. 模拟多时相影像数据（用不同底图模拟）─────────────────────
// 实际应用中，这些可以是同一地区不同时相的卫星影像
const timePeriods = [
  { name: 'OSM 标准底图', start: '2024-01-01', color: Cesium.Color.WHITE },
  { name: '卫星影像底图', start: '2024-01-03', color: Cesium.Color.AQUA },
  { name: '地形底图', start: '2024-01-05', color: Cesium.Color.LIME },
]

// 创建多个影像图层
const imageryLayers = timePeriods.map((period, index) => {
  const layer = viewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      // 使用不同的地图样式模拟时相差异
      url: index === 0 
        ? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        : index === 1
          ? 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png'
          : 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png',
      credit: period.name,
    })
  )
  layer.alpha = 0  // 初始透明
  layer.indices = index
  return layer
})

// ── 3. 时间轴切换逻辑 ──────────────────────────────────────────
function updateImageryForTime(julianDate: Cesium.JulianDate) {
  const isoDate = Cesium.JulianDate.toIso8601(julianDate)
  
  // 找出当前时间段应该显示哪些图层
  let currentPeriodIndex = 0
  for (let i = 0; i < timePeriods.length; i++) {
    if (isoDate >= timePeriods[i].start) {
      currentPeriodIndex = i
    }
  }
  
  // 平滑切换：淡入当前，淡出其他
  imageryLayers.forEach((layer, index) => {
    if (index === currentPeriodIndex) {
      layer.alpha = Cesium.Math.clamp(layer.alpha + 0.05, 0, 1)
    } else {
      layer.alpha = Cesium.Math.clamp(layer.alpha - 0.05, 0, 0.3)
    }
  })
}

// ── 4. 监听时钟 Tick 事件 ──────────────────────────────────────
viewer.clock.onTick.addEventListener((clock) => {
  updateImageryForTime(clock.currentTime)
  
  // 更新信息面板
  const isoDate = Cesium.JulianDate.toIso8601(clock.currentTime)
  const currentPeriod = timePeriods.find((p, i) => {
    const nextPeriod = timePeriods[i + 1]
    return isoDate >= p.start && (!nextPeriod || isoDate < nextPeriod.start)
  })
  if (currentPeriod) {
    console.log(\`📅 当前时相: \${currentPeriod.name} (时间: \${isoDate})\`)
  }
})

// ── 5. 添加时间标注 ────────────────────────────────────────────
let timeLabel: Cesium.Entity | null = null

function updateTimeLabel() {
  const currentTime = Cesium.JulianDate.toDate(viewer.clock.currentTime)
  const timeStr = currentTime.toLocaleString('zh-CN', { 
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
  
  if (!timeLabel) {
    timeLabel = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(120, 40),
      label: {
        text: timeStr,
        font: 'bold 18px sans-serif',
        fillColor: Cesium.Color.YELLOW,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        pixelOffset: new Cesium.Cartesian2(0, 10),
      },
    })
  } else {
    timeLabel.label!.text = timeStr
  }
}

viewer.scene.preRender.addEventListener(updateTimeLabel)

// ── 6. 暂停/播放控制 ───────────────────────────────────────────
console.log('💡 时序影像播放中...')
console.log('⏯️  clock.shouldAnimate = true 启动播放')
console.log('🔄 每隔约2秒自动切换一个时相图层')
console.log('⏱️  multiplier=3600 表示 1秒=1小时')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 15000000),
  duration: 2,
})

// ── 7. 模拟图层淡入淡出切换 ────────────────────────────────────
// 实际应用中，时序影像可能是气象雷达数据、洪水演进等
let opacity = 0
let increasing = true

setInterval(() => {
  if (increasing) {
    opacity += 0.1
    if (opacity >= 1) increasing = false
  } else {
    opacity -= 0.1
    if (opacity <= 0) increasing = true
  }
  // 应用到某个特定图层
  if (imageryLayers[1]) {
    imageryLayers[1].alpha = opacity
  }
}, 200)

console.log('🌊 模拟波浪式透明度动画（实际可用于时序数据渐变）')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['viewer.clock 时间轴控制', 'imageryLayers.add/remove 动态切换', '时钟事件监听 onTick', '气象雷达回波时序播放'],
    points: ['预加载多个图层可减少闪烁', 'alpha 渐变实现平滑过渡', 'clock.multiplier 控制播放速度'],
  },
}
