import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'wmts-service',
  title: 'WMTS 瓦片服务',
  category: '影像服务',
  description: '接入 OGC WMTS 标准服务（天地图、ArcGIS 等），配置图层标识、瓦片矩阵集与图像格式。',
  tags: ['WMTS', '天地图', '瓦片'],
  level: 'easy',
  files: {
    'main.ts': `// WMTS 瓦片服务示例
// 演示 WebMapTileServiceImageryProvider 加载 OGC WMTS 标准服务

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

// ── 1. NASA Blue Marble WMTS ────────────────────────────────────
// NASA 提供预切片的 WMTS 服务，适合全球底图
const blueMarbleWmts = new Cesium.WebMapTileServiceImageryProvider({
  url: 'https://planetarymaps.sci.nasa.gov/cgi-bin/mola_wms.pl?LAYERS=Mars_Mola_colorized&FORMAT=image/jpeg&TRANSPARENT=false&HEIGHT=512&WIDTH=512&SRS=EPSG:4326&TILED=true',
  layer: 'Mars_Mola_colorized',
  style: '',
  format: 'image/jpeg',
  tileMatrixSetID: 'EPSG:4326_512',
  maximumLevel: 8,
  credit: 'NASA MOLA',
})

// ── 2. 加载 USGS 美国地形图 WMTS ─────────────────────────────────
// USGS 提供美国地区的地形、影像服务
const usgsTopo = new Cesium.WebMapTileServiceImageryProvider({
  url: 'https://services.nationalmap.gov/arcgis/rest/services/USGS_Topo_US_2D/MapServer/WMTS?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&LAYER=0&STYLE=default&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&FORMAT=image%2Fjpeg',
  layer: '0',
  style: 'default',
  format: 'image/jpeg',
  tileMatrixSetID: 'GoogleMapsCompatible',
  maximumLevel: 12,
  credit: 'USGS National Map',
})

// ── 3. ArcGIS World Imagery WMTS ─────────────────────────────────
// ArcGIS 官方 WMTS 服务，高质量全球卫星影像
const arcWorldImagery = new Cesium.WebMapTileServiceImageryProvider({
  url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS/1.0.0/USATopo_2D/default/GoogleMapsCompatible/{TileMatrix}/{TileRow}/{TileCol}',
  layer: 'USATopo_2D',
  style: 'default',
  format: 'image/jpeg',
  tileMatrixSetID: 'GoogleMapsCompatible',
  maximumLevel: 16,
  credit: 'Esri, USGS, NOAA',
})

// ── 加载 NASA Blue Marble 作为底图 ───────────────────────────────
const wmtsLayer = viewer.imageryLayers.addImageryProvider(blueMarbleWmts)
console.log('🛰️  已加载 NASA MOLA WMTS 影像')

// ── WMTS 切换演示 ───────────────────────────────────────────────
const wmtsSources = [
  { name: 'NASA MOLA 火星地形', provider: blueMarbleWmts },
  { name: 'USGS 美国地形图', provider: usgsTopo },
  { name: 'ArcGIS 全球影像', provider: arcWorldImagery },
]
let currentIndex = 0

function switchWmts(index: number) {
  viewer.imageryLayers.remove(wmtsLayer)
  const newLayer = viewer.imageryLayers.addImageryProvider(wmtsSources[index].provider)
  wmtsLayer._imageryProvider = newLayer._imageryProvider
  console.log(\`🔄 切换 WMTS 源: \${wmtsSources[index].name}\`)
}

// 每 6 秒自动切换
setInterval(() => {
  currentIndex = (currentIndex + 1) % wmtsSources.length
  switchWmts(currentIndex)
}, 6000)

// ── 影像叠加示例 ────────────────────────────────────────────────
const arcOverlay = viewer.imageryLayers.addImageryProvider(arcWorldImagery)
arcOverlay.alpha = 0.3  // 半透明叠加
console.log('🖼️  ArcGIS 影像半透明叠加（30%）')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(0, 20, 25000000),
  duration: 2,
  complete: () => console.log('🌍 初始视角: 全球视图'),
})

console.log('💡 WMTS 优势: 预切片缓存，性能优于动态切图的 WMS')
console.log('🔧 tileMatrixSetID 决定瓦片矩阵组织方式')
console.log('📐 GoogleMapsCompatible = WebMercatorQuad 切片方案')
console.log('⚠️  国内 WMTS 服务存在 GCJ02 偏移问题，需坐标纠偏')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['WebMapTileServiceImageryProvider 配置', '天地图 WMTS 接入示例', 'tileMatrixSetID 矩阵集标识', 'format 指定图像格式'],
    points: ['WMTS 比 WMS 性能更好（预切片）', 'tileMatrixLabels 适配非标准命名', 'REST 风格与 KVP 风格两种请求方式'],
  },
}
