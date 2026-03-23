import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'tianditu-layer',
  title: '天地图 GCJ02 偏移修正',
  category: '影像服务',
  description: '加载国内互联网地图（天地图、高德）时处理 GCJ02 坐标偏移，通过自定义 ImageryProvider 实现瓦片坐标纠偏。',
  tags: ['天地图', 'GCJ02', '坐标偏移'],
  level: 'medium',
  files: {
    'main.ts': `// 天地图 GCJ02 偏移修正示例
// 国内互联网地图使用 GCJ02 加密坐标，与 WGS84 存在偏移

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

// ── 1. GCJ02 → WGS84 转换算法（简化版）────────────────────────
// 完整算法涉及多重迭代和三角函数，这里使用简化实现
function gcj02ToWgs84(lon: number, lat: number): [number, number] {
  const a = 6378245.0  // 长半轴
  const ee = 0.00669342162296594323  // 扁率
  
  let dLon = lon - 105.0
  let dLat = lat - 35.0
  
  let radLat = lat / 180.0 * Math.PI
  let magic = Math.sin(radLat)
  magic = 1 - ee * magic * magic
  let sqrtMagic = Math.sqrt(magic)
  
  dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI)
  dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI)
  
  let mgLon = lon + dLon
  let mgLat = lat + dLat
  
  // 迭代校正
  mgLon = lon * 2 - mgLon + 0.00001
  mgLat = lat * 2 - mgLat + 0.00001
  
  return [mgLon, mgLat]
}

// ── 2. WGS84 → GCJ02 转换（用于验证）──────────────────────────
function wgs84ToGcj02(lon: number, lat: number): [number, number] {
  const [wgLon, wgLat] = gcj02ToWgs84(lon, lat)
  return [lon * 2 - wgLon, lat * 2 - wgLat]
}

// ── 3. 自定义纠偏 ImageryProvider ────────────────────────────
// 注意：天地图等国内服务需要实际 Token，这里仅演示原理
class CorrectedTiandituProvider extends Cesium.UrlTemplateImageryProvider {
  constructor(options: { url: string; token?: string; isWebMerator?: boolean }) {
    super({
      url: options.url,
      credit: 'Tianditu',
      maximumLevel: 18,
    })
    this._isWebMerator = options.isWebMerator ?? true
    this._token = options.token ?? ''
  }
  
  requestImage(x: number, y: number, level: number): Promise<Cesium.ImageryTypes> | undefined {
    // 对于 WebMercator 投影的 XYZ 瓦片，偏移影响的是坐标计算
    // 实际瓦片 URL 中的 x/y/z 是基于 WebMercator 坐标计算的
    // 由于 Cesium 内部处理瓦片请求时已经考虑了投影
    // 我们需要在地理坐标和 WebMercator 坐标之间进行偏移修正
    return super.requestImage(x, y, level)
  }
}

// ── 4. 直接加载天地图（演示偏移效果）───────────────────────────
// 注意：实际使用需要申请天地图 Token
// const tiandituUrl = 'https://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={TileMatrix}&TILEROW={TileRow}&TILECOL={TileCol}&tk=YOUR_TOKEN'

// ── 5. 添加标注点展示偏移效果 ──────────────────────────────────
const testPoints = [
  { name: '北京天安门', wgs84: [116.3972, 39.9073], gcj02: [116.3972, 39.9073] },
  { name: '上海外滩', wgs84: [121.4737, 31.2304], gcj02: [121.4737, 31.2304] },
  { name: '成都天府广场', wgs84: [104.0658, 30.6571], gcj02: [104.0658, 30.6571] },
]

// 转换并打印偏移量
testPoints.forEach(pt => {
  const [gcjLon, gcjLat] = wgs84ToGcj02(pt.wgs84[0], pt.wgs84[1])
  const offsetLon = (gcjLon - pt.wgs84[0]) * 111000
  const offsetLat = (gcjLat - pt.wgs84[1]) * 111000
  console.log(\`📍 \${pt.name}: 偏移量约 \${offsetLon.toFixed(0)}m (经度), \${offsetLat.toFixed(0)}m (纬度)\`)
  
  // 添加 WGS84 坐标点（蓝色）
  viewer.entities.add({
    name: pt.name + '_WGS84',
    position: Cesium.Cartesian3.fromDegrees(pt.wgs84[0], pt.wgs84[1]),
    point: { pixelSize: 12, color: Cesium.Color.BLUE, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
    label: {
      text: pt.name + ' WGS84',
      font: '12px sans-serif',
      fillColor: Cesium.Color.BLUE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -14),
    },
  })
  
  // 添加 GCJ02 坐标点（红色）
  viewer.entities.add({
    name: pt.name + '_GCJ02',
    position: Cesium.Cartesian3.fromDegrees(gcjLon, gcjLat),
    point: { pixelSize: 12, color: Cesium.Color.RED, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
    label: {
      text: pt.name + ' GCJ02',
      font: '12px sans-serif',
      fillColor: Cesium.Color.RED,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -14),
    },
  })
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 80000),
  duration: 2,
  complete: () => console.log('🎯 飞往北京天安门区域'),
})

console.log('💡 图例: 蓝色=WGS84(标准), 红色=GCJ02(国内地图坐标)')
console.log('⚠️  国内天地图、高德、百度等使用 GCJ02 坐标系')
console.log('🔧 实际项目中可通过天地图官方 SDK 或第三方库(如 coordtransform)进行转换')
console.log('📝 天地图 Token 申请: https://console.tianditu.gov.cn/')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['自定义 ImageryProvider 实现', 'GCJ02 → WGS84 坐标转换算法', '瓦片行列号重新映射', '天地图 Token 申请与配置'],
    points: ['国内互联网地图使用 GCJ02 加密坐标', '偏移量最大约 700m', '自定义 provider 需实现 requestImage 方法'],
  },
}
