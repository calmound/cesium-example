import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'wms-service',
  title: 'WMS 地图服务',
  category: '影像服务',
  description: '对接 OGC WMS 标准服务，配置图层名称、样式、时间维度参数，实现多图层叠加与透明度混合。',
  tags: ['WMS', 'OGC', '地图服务'],
  level: 'easy',
  files: {
    'main.ts': `// WMS 地图服务示例
// 演示 WebMapServiceImageryProvider 加载 OGC WMS 标准服务

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

// ── 1. 加载 NASA Blue Marble WMS ────────────────────────────────
// NASA Blue Marble 是全球卫星影像底图，分辨率较高
const blueMarble = new Cesium.WebMapServiceImageryProvider({
  url: 'https://planetarymaps.sci.nasa.gov/cgi-bin/cismap_cubediv.pl',
  layers: 'mars',
  parameters: {
    service: 'WMS',
    version: '1.1.1',
    request: 'GetMap',
    format: 'image/png',
    transparent: true,
    width: 512,
    height: 512,
  },
  credit: 'NASA/PL Mars',
  maximumLevel: 8,
})

// ── 2. 叠加 US States WMS（美国州边界）──────────────────────────
// 使用开源的 Natural Earth 数据 WMS
const statesLayer = new Cesium.WebMapServiceImageryProvider({
  url: 'https://mesonet.agron.iastate.edu/cgi-bin/wms/us/state_goes106.cgi',
  layers: 'us_state_goes106',
  parameters: {
    service: 'WMS',
    version: '1.3.0',
    request: 'GetMap',
    format: 'image/png',
    transparent: true,
    crs: 'EPSG:4326',
  },
  credit: 'Iowa State University',
  maximumLevel: 5,
})

// ── 3. 加载全球边界 WMS ─────────────────────────────────────────
const boundariesLayer = new Cesium.WebMapServiceImageryProvider({
  url: 'https://sedac.ciesin.columbia.edu/geoserver/wms',
  layers: 'sdei:world-border',
  parameters: {
    service: 'WMS',
    version: '1.1.0',
    request: 'GetMap',
    format: 'image/png',
    transparent: true,
    SRS: 'EPSG:4326',
    bgcolor: '0x00000000',
  },
  credit: 'SEDAC CIESIN',
  maximumLevel: 6,
})

// ── 初始加载 Blue Marble ───────────────────────────────────────
const wmsLayer = viewer.imageryLayers.addImageryProvider(blueMarble)
console.log('🗺️  已加载 NASA Blue Marble WMS 影像')

// ── 底图切换功能 ───────────────────────────────────────────────
const wmsLayers = [
  { name: 'NASA 火星影像', provider: blueMarble },
  { name: '美国州边界', provider: statesLayer },
  { name: '全球边界', provider: boundariesLayer },
]
let currentWmsIndex = 0

function switchWmsLayer(index: number) {
  viewer.imageryLayers.remove(wmsLayer)
  const newLayer = viewer.imageryLayers.addImageryProvider(wmsLayers[index].provider)
  wmsLayer._imageryProvider = newLayer._imageryProvider
  console.log(\`🔄 切换到底图: \${wmsLayers[index].name}\`)
}

// 每 5 秒自动切换（演示用，实际可绑定 UI 按钮）
setInterval(() => {
  currentWmsIndex = (currentWmsIndex + 1) % wmsLayers.length
  switchWmsLayer(currentWmsIndex)
}, 5000)

// ── 叠加层透明度控制 ────────────────────────────────────────────
// 叠加 Global Boundary 并设置半透明
const boundaryOverlay = viewer.imageryLayers.addImageryProvider(boundariesLayer)
boundaryOverlay.alpha = 0.4
console.log('🌐 全球边界叠加层已添加（透明度 40%）')

// ── 图层顺序控制 ───────────────────────────────────────────────
console.log('📋 当前影像图层数量:', viewer.imageryLayers.length)
console.log('💡 图层顺序: 0=OSM底图, 1=WMS影像, 2=边界叠加层')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(-95, 38, 20000000),
  duration: 2,
  complete: () => console.log('🌍 初始视角: 美国中部'),
})

console.log('💡 WMS 服务需要支持 CORS 和 PNG/GIF 格式')
console.log('🔧 layers 参数指定要加载的图层名称（多个用逗号分隔）')
console.log('⏱️ 通过 clock 时间轴可动态设置 TIME 参数实现时序影像')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['WebMapServiceImageryProvider 配置', 'layers / parameters 参数设置', '时间维度（TIME 参数）支持', '图层透明度与叠加顺序'],
    points: ['WMS GetMap 请求参数通过 parameters 传递', 'transparent=true 需服务端支持 PNG 格式', 'GetCapabilities 探查可用图层'],
  },
}
