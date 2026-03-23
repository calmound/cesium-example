import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'pixel-point',
  title: '像素点',
  category: '点标注',
  description: '使用 PointGraphics 绘制像素点，配置颜色、大小、轮廓，展示大量像素点与 Primitive 高性能渲染对比。',
  tags: ['像素点', 'PointGraphics', 'Primitive'],
  level: 'easy',
  files: {
    'main.ts': `// 像素点示例：Entity vs PointPrimitiveCollection 性能对比
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

// ── Part 1: Entity PointGraphics（适合少量点）────
const entityPoints = [
  { lon: 116.39, lat: 39.9,  label: '北京', color: Cesium.Color.RED,    size: 14 },
  { lon: 121.47, lat: 31.23, label: '上海', color: Cesium.Color.GOLD,   size: 14 },
  { lon: 113.26, lat: 23.13, label: '广州', color: Cesium.Color.CYAN,   size: 14 },
  { lon: 104.06, lat: 30.67, label: '成都', color: Cesium.Color.LIME,   size: 14 },
  { lon: 120.15, lat: 30.28, label: '杭州', color: Cesium.Color.VIOLET, size: 14 },
]

entityPoints.forEach(({ lon, lat, label, color, size }) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    point: {
      pixelSize: size,
      color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      // 按距离控制显示（近处才显示）
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000),
      // 高度剔除
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
    label: {
      text: label,
      font: 'bold 13px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -16),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3000000),
    },
  })
})
console.log(\`✅ Entity 方式添加 \${entityPoints.length} 个标注点\`)

// ── Part 2: PointPrimitiveCollection（适合大量点）─
// 随机生成 2000 个点覆盖中国范围
const pointCollection = viewer.scene.primitives.add(
  new Cesium.PointPrimitiveCollection()
)

const count = 2000
for (let i = 0; i < count; i++) {
  const lon = 73 + Math.random() * 62   // 73°E ~ 135°E
  const lat = 18 + Math.random() * 35   // 18°N ~ 53°N
  const hue = Math.random()
  pointCollection.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
    color: Cesium.Color.fromHsl(hue, 1.0, 0.5, 0.7),
    pixelSize: 4,
    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8000000),
  })
}
console.log(\`🚀 PointPrimitiveCollection 添加 \${count} 个随机点（高性能）\`)
console.log('💡 Entity 点适合 < 100 个；PointPrimitive 适合 10000+ 个')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(108, 35, 4000000),
  duration: 2,
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['PointGraphics 配置颜色与大小', 'PointPrimitive 高性能大量点', 'PointPrimitiveCollection 批量添加', '危化品扩散效果（动态像素点）'],
    points: ['Entity 像素点超过 10000 建议改用 Primitive', 'PointPrimitive 共享同一 WebGL Buffer', 'distanceDisplayCondition 按距离控制显示'],
  },
}
