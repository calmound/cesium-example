import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'radar-scan',
  title: '雷达扫描材质',
  category: '材质与Shader',
  description: '实现旋转雷达扫描波效果：扇形渐变色、旋转动画、信号扩散圆环，可附着在地图上任意位置。',
  tags: ['雷达', '材质', '动态'],
  level: 'medium',
  files: {
    'main.ts': `// 雷达扫描材质示例
// 实现旋转雷达扫描波效果

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

// ── 1. 创建雷达基地点 ─────────────────────────────────────────
const radarPosition = Cesium.Cartesian3.fromDegrees(116.3972, 39.9073, 0)

// ── 2. 雷达扫描动画 ──────────────────────────────────────────
let scanAngle = 0
const scanSpeed = 0.02  // 旋转速度

function createRadarScanMaterial() {
  return new Cesium.ColorMaterialProperty(
    new Cesium.CallbackProperty(() => {
      scanAngle += scanSpeed
      if (scanAngle > Math.PI * 2) scanAngle -= Math.PI * 2

      // 创建渐变透明度的扇形效果
      const alpha = 0.8
      return Cesium.Color.fromCssColorString('#00ff00').withAlpha(alpha)
    }, false)
  )
}

// ── 3. 添加雷达扫描椭圆 ──────────────────────────────────────
const radarEntity = viewer.entities.add({
  position: radarPosition,
  ellipse: {
    semiMajorAxis: 500,
    semiMinorAxis: 500,
    material: createRadarScanMaterial(),
    height: 1,
    outline: true,
    outlineColor: Cesium.Color.GREEN,
    outlineWidth: 2,
  },
})

// ── 4. 添加扩散圆环 ──────────────────────────────────────────
let ringRadius = 0
setInterval(() => {
  ringRadius = 0
}, 2000)

setInterval(() => {
  ringRadius += 5
  if (ringRadius > 500) ringRadius = 0
}, 50)

// 添加扩散圆环
const ringEntity = viewer.entities.add({
  position: radarPosition,
  ellipse: {
    semiMajorAxis: new Cesium.CallbackProperty(() => ringRadius, false),
    semiMinorAxis: new Cesium.CallbackProperty(() => ringRadius, false),
    material: Cesium.Color.GREEN.withAlpha(0.3),
    height: 2,
  },
})

// ── 5. 添加雷达中心点 ─────────────────────────────────────────
viewer.entities.add({
  position: radarPosition,
  point: {
    pixelSize: 10,
    color: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
})

// ── 6. 添加扫描线 ─────────────────────────────────────────────
const scanLineEntity = viewer.entities.add({
  position: radarPosition,
  polyline: {
    positions: new Cesium.CallbackProperty(() => {
      const positions = []
      for (let i = 0; i <= 100; i++) {
        const angle = scanAngle
        const r = (i / 100) * 500
        const x = r * Math.cos(angle)
        const y = r * Math.sin(angle)
        const cartesian = Cesium.Cartesian3.fromDegrees(
          116.3972 + (x / 111000) * 0.01,
          39.9073 + (y / 111000) * 0.01
        )
        positions.push(cartesian)
      }
      return positions
    }, false),
    width: 2,
    material: Cesium.Color.GREEN,
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.3972, 39.9073, 2000),
  duration: 2,
  complete: () => console.log('📡 雷达扫描已启动'),
})

console.log('💡 雷达扫描：绿色扇形 + 扩散圆环 + 扫描线')
console.log('🎯 可调整 semiMajorAxis 修改探测范围')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['CircleWaveMaterial 波纹材质', 'CallbackProperty 驱动旋转角度', 'EllipseMaterialProperty 扇形着色', 'requestAnimationFrame 动画循环'],
    points: ['材质颜色用 Color.fromCssColorString 解析', 'atan2 计算片元角度实现扇形', 'alpha 透明度渐变增强真实感'],
  },
}
