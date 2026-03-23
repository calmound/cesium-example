import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'label-text',
  title: '文字标注',
  category: '点标注',
  description: '添加文字标注实体，设置字体、颜色、背景、描边，实现文字贴图（静态）和大量 Primitive 文字高性能渲染。',
  tags: ['Label', '文字', '标注'],
  level: 'easy',
  files: {
    'main.ts': `// 文字标注示例：LabelGraphics + LabelCollection + Canvas 文字贴图
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

// ── Part 1: LabelGraphics（适合少量文字标注）──────
const cityData = [
  { lon: 116.39, lat: 39.9,  name: '北京', population: 2154, level: 'capital' },
  { lon: 121.47, lat: 31.23, name: '上海', population: 2487, level: 'major' },
  { lon: 113.26, lat: 23.13, name: '广州', population: 1531, level: 'major' },
  { lon: 104.06, lat: 30.67, name: '成都', population: 2093, level: 'major' },
  { lon: 120.15, lat: 30.28, name: '杭州', population: 1220, level: 'major' },
]

cityData.forEach(({ lon, lat, name, population, level }) => {
  const color = level === 'capital' ? Cesium.Color.YELLOW : Cesium.Color.CYAN
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    label: {
      text: name,
      font: \`bold \${level === 'capital' ? 18 : 15}px sans-serif\`,
      fillColor: color,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -12),
      backgroundColor: new Cesium.Color(0, 0, 0, 0.5),
      backgroundPadding: new Cesium.Cartesian2(8, 6),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000),
    },
    description: \`人口: \${population}万\`,
  })
})
console.log(\`✅ LabelGraphics 添加 \${cityData.length} 个城市标注\`)

// ── Part 2: LabelCollection（适合大量文字标注）────
// 内部使用纹理图集，性能远优于 Entity Label
const labelCollection = viewer.scene.primitives.add(new Cesium.LabelCollection())

// 随机生成 500 个标注点
const labelCount = 500
for (let i = 0; i < labelCount; i++) {
  const lon = 73 + Math.random() * 62
  const lat = 18 + Math.random() * 35
  const hue = Math.random()
  labelCollection.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    text: \`POI-\${i}\`,
    font: '12px sans-serif',
    fillColor: Cesium.Color.fromHsl(hue, 0.8, 0.7),
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 1,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.CENTER,
    pixelOffset: new Cesium.Cartesian2(0, 0),
    scaleByDistance: new Cesium.NearFarScalar(1000000, 0.8, 5000000, 0.3),
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000000),
  })
}
console.log(\`🚀 LabelCollection 添加 \${labelCount} 个 POI 标注（高性能）\`)

// ── Part 3: Canvas 文字贴图转 Billboard（适合静态标注）────
// 使用 Canvas 绘制文字，转换为纹理图片，适合永久固定的标注
function createTextBillboard(text: string, font: string, fillColor: string, bgColor: string) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const padding = 10
  
  ctx.font = font
  const metrics = ctx.measureText(text)
  const textWidth = metrics.width
  const textHeight = 24
  
  canvas.width = textWidth + padding * 2
  canvas.height = textHeight + padding * 2
  
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  ctx.font = font
  ctx.fillStyle = fillColor
  ctx.textBaseline = 'middle'
  ctx.fillText(text, padding, canvas.height / 2)
  
  return canvas
}

const staticLabels = [
  { lon: 116.39, lat: 39.95, text: '北京市政府', color: '#e74c3c' },
  { lon: 121.47, lat: 31.23, text: '上海市政府', color: '#3498db' },
  { lon: 113.26, lat: 23.15, text: '广州塔', color: '#2ecc71' },
]

staticLabels.forEach(({ lon, lat, text, color }) => {
  const canvas = createTextBillboard(text, 'bold 14px sans-serif', color, 'rgba(255,255,255,0.9)')
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    billboard: {
      image: canvas,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -5),
    },
  })
})
console.log(\`🏷️  Canvas 文字贴图添加 \${staticLabels.length} 个静态标注\`)

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(108, 35, 4000000),
  duration: 2,
})
console.log('💡 LabelCollection 适合 1000+ 文字标注；Canvas 贴图适合永久静态标注')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['LabelGraphics 配置字体与样式', 'LabelCollection 批量高性能文字', '文字贴图（Canvas 转 Billboard）', '大量文字 Primitive 渲染'],
    points: ['LabelCollection 内部生成纹理图集', '文字贴图适合静态标注（性能更好）', 'backgroundPadding 控制背景边距'],
  },
}
