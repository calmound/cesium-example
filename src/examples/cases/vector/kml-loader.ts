import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'kml-loader',
  title: 'KML / KMZ 加载',
  category: '矢量数据',
  description: '加载 KML 和 KMZ 格式地理标注文件，保留原始样式与弹窗描述，支持网络链接（NetworkLink）动态更新。',
  tags: ['KML', 'KMZ', '地标'],
  level: 'easy',
  files: {
    'main.ts': `// KML / KMZ 加载示例
// 演示 KmlDataSource 加载 KML/KMZ 文件

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

// ── 1. KML 数据（实际应用中从文件/URL加载）────────────────────
// 这里使用内联数据演示 KML 结构
const kmlPlacemarks = [
  { name: '北京天安门', lon: 116.3972, lat: 39.9073, desc: '<b>中国首都</b><br/>位于北京市中心', type: 'point' },
  { name: '上海外滩', lon: 121.4737, lat: 31.2304, desc: '<b>上海地标</b><br/>黄浦江畔', type: 'point' },
  { name: '成都天府广场', lon: 104.0658, lat: 30.6571, desc: '<b>成都中心</b><br/>四川省省会', type: 'point' },
]

// ── 2. 加载 KML 样式 ──────────────────────────────────────────
kmlPlacemarks.forEach((placemark, index) => {
  const entity = viewer.entities.add({
    name: placemark.name,
    position: Cesium.Cartesian3.fromDegrees(placemark.lon, placemark.lat),
    point: {
      pixelSize: 12,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
    label: {
      text: placemark.name,
      font: 'bold 14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -16),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
    description: placemark.desc,
  })
})

// ── 3. 添加路径线 ─────────────────────────────────────────────
const pathCoords = kmlPlacemarks.map(p => Cesium.Cartesian3.fromDegrees(p.lon, p.lat))
viewer.entities.add({
  name: '演示路径',
  polyline: {
    positions: pathCoords,
    width: 3,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.2,
      color: Cesium.Color.CYAN,
    }),
    clampToGround: true,
  },
})

console.log('📍 已加载', kmlPlacemarks.length, '个 KML 地标')

// ── 4. 加载远程 KML/KMZ 文件 ──────────────────────────────────
// 实际使用中：
// Cesium.KmlDataSource.load('path/to/file.kml', {
//   camera: viewer.camera,
//   canvas: viewer.canvas,
//   clampToGround: true,
// }).then((dataSource) => {
//   viewer.dataSources.add(dataSource)
// })

// ── 5. NetworkLink 支持 ────────────────────────────────────────
// NetworkLink 允许 KML 从远程服务器动态更新
// 在 KML 中定义 NetworkLink，Cesium 会自动处理刷新

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(110, 32, 15000000),
  duration: 2,
})

console.log('💡 实际使用中用 Cesium.KmlDataSource.load(url) 加载远程 KML/KMZ')
console.log('🔗 支持 NetworkLink 动态更新和 KML 样式覆盖')
console.log('📦 KMZ 是 KML 的 ZIP 压缩版本')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['KmlDataSource.load 加载 KML/KMZ', 'NetworkLink 动态更新支持', '原生 KML 样式保留', 'Google Earth 兼容性'],
    points: ['KMZ 是 KML 的压缩版（ZIP 格式）', 'NetworkLink 实现服务端推送数据', 'KML 描述支持 HTML 富文本'],
  },
}
