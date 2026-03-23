import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'xyz-tiles',
  title: 'XYZ / TMS 瓦片服务',
  category: '影像服务',
  description: '加载标准 XYZ 瓦片（OSM、高德、谷歌等）和 TMS 瓦片服务，配置子域名负载均衡与自定义 URL 模板。',
  tags: ['XYZ', 'TMS', '底图'],
  level: 'easy',
  files: {
    'main.ts': `// XYZ / TMS 瓦片服务示例
// 演示多种常见瓦片底图的加载方式

// ── 定义几种底图配置 ─────────────────────────
const basemaps = {
  osm: new Cesium.UrlTemplateImageryProvider({
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    credit: 'OpenStreetMap contributors',
    maximumLevel: 19,
  }),
  // 高德标准地图（注意：国内地图存在 GCJ02 偏移，仅做演示）
  amap: new Cesium.UrlTemplateImageryProvider({
    url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    subdomains: ['1', '2', '3', '4'],
    credit: '高德地图',
    maximumLevel: 18,
  }),
  // Stamen Toner（黑白风格）
  toner: new Cesium.UrlTemplateImageryProvider({
    url: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png',
    credit: 'Stadia Maps / Stamen Design',
    maximumLevel: 18,
  }),
  // Stamen Watercolor（水彩风格）
  watercolor: new Cesium.UrlTemplateImageryProvider({
    url: 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg',
    credit: 'Stadia Maps / Stamen Design',
    maximumLevel: 16,
  }),
}

// ── 初始化 Viewer（OSM 底图）───────────────────
const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false, animation: false, timeline: false,
  geocoder: false, homeButton: false, sceneModePicker: false,
  navigationHelpButton: false, fullscreenButton: false,
  baseLayer: new Cesium.ImageryLayer(basemaps.osm),
})
viewerRef.current = viewer

// ── 底图切换演示 ────────────────────────────
const names = ['osm', 'amap', 'toner', 'watercolor']
let current = 0

function switchBasemap(name) {
  viewer.imageryLayers.removeAll()
  viewer.imageryLayers.addImageryProvider(basemaps[name])
  console.log(\`🗺️  切换底图: \${name}\`)
}

// 每 3 秒自动切换底图
const timer = setInterval(() => {
  current = (current + 1) % names.length
  switchBasemap(names[current])
}, 3000)

// ── 叠加图层示例：在 OSM 上叠加半透明瓦片 ─────
// 先保留 OSM，再叠加一层
setTimeout(() => {
  clearInterval(timer)
  viewer.imageryLayers.removeAll()
  viewer.imageryLayers.addImageryProvider(basemaps.osm)

  // 叠加 Toner 样式（半透明）
  const overlay = viewer.imageryLayers.addImageryProvider(basemaps.toner)
  overlay.alpha = 0.4
  console.log('🎨 OSM + Toner 叠加显示（Toner 透明度 0.4）')
}, 14000)

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 2000000),
  duration: 1.5,
})

console.log('📦 加载 4 种 XYZ 瓦片服务：OSM / 高德 / Toner / Watercolor')
console.log('🔄 每 3 秒自动切换底图...')
console.log('💡 subdomains 参数可分散请求到多个 CDN 节点')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['UrlTemplateImageryProvider 加载 XYZ 瓦片', 'TileMapServiceImageryProvider 加载 TMS', 'subdomains 配置子域名', 'customTags 扩展 URL 模板参数'],
    points: ['XYZ 坐标原点在左上角，TMS 在左下角', 'maximumLevel 控制最大缩放级别', '瓦片服务需符合 CORS 策略'],
  },
}
