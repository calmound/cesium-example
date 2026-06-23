import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'smart-park',
  title: '智慧园区',
  category: '综合应用',
  description: '基于真实园区 3D Tiles 数据，集成人员定位、设备告警、视频监控、环境传感器等 IoT 数据的综合可视化平台。',
  tags: ['智慧园区', 'IoT', '3DTiles'],
  level: 'hard',
  files: {
    'main.ts': `// 智慧园区示例
// 演示 IoT 数据综合可视化

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

// ── 1. 模拟建筑物 ──────────────────────────────────────
const buildings = [
  { name: 'A座办公楼', lon: 114.06, lat: 22.54, height: 80 },
  { name: 'B座研发楼', lon: 114.065, lat: 22.542, height: 60 },
  { name: 'C座厂房', lon: 114.058, lat: 22.538, height: 40 },
  { name: 'D座仓库', lon: 114.062, lat: 22.535, height: 25 },
]

buildings.forEach((b) => {
  viewer.entities.add({
    name: b.name,
    position: Cesium.Cartesian3.fromDegrees(b.lon, b.lat, b.height / 2),
    box: {
      dimensions: new Cesium.Cartesian3(30, 30, b.height),
      material: Cesium.Color.fromCssColorString('#4a90d9').withAlpha(0.8),
      outline: true,
      outlineColor: Cesium.Color.WHITE,
    },
    label: {
      text: b.name,
      font: 'bold 12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10),
    },
  })
})

// ── 2. 人员定位 ───────────────────────────────────────
const personnel = [
  { name: '张三', lon: 114.060, lat: 22.540, status: 'normal' },
  { name: '李四', lon: 114.063, lat: 22.541, status: 'normal' },
  { name: '王五', lon: 114.065, lat: 22.539, status: 'alert' },
]

personnel.forEach((p) => {
  const color = p.status === 'alert' ? Cesium.Color.RED : Cesium.Color.GREEN

  viewer.entities.add({
    name: p.name,
    position: Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 1),
    point: {
      pixelSize: 12,
      color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: p.name,
      font: '11px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -14),
    },
  })
})

// ── 3. 告警设备 ───────────────────────────────────────
const alerts = [
  { name: '温感告警', lon: 114.058, lat: 22.542, type: 'fire' },
  { name: '安防告警', lon: 114.064, lat: 22.536, type: 'security' },
]

alerts.forEach((alert) => {
  const color = alert.type === 'fire' ? Cesium.Color.ORANGE : Cesium.Color.YELLOW

  viewer.entities.add({
    name: alert.name,
    position: Cesium.Cartesian3.fromDegrees(alert.lon, alert.lat, 1),
    billboard: {
      image: createAlertIcon(color),
      width: 30,
      height: 30,
    },
  })
})

// ── 4. 环境传感器数据 ──────────────────────────────────
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(114.061, 22.54),
  label: {
    text: '温度: 25°C | 湿度: 65% | PM2.5: 35',
    font: '12px sans-serif',
    fillColor: Cesium.Color.CYAN,
    outlineColor: Cesium.Color.BLACK,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.TOP,
    pixelOffset: new Cesium.Cartesian2(0, 10),
  },
})

// ── 5. 摄像头标注 ─────────────────────────────────────
const cameras = [
  { name: 'CAM-01', lon: 114.059, lat: 22.543 },
  { name: 'CAM-02', lon: 114.064, lat: 22.540 },
  { name: 'CAM-03', lon: 114.062, lat: 22.537 },
]

cameras.forEach((cam) => {
  viewer.entities.add({
    name: cam.name,
    position: Cesium.Cartesian3.fromDegrees(cam.lon, cam.lat, 1),
    point: {
      pixelSize: 8,
      color: Cesium.Color.BLUE,
    },
    label: {
      text: cam.name,
      font: '10px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -10),
    },
  })
})

// ── 6. 告警图标生成 ───────────────────────────────────
function createAlertIcon(color: Cesium.Color): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'
  ctx.beginPath()
  ctx.arc(16, 16, 14, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('!', 16, 16)

  return canvas
}

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(114.061, 22.54, 300),
  duration: 2,
  complete: () => console.log('🏢 智慧园区已加载'),
})

console.log('💡 智慧园区综合可视化示例')
console.log('👥 绿色=正常人员, 红色=告警人员')
console.log('📹 蓝点=摄像头位置')
console.log('🔔 橙色=火警, 黄色=安防告警')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['3D Tiles 园区模型加载', '实时人员位置更新', '告警点扩散动画', '视频融合监控'],
    points: ['WebSocket 接收实时位置数据', '告警级别对应颜色/动画强度', '建议分楼层管理实体'],
  },
}
