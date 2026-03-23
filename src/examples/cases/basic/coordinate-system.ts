import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'coordinate-system',
  title: '坐标系与坐标转换',
  category: '基础操作',
  description: '理解 WGS84 经纬度、笛卡尔空间直角坐标、屏幕像素坐标三套坐标系，掌握它们之间的互相转换方法。',
  tags: ['坐标', 'Cartesian3', 'WGS84'],
  level: 'easy',
  files: {
    'main.ts': `// 坐标系与坐标转换示例
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

// ── 1. 经纬度 → Cartesian3（最常用）──────────
const lon = 121.47, lat = 31.23, alt = 0
const cartesian = Cesium.Cartesian3.fromDegrees(lon, lat, alt)
console.log('📍 上海外滩 经纬度:', lon, lat, alt)
console.log('📐 Cartesian3:', cartesian.x.toFixed(0), cartesian.y.toFixed(0), cartesian.z.toFixed(0))

// ── 2. Cartesian3 → Cartographic（弧度）────────
const cartographic = Cesium.Cartographic.fromCartesian(cartesian)
console.log('🔄 逆转换 Cartographic（弧度）:',
  cartographic.longitude.toFixed(5),
  cartographic.latitude.toFixed(5))
// 转回角度
const lonDeg = Cesium.Math.toDegrees(cartographic.longitude)
const latDeg = Cesium.Math.toDegrees(cartographic.latitude)
console.log('🔄 转回经纬度(°):', lonDeg.toFixed(5), latDeg.toFixed(5))

// ── 3. 点击拾取：屏幕坐标 → 地理坐标 ────────
const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
handler.setInputAction((event) => {
  // 方式 A：拾取 globe 地表点（不含地形高度）
  const ray = viewer.camera.getPickRay(event.position)
  const globePos = viewer.scene.globe.pick(ray, viewer.scene)
  if (globePos) {
    const carto = Cesium.Cartographic.fromCartesian(globePos)
    const pickLon = Cesium.Math.toDegrees(carto.longitude).toFixed(5)
    const pickLat = Cesium.Math.toDegrees(carto.latitude).toFixed(5)
    const pickAlt = carto.height.toFixed(1)
    console.log(\`🖱️ 点击位置: 经度 \${pickLon}° 纬度 \${pickLat}° 高度 \${pickAlt}m\`)

    // 添加标记点
    viewer.entities.removeAll()
    viewer.entities.add({
      position: globePos,
      point: { pixelSize: 10, color: Cesium.Color.RED, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
      label: {
        text: \`(\${pickLon}°, \${pickLat}°)\`,
        font: '13px sans-serif', fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK, outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -14),
      },
    })
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

// ── 4. 初始标记 ────────────────────────────
viewer.entities.add({
  position: cartesian,
  point: { pixelSize: 12, color: Cesium.Color.YELLOW, outlineColor: Cesium.Color.BLACK, outlineWidth: 2 },
  label: {
    text: '上海外滩\\n121.47°, 31.23°',
    font: '13px sans-serif', fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK, outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -14),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(121.47, 31.23, 600000),
  duration: 2,
})

console.log('💡 点击地图任意位置拾取经纬度坐标')
console.log('⚠️  Cesium 内部用弧度，Cartographic.longitude/latitude 是弧度值')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['Cartesian3.fromDegrees 经纬度→世界坐标', 'ellipsoid.cartesianToCartographic 逆转换', 'SceneTransforms 世界坐标→屏幕坐标', '点击拾取地图坐标'],
    points: ['Cesium 内部全程用弧度', 'Cartographic 的 longitude/latitude 是弧度值', '高度单位为米'],
  },
}
