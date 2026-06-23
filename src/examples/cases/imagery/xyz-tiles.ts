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

// ── 手动切换面板 ─────────────────────────────
const controlPanel = document.createElement('div')
controlPanel.style.cssText = [
  'position:absolute',
  'top:12px',
  'left:12px',
  'z-index:10',
  'display:flex',
  'flex-wrap:wrap',
  'gap:8px',
  'padding:10px',
  'border-radius:12px',
  'background:rgba(15, 23, 42, 0.82)',
  'backdrop-filter:blur(10px)',
  'box-shadow:0 12px 32px rgba(15, 23, 42, 0.28)',
'].join(';')

const panelTitle = document.createElement('div')
panelTitle.textContent = 'XYZ / TMS 底图切换'
panelTitle.style.cssText = 'width:100%;color:#e2e8f0;font-size:12px;font-weight:600;letter-spacing:0.04em;'
controlPanel.appendChild(panelTitle)

function switchBasemap(name) {
  viewer.imageryLayers.removeAll()
  viewer.imageryLayers.addImageryProvider(basemaps[name])
  console.log(\`🗺️  已切换到底图: \${name}\`)
}

function switchOverlay() {
  viewer.imageryLayers.removeAll()
  viewer.imageryLayers.addImageryProvider(basemaps.osm)
  const overlay = viewer.imageryLayers.addImageryProvider(basemaps.toner)
  overlay.alpha = 0.4
  console.log('🎨 已切换到 OSM + Toner 叠加显示（Toner 透明度 0.4）')
}

function createSwitchButton(label, onClick, active = false) {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = label
  button.style.cssText = [
    'border:1px solid rgba(148, 163, 184, 0.35)',
    'border-radius:999px',
    'padding:6px 12px',
    'font-size:12px',
    'line-height:1',
    'cursor:pointer',
    'color:#e2e8f0',
    'background:rgba(30, 41, 59, 0.9)',
    'transition:all 0.2s ease',
  ].join(';')
  if (active) {
    button.style.background = 'rgba(59, 130, 246, 0.92)'
    button.style.borderColor = 'rgba(96, 165, 250, 0.95)'
  }
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'translateY(-1px)'
    button.style.borderColor = 'rgba(96, 165, 250, 0.9)'
  })
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'translateY(0)'
    button.style.borderColor = active ? 'rgba(96, 165, 250, 0.95)' : 'rgba(148, 163, 184, 0.35)'
  })
  button.addEventListener('click', onClick)
  return button
}

controlPanel.appendChild(createSwitchButton('OSM', () => switchBasemap('osm'), true))
controlPanel.appendChild(createSwitchButton('高德', () => switchBasemap('amap')))
controlPanel.appendChild(createSwitchButton('Toner', () => switchBasemap('toner')))
controlPanel.appendChild(createSwitchButton('Watercolor', () => switchBasemap('watercolor')))
controlPanel.appendChild(createSwitchButton('OSM + Toner', switchOverlay))
container.appendChild(controlPanel)

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 2000000),
  duration: 1.5,
})

console.log('📦 加载 4 种 XYZ 瓦片服务：OSM / 高德 / Toner / Watercolor')
console.log('🧭 使用左上角按钮手动切换底图或叠加显示')
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
