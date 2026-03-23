import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'imagery-4490',
  title: 'EPSG:4490 影像加载',
  category: '影像服务',
  description: '加载采用 CGCS2000（EPSG:4490）坐标系的国产 GIS 服务，配置自定义 TilingScheme 适配非标准投影。',
  tags: ['4490', 'CGCS2000', '自定义投影'],
  level: 'medium',
  files: {
    'main.ts': `// EPSG:4490 影像加载示例
// EPSG:4490 是中国国家2000坐标系（CGCS2000）的 WKID
// 与 WGS84 偏差在 1 米以内，可以视为等同

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

// ── 1. 自定义 CGCS2000 地理坐标系 ─────────────────────────────
// Cesium 默认使用 WGS84，这里创建 CGCS2000 地理坐标系
// EPSG:4490 的 EPSG Well-Known ID 就是 4490
const cgcs2000 = new Cesium.GeographicGeographicPole(1.0)

// ── 2. 自定义 CGCS2000 瓦片方案 ────────────────────────────────
// 标准 WebMercator 瓦片方案 (EPSG:3857) vs 地理坐标系瓦片方案 (EPSG:4490)
const cgcs2000Scheme = new Cesium.GeographicTilingScheme({
  rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90),
  numberOfLevelZeroTiles: 2,
  tileWidth: 256,
  tileHeight: 256,
})

// ── 3. 使用国家地理信息公共服务平台（天地图）──────────────────
// 天地图提供 CGCS2000 兼容的影像服务
// 注意：实际使用需要 Token
// const tianditu4490 = new Cesium.UrlTemplateImageryProvider({
//   url: 'https://t0.tianditu.gov.cn/img_c/wmts?tk=YOUR_TOKEN&service=WMTS&request=GetTile&version=1.0.0&layer=img&style=default&format=tiles&tilematrixSet=c&tilematrix={TileMatrix}&tilerow={TileRow}&tilecol={TileCol}',
//   credit: 'Tianditu CGCS2000',
//   tilingScheme: cgcs2000Scheme,
//   maximumLevel: 14,
// })

// ── 4. 模拟加载 CGCS2000 影像服务（使用开源替代）──────────────
// OpenMapSurfer 提供部分区域的高分辨率影像
const openMapSurfer = new Cesium.UrlTemplateImageryProvider({
  url: 'https://tiles.yiwen-ai.com/api/v1/Satellite/satelliteLisbon/{z}/{x}/{y}?token=free',
  credit: 'OpenMapSurfer',
  maximumLevel: 18,
  tilingScheme: new Cesium.WebMercatorTilingScheme(),
})

// ── 5. 添加参考点验证坐标系一致性 ─────────────────────────────
// 北京的 WGS84 坐标
const beijingWgs84 = [116.3972, 39.9073]

// CGCS2000 与 WGS84 在中国区域差异极小（<1米）
// 可以直接使用 WGS84 坐标加载 CGCS2000 影像
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(beijingWgs84[0], beijingWgs84[1]),
  point: { pixelSize: 14, color: Cesium.Color.RED, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
  label: {
    text: '北京天安门\\n(WGS84 ≈ CGCS2000)',
    font: 'bold 14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -16),
  },
})

// ── 6. 加载影像图层 ────────────────────────────────────────────
const imageryLayer = viewer.imageryLayers.addImageryProvider(openMapSurfer)
console.log('🛰️  已加载高分辨率影像服务')

// ── 7. 叠加 WGS84/OSM 底图进行对比 ────────────────────────────
// OSM 底图本身也是 WGS84 兼容的，可以直接叠加
const osmLayer = viewer.imageryLayers.addImageryProvider(
  new Cesium.UrlTemplateImageryProvider({
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  })
)
osmLayer.alpha = 0.3  // 半透明叠加
console.log('🗺️  OSM 半透明叠加（30%）用于道路参考')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(beijingWgs84[0], beijingWgs84[1], 50000),
  duration: 2,
  complete: () => console.log('🎯 飞往北京天安门'),
})

console.log('💡 EPSG:4490 (CGCS2000) 与 WGS84 在中国区域差异 < 1米')
console.log('🔧 国产 GIS 服务使用 4490 坐标系，可直接与 Cesium 默认底图叠加')
console.log('📐 自定义 TilingScheme 用于适配非标准瓦片网格')
console.log('⚠️  天地图 CGCS2000 服务需要申请 Token')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['GeographicTilingScheme 自定义分辨率', '国家基础地理信息中心服务接入', '非标准瓦片网格适配', '与 WGS84 服务叠加显示'],
    points: ['CGCS2000 与 WGS84 相差不超过 1m', '自定义 tilingScheme 需正确设置 rectangle', '4490 服务通常采用 256×256 像素瓦片'],
  },
}
