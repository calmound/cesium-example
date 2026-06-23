import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'sunshine-analysis',
  title: '日照分析',
  category: '空间分析',
  description: '基于 Cesium 真实太阳光照与阴影能力，演示一天内不同时刻建筑阴影的方向和长度变化。',
  tags: ['日照', '阴影', '太阳'],
  level: 'hard',
  files: {
    'main.ts': `// 太阳与建筑阴影演示
// 使用 Cesium 内置太阳光照与阴影，而不是手动模拟太阳点

const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false,
  animation: false,
  timeline: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  fullscreenButton: false,
  infoBox: false,
  selectionIndicator: false,
  shadows: true,
  terrainShadows: Cesium.ShadowMode.RECEIVE_ONLY,
  baseLayer: new Cesium.ImageryLayer(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: 'OpenStreetMap contributors',
    })
  ),
})
viewerRef.current = viewer

viewer.scene.globe.enableLighting = true
viewer.scene.globe.showGroundAtmosphere = true
viewer.scene.skyAtmosphere.show = true
viewer.scene.fog.enabled = false
viewer.scene.shadowMap.enabled = true
viewer.scene.shadowMap.softShadows = true
viewer.scene.shadowMap.maximumDistance = 10000
viewer.clock.shouldAnimate = false
viewer.clock.multiplier = 1

const centerLon = 121.47
const centerLat = 31.23
const localUtcOffsetHours = 8
const sampleDate = '2024-06-21'

const toJulianDate = (hour: number) => {
  const wholeHour = Math.floor(hour)
  const minute = Math.round((hour - wholeHour) * 60)
  const utcHour = wholeHour - localUtcOffsetHours

  return Cesium.JulianDate.fromDate(
    new Date(Date.UTC(2024, 5, 21, utcHour, minute, 0))
  )
}

const formatLocalTime = (hour: number) => {
  const wholeHour = Math.floor(hour)
  const minute = Math.round((hour - wholeHour) * 60)
  return String(wholeHour).padStart(2, '0') + ':' + String(minute).padStart(2, '0')
}

const blocks = [
  { name: '住宅 A', lon: centerLon - 0.0012, lat: centerLat - 0.0002, width: 60, depth: 36, height: 120, color: '#d97706' },
  { name: '住宅 B', lon: centerLon + 0.0001, lat: centerLat + 0.0009, width: 48, depth: 32, height: 90, color: '#9a3412' },
  { name: '办公楼', lon: centerLon + 0.0011, lat: centerLat - 0.0003, width: 72, depth: 42, height: 150, color: '#78716c' },
]

const groundSize = 0.0032
viewer.entities.add({
  name: '分析地面',
  rectangle: {
    coordinates: Cesium.Rectangle.fromDegrees(
      centerLon - groundSize,
      centerLat - groundSize,
      centerLon + groundSize,
      centerLat + groundSize
    ),
    material: Cesium.Color.fromCssColorString('#e7e5e4'),
    height: 0,
    shadows: Cesium.ShadowMode.RECEIVE_ONLY,
  },
})

blocks.forEach((block) => {
  viewer.entities.add({
    name: block.name,
    position: Cesium.Cartesian3.fromDegrees(block.lon, block.lat, block.height / 2),
    box: {
      dimensions: new Cesium.Cartesian3(block.width, block.depth, block.height),
      material: Cesium.Color.fromCssColorString(block.color),
      outline: true,
      outlineColor: Cesium.Color.WHITE.withAlpha(0.55),
      shadows: Cesium.ShadowMode.ENABLED,
    },
    label: {
      text: block.name,
      font: 'bold 13px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -22),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })
})

const statusPanel = document.createElement('div')
statusPanel.className = 'sunshine-panel'
statusPanel.innerHTML = [
  '<div class="sunshine-title">太阳与建筑阴影</div>',
  '<div class="sunshine-subtitle">日期：2024-06-21（上海本地时间）</div>',
  '<div class="sunshine-row">',
  '  <span>06:00</span>',
  '  <input id="sunshine-time-slider" type="range" min="6" max="18" step="0.25" value="8" />',
  '  <span>18:00</span>',
  '</div>',
  '<div class="sunshine-readout">',
  '  <div><span>当前时刻</span><strong id="sunshine-current-time">08:00</strong></div>',
  '  <div><span>阴影特征</span><strong id="sunshine-shadow-tip">长阴影，朝西偏北</strong></div>',
  '  <div><span>观察提示</span><strong>拖动滑块对比早晚与正午</strong></div>',
  '</div>',
].join('')
container.appendChild(statusPanel)

const slider = statusPanel.querySelector('#sunshine-time-slider')
const currentTimeEl = statusPanel.querySelector('#sunshine-current-time')
const shadowTipEl = statusPanel.querySelector('#sunshine-shadow-tip')

const updateShadowTip = (hour: number) => {
  if (hour < 9) return '长阴影，朝西偏北'
  if (hour < 11.5) return '阴影快速变短，转向正北附近'
  if (hour < 13.5) return '正午附近，阴影最短'
  if (hour < 16.5) return '阴影再次拉长，转向东侧'
  return '傍晚长阴影，朝东偏南'
}

const setSimulationTime = (hour: number) => {
  const nextTime = toJulianDate(hour)
  viewer.clock.startTime = nextTime.clone()
  viewer.clock.stopTime = nextTime.clone()
  viewer.clock.currentTime = nextTime.clone()
  currentTimeEl.textContent = formatLocalTime(hour)
  shadowTipEl.textContent = updateShadowTip(hour)
  viewer.scene.requestRender()
  console.log('🕒 当前时间:', sampleDate, formatLocalTime(hour), '(UTC+8)')
}

slider.addEventListener('input', (event) => {
  const hour = Number(event.target.value)
  setSimulationTime(hour)
})

setSimulationTime(8)

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat - 0.0016, 900),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-28),
    roll: 0,
  },
  duration: 1.8,
  complete: () => {
    console.log('☀️ 太阳与建筑阴影演示已加载')
    console.log('🎚️ 拖动右上角时间滑块，观察阴影方向和长度变化')
    console.log('🌇 早晚阴影长，正午阴影短')
  },
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }

.sunshine-panel {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 320px;
  padding: 14px 16px;
  border-radius: 16px;
  color: #fafaf9;
  background: linear-gradient(180deg, rgba(28, 25, 23, 0.9), rgba(41, 37, 36, 0.82));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(10px);
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.sunshine-title {
  font-size: 16px;
  font-weight: 700;
}

.sunshine-subtitle {
  margin-top: 4px;
  color: rgba(231, 229, 228, 0.78);
  font-size: 12px;
}

.sunshine-row {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  font-size: 12px;
  color: #e7e5e4;
}

.sunshine-row input {
  width: 100%;
  accent-color: #f59e0b;
}

.sunshine-readout {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.sunshine-readout div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 12px;
}

.sunshine-readout span {
  color: rgba(231, 229, 228, 0.72);
}

.sunshine-readout strong {
  color: #fef3c7;
  text-align: right;
}
`,
  },
  guide: {
    features: ['viewer.scene.shadows 开启真实阴影', 'globe.enableLighting 使用太阳光照', '通过时间滑块控制固定日期时刻', '倾斜视角观察建筑阴影长度变化'],
    points: ['阴影效果依赖相机角度，俯视太高时不明显', '本案例固定为 2024-06-21 上海本地时间', '要做真正日照时长分析，还需要对目标点逐时采样'],
  },
}
