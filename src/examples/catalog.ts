import type { ExampleMeta } from './types'

function placeholder(label: string, lon = 116.39, lat = 39.9, height = 800000): string {
  return `\
// 🚧 占位代码 — 完整实现即将到来
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

viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(${lon}, ${lat}),
  label: {
    text: '${label}',
    font: 'bold 18px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -30),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(${lon}, ${lat}, ${height}),
  duration: 1.5,
})
console.log('📌 ${label} — 完整实现开发中')
`
}

const css = `/* 在此添加自定义样式 */
.cesium-widget-credits { display: none !important; }
`

// ─── 基础操作 ─────────────────────────────────────────────────────────────────

export const viewerInit: ExampleMeta = {
  id: 'viewer-init',
  title: 'Viewer 初始化配置',
  category: '基础操作',
  description: '掌握 Cesium.Viewer 的完整配置项：隐藏 UI 控件、设置默认底图、配置时钟、开启/关闭大气光照，搭建干净的三维场景容器。',
  tags: ['Viewer', '初始化', '配置'],
  level: 'easy',
  files: {
    'main.ts': `// Viewer 初始化配置详解
const viewer = new Cesium.Viewer(container, {
  // ── 底图（使用 OSM，无需 Ion Token）────────────
  baseLayerPicker: false,
  baseLayer: new Cesium.ImageryLayer(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: 'OpenStreetMap contributors',
    })
  ),

  // ── 隐藏默认 UI 控件 ───────────────────────────
  animation: false,            // 动画控件
  timeline: false,             // 时间轴
  geocoder: false,             // 地名搜索
  homeButton: false,           // Home 按钮
  sceneModePicker: false,      // 场景模式切换
  navigationHelpButton: false, // 导航帮助
  fullscreenButton: false,     // 全屏按钮
  infoBox: false,              // 点击弹窗
  selectionIndicator: false,   // 选中高亮框
})

viewerRef.current = viewer

// ── 大气与环境光照 ─────────────────────────────
viewer.scene.skyAtmosphere.show = true      // 大气光晕
viewer.scene.fog.enabled = true             // 地平线雾效
viewer.scene.globe.enableLighting = true    // 日照光照（随时间变化）
viewer.scene.globe.showGroundAtmosphere = true  // 地面大气

// ── 时钟配置 ──────────────────────────────────
viewer.clock.shouldAnimate = true   // 启动时钟（大气光照随之变化）
viewer.clock.multiplier = 1.0       // 1 倍速

// ── requestRenderMode：降低 GPU 占用 ────────────
// 场景静止时暂停渲染，有变化时才重绘
viewer.scene.requestRenderMode = false  // 保持实时渲染（光照动画需要）

// ── 初始视角 ──────────────────────────────────
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 12000000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-90),
    roll: 0,
  },
})

console.log('✅ Viewer 初始化完成')
console.log('🌍 大气光照：已开启（enableLighting = true）')
console.log('⏱️  时钟运行中，multiplier =', viewer.clock.multiplier)
console.log('📍 初始视角：北京上空 12,000 km')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['Viewer 构造参数详解', '隐藏默认 UI 控件', '设置初始视角与底图', '开启场景光照与大气'],
    points: ['imageryProvider 已废弃，改用 baseLayer', 'shouldAnimate=true 启动时钟', 'requestRenderMode 降低 GPU 占用'],
  },
}

export const cameraControl: ExampleMeta = {
  id: 'camera-control',
  title: '相机控制',
  category: '基础操作',
  description: '掌握 Cesium 相机系统：flyTo、lookAt、setView、rotateTo 等常用视角操作，理解相机姿态（heading/pitch/roll）与坐标关系。',
  tags: ['camera', 'flyTo', '视角'],
  level: 'easy',
  files: {
    'main.ts': `// 相机控制示例
const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false,
  animation: false, timeline: false, geocoder: false,
  homeButton: false, sceneModePicker: false,
  navigationHelpButton: false, fullscreenButton: false,
  baseLayer: new Cesium.ImageryLayer(
    new Cesium.UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      credit: 'OpenStreetMap contributors',
    })
  ),
})
viewerRef.current = viewer

// ── 几个重要地点 ──────────────────────────────
const cities = [
  { name: '成都', lon: 104.06, lat: 30.67, color: Cesium.Color.RED },
  { name: '上海', lon: 121.47, lat: 31.23, color: Cesium.Color.YELLOW },
  { name: '广州', lon: 113.26, lat: 23.13, color: Cesium.Color.CYAN },
  { name: '北京', lon: 116.39, lat: 39.9,  color: Cesium.Color.LIME },
]

cities.forEach(({ name, lon, lat, color }) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    point: { pixelSize: 10, color, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
    label: {
      text: name, font: '14px sans-serif',
      fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2, style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -14),
    },
  })
})

// ── 1. flyTo：平滑飞行 ────────────────────────
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(104.06, 30.67, 800000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-45),
    roll: 0,
  },
  duration: 3,
  complete: () => console.log('✅ flyTo 成都完成'),
})

// ── 2. 3 秒后：setView 即时跳转 ───────────────
setTimeout(() => {
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(121.47, 31.23, 500000),
    orientation: {
      heading: Cesium.Math.toRadians(30),
      pitch: Cesium.Math.toRadians(-60),
      roll: 0,
    },
  })
  console.log('⚡ setView 跳转上海（无动画）')
}, 4000)

// ── 3. 6 秒后：flyTo 全国视角 ─────────────────
setTimeout(() => {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(108, 35, 5000000),
    duration: 2,
    complete: () => console.log('🌏 回到全国视角'),
  })
}, 7000)

console.log('🎥 相机控制演示开始...')
console.log('📐 Heading/Pitch/Roll 均用弧度表示')
console.log('🌍 flyTo → setView → flyTo 序列演示中')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['flyTo 平滑飞行动画', 'setView 即时跳转', 'lookAt 围绕目标点旋转', 'screenSpaceCameraController 交互限制'],
    points: ['Heading/Pitch/Roll 用弧度表示', 'camera.position 为 Cartesian3 世界坐标', '飞行 duration=0 等价于 setView'],
  },
}

export const coordinateSystem: ExampleMeta = {
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

export const mouseEvents: ExampleMeta = {
  id: 'mouse-events',
  title: '鼠标事件与拾取',
  category: '基础操作',
  description: '注册鼠标点击、移动、双击事件，通过 scene.pick 拾取实体和地形坐标，实现悬停高亮、点击弹窗等交互。',
  tags: ['事件', '拾取', '交互'],
  level: 'easy',
  files: {
    'main.ts': `// 鼠标事件与拾取示例
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

// ── 添加几个可拾取的实体 ─────────────────────
const points = [
  { name: '天安门', lon: 116.3912, lat: 39.9073, color: Cesium.Color.RED },
  { name: '故宫',   lon: 116.3971, lat: 39.9169, color: Cesium.Color.GOLD },
  { name: '颐和园', lon: 116.2755, lat: 39.9997, color: Cesium.Color.CYAN },
]

const entities = points.map(({ name, lon, lat, color }) =>
  viewer.entities.add({
    name,
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    point: { pixelSize: 14, color, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
    label: {
      text: name, font: 'bold 14px sans-serif',
      fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2, style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -16),
    },
  })
)

let hoveredEntity = null

const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas)

// ── LEFT_CLICK：拾取实体 ───────────────────────
handler.setInputAction((event) => {
  const picked = viewer.scene.pick(event.position)

  if (Cesium.defined(picked) && picked.id) {
    const entity = picked.id
    console.log(\`✅ 点击实体: \${entity.name}\`)

    // 飞行到点击的实体
    viewer.flyTo(entity, { duration: 1.2 })
  } else {
    // 拾取地形坐标
    const ray = viewer.camera.getPickRay(event.position)
    const pos = viewer.scene.globe.pick(ray, viewer.scene)
    if (pos) {
      const carto = Cesium.Cartographic.fromCartesian(pos)
      const lon = Cesium.Math.toDegrees(carto.longitude).toFixed(4)
      const lat = Cesium.Math.toDegrees(carto.latitude).toFixed(4)
      console.log(\`🖱️ 点击地面坐标: \${lon}°, \${lat}°\`)
    }
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

// ── MOUSE_MOVE：悬停高亮 ──────────────────────
handler.setInputAction((event) => {
  // 恢复上一个悬停实体
  if (hoveredEntity) {
    hoveredEntity.point.pixelSize = 14
    hoveredEntity = null
  }

  const picked = viewer.scene.pick(event.endPosition)
  if (Cesium.defined(picked) && picked.id && picked.id.point) {
    hoveredEntity = picked.id
    hoveredEntity.point.pixelSize = 20  // 放大高亮
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

// ── RIGHT_CLICK：drillPick 穿透拾取 ────────────
handler.setInputAction((event) => {
  const picks = viewer.scene.drillPick(event.position)
  if (picks.length > 0) {
    const names = picks
      .filter(p => p.id && p.id.name)
      .map(p => p.id.name)
    console.log(\`📌 drillPick 命中 \${picks.length} 个对象: \${names.join(', ') || '（无命名实体）'}\`)
  } else {
    console.log('🔍 右键：未命中任何实体')
  }
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 50000),
  duration: 2,
})

console.log('💡 操作指南：')
console.log('  左键点击实体 → 飞行定位')
console.log('  左键点击地面 → 拾取坐标')
console.log('  鼠标悬停实体 → 高亮放大')
console.log('  右键点击 → drillPick 穿透拾取')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['ScreenSpaceEventHandler 注册事件', 'scene.pick 拾取实体', 'globe.pick 拾取地形坐标', 'drillPick 穿透拾取多个对象'],
    points: ['pick 返回 undefined 表示未命中', '高性能场景推荐 pickPosition', 'LEFT_CLICK / MOUSE_MOVE / RIGHT_CLICK 类型'],
  },
}

export const sceneMode: ExampleMeta = {
  id: 'scene-mode',
  title: '二三维切换',
  category: '基础操作',
  description: '在三维球、哥伦布视图（2.5D）、二维平面地图三种场景模式之间平滑切换，理解各模式的使用场景。',
  tags: ['二三维', '场景模式', '切换'],
  level: 'easy',
  files: {
    'main.ts': `// 二三维切换示例
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
  // 允许场景模式切换
  scene3DOnly: false,
})
viewerRef.current = viewer

// ── 添加几条中国主要城市连线 ─────────────────────
const coords = [
  [116.39, 39.9],  // 北京
  [121.47, 31.23], // 上海
  [113.26, 23.13], // 广州
  [104.06, 30.67], // 成都
  [106.55, 29.57], // 重庆
]

viewer.entities.add({
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArray(coords.flat()),
    width: 3,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.2,
      color: Cesium.Color.CYAN,
    }),
    clampToGround: false,
  },
})

coords.forEach(([lon, lat]) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    point: { pixelSize: 10, color: Cesium.Color.RED, outlineColor: Cesium.Color.WHITE, outlineWidth: 2 },
  })
})

// ── 模式切换序列 ───────────────────────────────
viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(110, 35, 5000000),
  duration: 2,
  complete: () => {
    console.log('✅ 当前模式: 3D 球体 (SceneMode.SCENE3D)')

    // 2秒后切换到哥伦布视图（2.5D 展开地球）
    setTimeout(() => {
      viewer.scene.morphToColumbusView(2)
      console.log('🗺️  切换到哥伦布视图 (COLUMBUS_VIEW) - 地球展开为平面')
    }, 2500)

    // 6秒后切换到 2D 地图
    setTimeout(() => {
      viewer.scene.morphTo2D(2)
      console.log('📄 切换到 2D 地图 (SCENE2D) - 完全平面，禁用倾斜')
    }, 6000)

    // 10秒后回到 3D
    setTimeout(() => {
      viewer.scene.morphTo3D(2)
      console.log('🌍 回到 3D 球体 (SCENE3D)')
    }, 10000)
  },
})

console.log('🔄 场景模式切换演示（自动播放）：')
console.log('  3D → 哥伦布视图 → 2D → 3D')
console.log('  当前场景模式:', viewer.scene.mode)
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['SceneMode.SCENE3D / SCENE2D / COLUMBUS_VIEW', 'morphTo2D / morphTo3D 动画切换', 'morphTime 控制切换进度', '不同模式下坐标系差异'],
    points: ['COLUMBUS_VIEW 可展开地球表面', '切换时相机位置会自动重算', '2D 模式禁用倾斜视角'],
  },
}

// ─── 影像服务 ─────────────────────────────────────────────────────────────────

export const xyzTiles: ExampleMeta = {
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

export const wmsService: ExampleMeta = {
  id: 'wms-service',
  title: 'WMS 地图服务',
  category: '影像服务',
  description: '对接 OGC WMS 标准服务，配置图层名称、样式、时间维度参数，实现多图层叠加与透明度混合。',
  tags: ['WMS', 'OGC', '地图服务'],
  level: 'easy',
  files: { 'main.ts': placeholder('WMS 地图服务', 116.39, 39.9, 1500000), 'style.css': css },
  guide: {
    features: ['WebMapServiceImageryProvider 配置', 'layers / parameters 参数设置', '时间维度（TIME 参数）支持', '图层透明度与叠加顺序'],
    points: ['WMS GetMap 请求参数通过 parameters 传递', 'transparent=true 需服务端支持 PNG 格式', 'GetCapabilities 探查可用图层'],
  },
}

export const wmtsService: ExampleMeta = {
  id: 'wmts-service',
  title: 'WMTS 瓦片服务',
  category: '影像服务',
  description: '接入 OGC WMTS 标准服务（天地图、ArcGIS 等），配置图层标识、瓦片矩阵集与图像格式。',
  tags: ['WMTS', '天地图', '瓦片'],
  level: 'easy',
  files: { 'main.ts': placeholder('WMTS 瓦片服务', 116.39, 39.9, 1500000), 'style.css': css },
  guide: {
    features: ['WebMapTileServiceImageryProvider 配置', '天地图 WMTS 接入示例', 'tileMatrixSetID 矩阵集标识', 'format 指定图像格式'],
    points: ['WMTS 比 WMS 性能更好（预切片）', 'tileMatrixLabels 适配非标准命名', 'REST 风格与 KVP 风格两种请求方式'],
  },
}

export const tiandituLayer: ExampleMeta = {
  id: 'tianditu-layer',
  title: '天地图 GCJ02 偏移修正',
  category: '影像服务',
  description: '加载国内互联网地图（天地图、高德）时处理 GCJ02 坐标偏移，通过自定义 ImageryProvider 实现瓦片坐标纠偏。',
  tags: ['天地图', 'GCJ02', '坐标偏移'],
  level: 'medium',
  files: { 'main.ts': placeholder('天地图偏移修正', 116.39, 39.9, 1000000), 'style.css': css },
  guide: {
    features: ['自定义 ImageryProvider 实现', 'GCJ02 → WGS84 坐标转换算法', '瓦片行列号重新映射', '天地图 Token 申请与配置'],
    points: ['国内互联网地图使用 GCJ02 加密坐标', '偏移量最大约 700m', '自定义 provider 需实现 requestImage 方法'],
  },
}

export const imagery4490: ExampleMeta = {
  id: 'imagery-4490',
  title: 'EPSG:4490 影像加载',
  category: '影像服务',
  description: '加载采用 CGCS2000（EPSG:4490）坐标系的国产 GIS 服务，配置自定义 TilingScheme 适配非标准投影。',
  tags: ['4490', 'CGCS2000', '自定义投影'],
  level: 'medium',
  files: { 'main.ts': placeholder('4490 影像服务', 116.39, 39.9, 1500000), 'style.css': css },
  guide: {
    features: ['GeographicTilingScheme 自定义分辨率', '国家基础地理信息中心服务接入', '非标准瓦片网格适配', '与 WGS84 服务叠加显示'],
    points: ['CGCS2000 与 WGS84 相差不超过 1m', '自定义 tilingScheme 需正确设置 rectangle', '4490 服务通常采用 256×256 像素瓦片'],
  },
}

export const dynamicImagery: ExampleMeta = {
  id: 'dynamic-imagery',
  title: '动态时序影像',
  category: '影像服务',
  description: '根据时钟时间动态切换影像图层，实现气象、遥感、历史地图等随时间变化的时序影像播放效果。',
  tags: ['时序', '动态影像', '时钟'],
  level: 'medium',
  files: { 'main.ts': placeholder('动态时序影像', 116.39, 39.9, 3000000), 'style.css': css },
  guide: {
    features: ['viewer.clock 时间轴控制', 'imageryLayers.add/remove 动态切换', '时钟事件监听 onTick', '气象雷达回波时序播放'],
    points: ['预加载多个图层可减少闪烁', 'alpha 渐变实现平滑过渡', 'clock.multiplier 控制播放速度'],
  },
}

// ─── 点标注 ───────────────────────────────────────────────────────────────────

export const pixelPoint: ExampleMeta = {
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

export const billboardIcon: ExampleMeta = {
  id: 'billboard-icon',
  title: '图标 Billboard',
  category: '点标注',
  description: '在地图上放置图片图标，支持 Canvas 动态绘制图标、字体图标、AQI 等级气泡图、可拖拽图标等效果。',
  tags: ['Billboard', '图标', '图片'],
  level: 'easy',
  files: {
    'main.ts': `// Billboard 图标示例
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

// ── 用 Canvas 动态绘制各类图标 ─────────────────

// 方式 A：Canvas 绘制彩色圆形图标
function makeCircleIcon(color, size = 48) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const r = size / 2
  // 外圈白色
  ctx.beginPath()
  ctx.arc(r, r, r - 2, 0, Math.PI * 2)
  ctx.fillStyle = 'white'
  ctx.fill()
  // 内圈彩色
  ctx.beginPath()
  ctx.arc(r, r, r - 6, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  return canvas
}

// 方式 B：Canvas 绘制定位图钉图标
function makePinIcon(color, size = 48) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size * 1.4
  const ctx = canvas.getContext('2d')
  const r = size / 2
  const tipY = size * 1.3

  // 圆头
  ctx.beginPath()
  ctx.arc(r, r, r - 2, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 3
  ctx.stroke()

  // 尖尾
  ctx.beginPath()
  ctx.moveTo(r - 10, r + 10)
  ctx.lineTo(r, tipY)
  ctx.lineTo(r + 10, r + 10)
  ctx.fillStyle = color
  ctx.fill()

  // 中心白点
  ctx.beginPath()
  ctx.arc(r, r, 8, 0, Math.PI * 2)
  ctx.fillStyle = 'white'
  ctx.fill()

  return canvas
}

// ── 添加各类 Billboard ──────────────────────────
const pois = [
  { lon: 121.47, lat: 31.23, name: '上海', icon: makePinIcon('#e74c3c') },
  { lon: 116.39, lat: 39.9,  name: '北京', icon: makePinIcon('#3498db') },
  { lon: 113.26, lat: 23.13, name: '广州', icon: makePinIcon('#2ecc71') },
  { lon: 104.06, lat: 30.67, name: '成都', icon: makePinIcon('#f39c12') },
  { lon: 120.15, lat: 30.28, name: '杭州', icon: makeCircleIcon('#9b59b6') },
  { lon: 114.31, lat: 30.52, name: '武汉', icon: makeCircleIcon('#1abc9c') },
]

pois.forEach(({ lon, lat, name, icon }) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    billboard: {
      image: icon,
      width: 40,
      height: 56,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, 0),
      // 近处显示（避免远处叠加混乱）
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 4000000),
      // 缩放随距离变化
      scaleByDistance: new Cesium.NearFarScalar(500000, 1.2, 3000000, 0.6),
    },
    label: {
      text: name, font: 'bold 13px sans-serif',
      fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2, style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -62),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3000000),
    },
  })
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116, 32, 2500000),
  duration: 2,
})

console.log('🗺️  Billboard 图标演示')
console.log('📌 定位图钉：北京/上海/广州/成都（Canvas 绘制）')
console.log('⭕ 圆形图标：杭州/武汉（Canvas 绘制）')
console.log('💡 scaleByDistance 使图标随距离缩放')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['BillboardGraphics 图片图标配置', 'BillboardCollection 批量高性能图标', 'Canvas 动态绘制图标纹理', '字体图标（iconfont）渲染'],
    points: ['image 支持 URL / Canvas / HTMLImageElement', 'sizeInMeters 控制世界空间缩放', 'pixelOffset 精确控制偏移'],
  },
}

export const labelText: ExampleMeta = {
  id: 'label-text',
  title: '文字标注',
  category: '点标注',
  description: '添加文字标注实体，设置字体、颜色、背景、描边，实现文字贴图（静态）和大量 Primitive 文字高性能渲染。',
  tags: ['Label', '文字', '标注'],
  level: 'easy',
  files: { 'main.ts': placeholder('文字标注', 116.39, 39.9, 300000), 'style.css': css },
  guide: {
    features: ['LabelGraphics 配置字体与样式', 'LabelCollection 批量高性能文字', '文字贴图（Canvas 转 Billboard）', '大量文字 Primitive 渲染'],
    points: ['LabelCollection 内部生成纹理图集', '文字贴图适合静态标注（性能更好）', 'backgroundPadding 控制背景边距'],
  },
}

export const divMarker: ExampleMeta = {
  id: 'div-marker',
  title: 'DIV 图标点',
  category: '点标注',
  description: '将 HTML DOM 元素（DIV）与地理坐标同步，实现富文本弹窗、自定义 HTML 样式的信息标牌。',
  tags: ['DIV', 'HTML', '弹窗'],
  level: 'medium',
  files: { 'main.ts': placeholder('DIV 图标点', 116.39, 39.9, 200000), 'style.css': css },
  guide: {
    features: ['SceneTransforms 世界坐标→屏幕坐标', 'preRender 事件同步 DOM 位置', 'CSS 自定义弹窗样式', '遮挡检测（点在球背面时隐藏）'],
    points: ['DOM 同步需在 preRender/postRender 中执行', '大量 DIV 标注性能差，超过 100 个需考虑替代方案', '鼠标事件需阻止冒泡避免干扰地图'],
  },
}

export const panoramaPoint: ExampleMeta = {
  id: 'panorama-point',
  title: '全景点展示',
  category: '点标注',
  description: '在 Cesium 场景中嵌入全景图片，点击地图上的标记点进入 360° 全景浏览模式，实现地理场景与全景的无缝切换。',
  tags: ['全景', '360°', 'VR'],
  level: 'medium',
  files: { 'main.ts': placeholder('全景点展示', 121.47, 31.23, 100), 'style.css': css },
  guide: {
    features: ['自定义全景查看器', '点击标注进入全景', '全景←→三维场景切换', '热点标注（链接到其他全景点）'],
    points: ['全景图使用等距柱状投影（Equirectangular）', '球形全景可用 Three.js SphereGeometry 实现', '切换时注意相机位置同步'],
  },
}

export const clusterPoints: ExampleMeta = {
  id: 'cluster-points',
  title: '海量点聚合',
  category: '点标注',
  description: '对大量 POI 点数据启用自动聚合（Cluster），自定义聚合气泡样式，随缩放级别动态展开/收缩。',
  tags: ['聚合', '海量点', 'POI'],
  level: 'medium',
  files: { 'main.ts': placeholder('点聚合', 116.39, 39.9, 400000), 'style.css': css },
  guide: {
    features: ['dataSource.clustering.enabled 开启聚合', 'clusterEvent 自定义聚合图标', 'Canvas 绘制动态聚合气泡', 'pixelRange 聚合半径控制'],
    points: ['minimumClusterSize 最小聚合数量', '聚合图标推荐用 Billboard', 'KDBush 空间索引加速大数据量'],
  },
}

export const draggablePoint: ExampleMeta = {
  id: 'draggable-point',
  title: '可拖拽标注',
  category: '点标注',
  description: '实现可通过鼠标拖拽移动位置的地图标注，获取拖拽后的实时坐标，适用于标注编辑、位置调整等场景。',
  tags: ['拖拽', '交互', '编辑'],
  level: 'medium',
  files: { 'main.ts': placeholder('可拖拽标注', 116.39, 39.9, 300000), 'style.css': css },
  guide: {
    features: ['MOUSE_DOWN 开始拖拽', 'MOUSE_MOVE 更新坐标', 'MOUSE_UP 结束拖拽', 'CallbackProperty 实时更新位置'],
    points: ['拖拽过程中禁用相机控制器', 'globe.pick 获取拖拽目标地形坐标', 'CallbackProperty 比直接修改 position 更高效'],
  },
}

// ─── 线与路径 ─────────────────────────────────────────────────────────────────

export const polylineBasic: ExampleMeta = {
  id: 'polyline-basic',
  title: '折线基础',
  category: '线与路径',
  description: '绘制各类折线：普通折线、贴地折线、发光线、虚线、箭头线，对比 Entity 与 Primitive 两种渲染方式。',
  tags: ['折线', 'PolylineGraphics', 'Primitive'],
  level: 'easy',
  files: { 'main.ts': placeholder('折线基础', 116.39, 39.9, 500000), 'style.css': css },
  guide: {
    features: ['PolylineGraphics 折线配置', 'PolylinePrimitive 高性能折线', '贴地折线 clampToGround', 'PolylineDash / PolylineGlow / PolylineArrow 材质'],
    points: ['大量折线改用 GeometryInstance + Primitive 批量渲染', 'clampToGround 只对地表有效', '箭头密度由 material.repeat 控制'],
  },
}

export const curvedLine: ExampleMeta = {
  id: 'curved-line',
  title: '曲线与 OD 弧线',
  category: '线与路径',
  description: '生成平滑贝塞尔曲线和抛物线弧线，用于展示城市间的 OD（起终点）流量，实现迁徙地图效果。',
  tags: ['曲线', 'OD线', '迁徙'],
  level: 'medium',
  files: { 'main.ts': placeholder('曲线 OD 弧线', 116.39, 39.9, 2000000), 'style.css': css },
  guide: {
    features: ['贝塞尔曲线采样点计算', '抛物线弧高度公式', 'SampledPositionProperty 弧线动画', 'OD 流量粗细编码'],
    points: ['弧线采样点越多越平滑（推荐 100 个点）', 'OD 宽度可按流量归一化', '大量 OD 线改用 Primitive 批量渲染'],
  },
}

export const pipeLine: ExampleMeta = {
  id: 'pipe-line',
  title: '管道线',
  category: '线与路径',
  description: '渲染具有截面形状的三维管道，支持圆形、方形截面，可添加流动纹理模拟液体/气体传输效果。',
  tags: ['管道', '走廊', 'Corridor'],
  level: 'medium',
  files: { 'main.ts': placeholder('管道线', 116.39, 39.9, 100000), 'style.css': css },
  guide: {
    features: ['CorridorGraphics 走廊（矩形截面）', 'PolylineVolumeGraphics 管道（圆形截面）', '流动纹理 UV 动画', '管道高度与地形融合'],
    points: ['PolylineVolume shape 定义截面多边形', 'Corridor 性能更好（无截面旋转）', '流动效果通过 CallbackProperty 驱动'],
  },
}

export const migrationEffect: ExampleMeta = {
  id: 'migration-effect',
  title: '迁徙流动效果',
  category: '线与路径',
  description: '实现城市间人口迁徙、货物流动的动态弧线效果，粒子沿弧线运动，线宽表达流量强度。',
  tags: ['迁徙', '流动', '粒子'],
  level: 'medium',
  files: { 'main.ts': placeholder('迁徙流动', 116.39, 39.9, 3000000), 'style.css': css },
  guide: {
    features: ['弧线粒子动画系统', '流量驱动线宽编码', '颜色渐变表达方向', '起终点图标联动'],
    points: ['粒子沿弧线的参数化方程计算位置', '流量归一化后映射到 1-5px 宽度', '大量流线时限制同时显示的粒子数'],
  },
}

export const flightPath: ExampleMeta = {
  id: 'flight-path',
  title: '飞行路径与模型跟踪',
  category: '线与路径',
  description: '沿预设路径平滑飞行的三维模型：自动朝向速度方向、尾迹线实时绘制、相机锁定跟随目标。',
  tags: ['飞行路径', '模型跟踪', 'CZML'],
  level: 'medium',
  files: { 'main.ts': placeholder('飞行路径跟踪', 116.39, 39.9, 100000), 'style.css': css },
  guide: {
    features: ['SampledPositionProperty 路径插值', 'VelocityOrientationProperty 速度朝向', 'viewer.trackedEntity 相机跟随', 'PathGraphics 轨迹尾线'],
    points: ['LAGRANGE 插值比 LINEAR 更平滑', 'trackedEntity 锁定相机视角', 'PathGraphics.trailTime 控制尾线长度'],
  },
}

export const roamingRoute: ExampleMeta = {
  id: 'roaming-route',
  title: '漫游路线（室内/空中）',
  category: '线与路径',
  description: '沿关键帧路径平滑漫游：室内建筑穿行、空中无人机巡航、战机绕圈轨迹，支持第一视角与跟踪视角切换。',
  tags: ['漫游', '室内', '无人机'],
  level: 'medium',
  files: { 'main.ts': placeholder('漫游路线', 121.47, 31.23, 200), 'style.css': css },
  guide: {
    features: ['关键帧路径 CatmullRom 插值', '第一视角相机绑定', '室内坐标系建立', '漫游速度与时间轴联动'],
    points: ['室内漫游需要精确的建筑模型坐标', 'CatmullRom 插值路径更自然', '需禁用默认相机控制器'],
  },
}

export const roadNetwork: ExampleMeta = {
  id: 'road-network',
  title: '道路与电力线',
  category: '线与路径',
  description: '绘制城市路网和高压电力线：公交线路 OD 可视化、电力线自动计算弧垂、北京公交线路数据展示。',
  tags: ['道路', '电力线', '路网'],
  level: 'medium',
  files: { 'main.ts': placeholder('道路电力线', 116.39, 39.9, 50000), 'style.css': css },
  guide: {
    features: ['GeoJSON 路网数据加载', '高压电线弧垂自动计算', '公交 OD 线可视化', '路网按等级分层着色'],
    points: ['弧垂公式：中点高度 = 两端高度均值 - 弧垂值', 'OD 线宽度可按客流量归一化', '路网数据建议使用 Primitive 批量渲染'],
  },
}

// ─── 面与几何体 ───────────────────────────────────────────────────────────────

export const polygonFace: ExampleMeta = {
  id: 'polygon-face',
  title: '多边形面',
  category: '面与几何体',
  description: '绘制各类多边形：普通多边形、孔洞多边形、贴地多边形、挤出建筑体，对比 Entity 与 Primitive 批量渲染。',
  tags: ['多边形', 'PolygonGraphics', 'Primitive'],
  level: 'easy',
  files: { 'main.ts': placeholder('多边形面', 116.39, 39.9, 300000), 'style.css': css },
  guide: {
    features: ['PolygonGraphics 多边形配置', 'PolygonHierarchy 孔洞多边形', 'extrudedHeight 挤出高度（建筑体）', 'Primitive 批量合并渲染'],
    points: ['孔洞多边形节点需逆时针', 'extrudedHeight 从地面挤出', 'PerInstanceColorAppearance 每实例着色'],
  },
}

export const rectangleCircle: ExampleMeta = {
  id: 'rectangle-circle',
  title: '矩形、圆与扇形',
  category: '面与几何体',
  description: '绘制矩形、圆形、椭圆、扇形等规则几何面，支持贴地、挤出、旋转等属性，配合 Primitive 实现大量渲染。',
  tags: ['矩形', '圆形', '扇形'],
  level: 'easy',
  files: { 'main.ts': placeholder('矩形圆形扇形', 116.39, 39.9, 500000), 'style.css': css },
  guide: {
    features: ['RectangleGraphics 矩形', 'EllipseGraphics 圆/椭圆', '扇形（startAngle/stopAngle）', '正多边形近似圆形'],
    points: ['EllipseGraphics semiMajorAxis/semiMinorAxis 半轴（米）', '扇形通过限制角度范围实现', 'rotation 属性可旋转矩形'],
  },
}

export const wallGeometry: ExampleMeta = {
  id: 'wall-geometry',
  title: '墙与扩散墙',
  category: '面与几何体',
  description: '绘制垂直墙体、扩散墙（从中心向外展开）、走马灯墙（纹理流动），常用于围栏、防线、区域边界可视化。',
  tags: ['墙', '扩散墙', '走马灯'],
  level: 'medium',
  files: { 'main.ts': placeholder('墙与扩散墙', 116.39, 39.9, 100000), 'style.css': css },
  guide: {
    features: ['WallGraphics 墙体绘制', '扩散墙 CustomShader 实现', '走马灯纹理 UV 动画', '墙体高度随地形变化'],
    points: ['WallGraphics minimumHeights/maximumHeights 控制上下边', '扩散墙通过 time 驱动展开比例', '走马灯效果修改 UV 偏移量'],
  },
}

export const box3D: ExampleMeta = {
  id: 'box-3d',
  title: '立体盒子与圆锥',
  category: '面与几何体',
  description: '绘制三维盒子、圆锥、四棱锥、光锥等立体几何体，展示统计柱状图（圆锥/盒子编码数值）应用场景。',
  tags: ['盒子', '圆锥', '立体几何'],
  level: 'easy',
  files: { 'main.ts': placeholder('立体盒子圆锥', 116.39, 39.9, 200000), 'style.css': css },
  guide: {
    features: ['BoxGraphics 盒子', 'CylinderGraphics 圆柱/圆锥', '四棱锥（自定义 Geometry）', '圆锥追踪体动画'],
    points: ['CylinderGraphics topRadius=0 即为圆锥', '立体几何可用于统计图表', 'Primitive 合并渲染 10000+ 个几何体'],
  },
}

export const sphere3D: ExampleMeta = {
  id: 'sphere-3d',
  title: '球、半球与椭球',
  category: '面与几何体',
  description: '绘制球体、半球（雷达探测范围）、椭球等弧面几何体，实现多种尺寸与颜色的批量渲染。',
  tags: ['球体', '半球', '椭球'],
  level: 'easy',
  files: { 'main.ts': placeholder('球半球椭球', 116.39, 39.9, 300000), 'style.css': css },
  guide: {
    features: ['EllipsoidGraphics 椭球/球体', '半球（cutoutRectangle）', '批量球体 Primitive 合并渲染', '球体作为雷达探测范围'],
    points: ['EllipsoidGraphics 三轴半径控制形状', '半球通过 minimumClock/maximumClock 裁剪', 'Primitive 合并球体显著降低 DrawCall'],
  },
}

export const militarySymbol: ExampleMeta = {
  id: 'military-symbol',
  title: '军标符号',
  category: '面与几何体',
  description: '绘制军事标图符号：点状军标、线面军标（箭头方向）、标号库查询，支持军标时序动画播放。',
  tags: ['军标', '标图', '符号库'],
  level: 'hard',
  files: { 'main.ts': placeholder('军标符号', 116.39, 39.9, 500000), 'style.css': css },
  guide: {
    features: ['点状军标（PointCollection）', '线面军标（自行扩展算法）', '标号库数据库查询', '军标时序动画'],
    points: ['军标符号库遵循 MIL-STD-2525 标准', '箭头方向由向量方向决定', '复杂军标可用 Canvas 预渲染为图片'],
  },
}

// ─── 矢量数据 ─────────────────────────────────────────────────────────────────

export const geojsonLoader: ExampleMeta = {
  id: 'geojson-loader',
  title: 'GeoJSON 加载与样式',
  category: '矢量数据',
  description: '加载 GeoJSON 格式矢量数据，按属性字段动态设置颜色映射与图标样式，实现点击弹窗信息展示。',
  tags: ['GeoJSON', '矢量数据', '样式'],
  level: 'easy',
  files: { 'main.ts': placeholder('GeoJSON 加载', 108, 35, 3000000), 'style.css': css },
  guide: {
    features: ['GeoJsonDataSource.load 加载数据', '按属性字段条件着色', '点击实体显示 infoBox', 'entities.values 遍历要素'],
    points: ['DataSource 是批量实体的容器', 'styleFunction 实现属性驱动渲染', 'stroke/fill 控制边框与填充'],
  },
}

export const kmlLoader: ExampleMeta = {
  id: 'kml-loader',
  title: 'KML / KMZ 加载',
  category: '矢量数据',
  description: '加载 KML 和 KMZ 格式地理标注文件，保留原始样式与弹窗描述，支持网络链接（NetworkLink）动态更新。',
  tags: ['KML', 'KMZ', '地标'],
  level: 'easy',
  files: { 'main.ts': placeholder('KML 加载', 116.39, 39.9, 1000000), 'style.css': css },
  guide: {
    features: ['KmlDataSource.load 加载 KML/KMZ', 'NetworkLink 动态更新支持', '原生 KML 样式保留', 'Google Earth 兼容性'],
    points: ['KMZ 是 KML 的压缩版（ZIP 格式）', 'NetworkLink 实现服务端推送数据', 'KML 描述支持 HTML 富文本'],
  },
}

export const czmlAnimation: ExampleMeta = {
  id: 'czml-animation',
  title: 'CZML 时序动画',
  category: '矢量数据',
  description: '使用 CZML 格式描述随时间变化的地理要素，结合 Cesium 时间轴实现运动轨迹回放、属性插值动画。',
  tags: ['CZML', '时序', '动画'],
  level: 'medium',
  files: { 'main.ts': placeholder('CZML 动画', 116.39, 39.9, 1000000), 'style.css': css },
  guide: {
    features: ['CzmlDataSource.load 加载 CZML', 'SampledPositionProperty 位置采样插值', 'viewer.clock 控制时间播放', 'VelocityOrientationProperty 自动朝向'],
    points: ['CZML 是 JSON 超集，支持时间窗口', 'interpolationAlgorithm 控制插值精度', 'multiplier 调节播放倍速'],
  },
}

export const wfsQuery: ExampleMeta = {
  id: 'wfs-query',
  title: '矢量服务查询（WFS）',
  category: '矢量数据',
  description: '对接 ArcGIS Server、GeoServer、iServer 的 WFS 矢量服务，按范围/属性条件查询要素并在地图上可视化。',
  tags: ['WFS', 'ArcGIS', 'GeoServer'],
  level: 'medium',
  files: { 'main.ts': placeholder('WFS 矢量服务查询', 116.39, 39.9, 500000), 'style.css': css },
  guide: {
    features: ['WFS GetFeature 请求构建', 'CQL_FILTER 属性条件过滤', 'BBOX 空间范围查询', 'ArcGIS REST API 要素查询'],
    points: ['WFS 返回 GeoJSON/GML 格式', 'ArcGIS 使用 FeatureServer 的 query 接口', 'iServer 的 getFeature 接口参数格式不同'],
  },
}

export const routePlanning: ExampleMeta = {
  id: 'route-planning',
  title: '路径规划查询',
  category: '矢量数据',
  description: '调用在线路径规划 API（高德/百度/OSM）获取驾车、步行、骑行路径，在三维地图上可视化规划结果。',
  tags: ['路径规划', '导航', 'API'],
  level: 'medium',
  files: { 'main.ts': placeholder('路径规划查询', 116.39, 39.9, 100000), 'style.css': css },
  guide: {
    features: ['高德/百度路径规划 REST API', '路径 GeoJSON 解析与渲染', 'POI 点查询与标注', '多条路径对比展示'],
    points: ['路径规划 API 返回 GCJ02 坐标需纠偏', 'Polyline 绑定路径属性（距离/时间）', '转弯点可额外标注方向指示'],
  },
}

export const primitiveVector: ExampleMeta = {
  id: 'primitive-vector',
  title: 'Primitive 高性能渲染',
  category: '矢量数据',
  description: '使用底层 Primitive API 批量渲染数万个几何体，对比 Entity API 性能差异，掌握 InstancedRendering 技术。',
  tags: ['Primitive', '性能', '批量渲染'],
  level: 'hard',
  files: { 'main.ts': placeholder('Primitive 高性能', 116.39, 39.9, 500000), 'style.css': css },
  guide: {
    features: ['GeometryInstance + Primitive 批量渲染', 'InstancedRendering 减少 DrawCall', 'Appearance 自定义着色', 'allowPicking 关闭拾取提升性能'],
    points: ['Primitive 比 Entity 性能高 10x 以上', '共享 Appearance 可合并 DrawCall', 'PerInstanceColorAppearance 支持每实例着色'],
  },
}

// ─── 地形分析 ─────────────────────────────────────────────────────────────────

export const terrainBasic: ExampleMeta = {
  id: 'terrain-basic',
  title: '地形加载与夸张',
  category: '地形分析',
  description: '加载全球高精度地形，启用地形深度检测，通过 terrainExaggeration 放大地形起伏，突出山地视觉效果。',
  tags: ['地形', '高程', 'DEM'],
  level: 'easy',
  files: { 'main.ts': placeholder('地形加载夸张', 86.92, 27.98, 30000), 'style.css': css },
  guide: {
    features: ['CesiumTerrainProvider.fromUrl 加载地形', 'terrainExaggeration 地形夸张系数', 'depthTestAgainstTerrain 地形遮挡', 'sampleTerrainMostDetailed 高程采样'],
    points: ['地形数据按 LOD 流式加载', 'terrainExaggeration 推荐 1.5-3 倍', '高程采样是异步操作（返回 Promise）'],
  },
}

export const terrainExcavation: ExampleMeta = {
  id: 'terrain-excavation',
  title: '地形开挖',
  category: '地形分析',
  description: '在指定区域对地形进行开挖展示，暴露地下截面，支持 ClippingPlanes 方式和 Planes 方式两种实现。',
  tags: ['地形开挖', '裁剪', 'ClippingPlanes'],
  level: 'hard',
  files: { 'main.ts': placeholder('地形开挖', 116.39, 39.9, 20000), 'style.css': css },
  guide: {
    features: ['ClippingPlaneCollection 地形裁剪', 'Planes 方式多面体开挖', '开挖截面纹理贴图', '与建筑模型联合裁剪'],
    points: ['Globe 和 tileset 分别设置裁剪面', 'softness 参数控制裁剪边缘羽化', '裁剪平面需在地球固连坐标系下定义'],
  },
}

export const terrainFlattening: ExampleMeta = {
  id: 'terrain-flattening',
  title: '地形压平与抬升',
  category: '地形分析',
  description: '将指定区域的地形压平至指定高度，或将局部地形整体抬升，常用于建筑选址、工程规划场景。',
  tags: ['地形压平', '地形抬升', 'CustomShader'],
  level: 'hard',
  files: { 'main.ts': placeholder('地形压平抬升', 116.39, 39.9, 50000), 'style.css': css },
  guide: {
    features: ['Globe.clippingPlanes 压平区域定义', 'CustomShader 修改顶点高度', '压平区域多边形边界', '高度渐变过渡效果'],
    points: ['地形压平通过替换高程值实现', '边界区域需做平滑插值过渡', '压平后建筑物与地形能无缝贴合'],
  },
}

export const contourLine: ExampleMeta = {
  id: 'contour-line',
  title: '等高线',
  category: '地形分析',
  description: '在地形表面叠加等高线渲染效果，通过 Material 着色器按高程值绘制等高线，支持自定义间距与颜色。',
  tags: ['等高线', '地形材质', 'Material'],
  level: 'medium',
  files: { 'main.ts': placeholder('等高线', 102, 30, 100000), 'style.css': css },
  guide: {
    features: ['ElevationContourMaterial 等高线材质', 'ContourLineSpacing 等高距设置', '坡度渐变色斑图叠加', '高程数值标注'],
    points: ['Cesium 内置 ElevationContourMaterial', 'spacing 单位为米', '等高线与坡度图可叠加显示'],
  },
}

export const slopeAnalysis: ExampleMeta = {
  id: 'slope-analysis',
  title: '坡度坡向分析',
  category: '地形分析',
  description: '基于 DEM 地形数据计算地表坡度和坡向，用分级色斑图渲染坡度分布，辅助地质灾害评估与规划选址。',
  tags: ['坡度', '坡向', 'DEM'],
  level: 'hard',
  files: { 'main.ts': placeholder('坡度坡向分析', 102, 25, 200000), 'style.css': css },
  guide: {
    features: ['sampleTerrainMostDetailed 密集采样', '相邻点高差计算坡度', '分级色阶映射坡度值', '坡向箭头可视化'],
    points: ['采样网格越密精度越高但耗时越长', '坡度单位为度（°）或百分比（%）', '坡向 0° 为正北，顺时针增大'],
  },
}

export const floodAnalysis: ExampleMeta = {
  id: 'flood-analysis',
  title: '淹没分析',
  category: '地形分析',
  description: '模拟洪水淹没过程：设置初始水位动态升高水面，结合地形计算淹没范围，支持矢量面边界限定淹没区域。',
  tags: ['淹没', '水位', '地形分析'],
  level: 'hard',
  files: { 'main.ts': placeholder('淹没分析', 110, 30, 50000), 'style.css': css },
  guide: {
    features: ['动态水面 Polygon 高度插值', '地形高程采样判断淹没区域', 'WaterMaterialProperty 水面材质', '矢量面限定淹没边界'],
    points: ['水面需大量高程采样点才准确', 'sampleTerrainMostDetailed 异步采样', '水面材质可配置波浪频率与振幅'],
  },
}

export const undergroundMode: ExampleMeta = {
  id: 'underground-mode',
  title: '地表透明（地下模式）',
  category: '地形分析',
  description: '将地球表面设为半透明，露出地下管网、隧道等地下设施，实现"透视地球"的地下空间可视化效果。',
  tags: ['地下模式', '透明', '地下管网'],
  level: 'medium',
  files: { 'main.ts': placeholder('地表透明地下模式', 116.39, 39.9, 5000), 'style.css': css },
  guide: {
    features: ['globe.translucency 地球透明度', 'globe.undergroundColor 地下填充色', 'cameraUnderground 地下相机支持', '地下管线模型加载'],
    points: ['translucency.enabled=true 开启透明模式', 'frontFaceAlpha 控制正面透明度', '地下模式需关闭 depthTestAgainstTerrain'],
  },
}

// ─── 3D Tiles ─────────────────────────────────────────────────────────────────

export const tilesBasic: ExampleMeta = {
  id: '3dtiles-basic',
  title: '3D Tiles 基础加载',
  category: '3D Tiles',
  description: '加载 3D Tiles 格式数据集（建筑、点云、倾斜摄影），调节最大屏幕空间误差（SSE）平衡精度与性能。',
  tags: ['3DTiles', '倾斜摄影', '点云'],
  level: 'easy',
  files: { 'main.ts': placeholder('3D Tiles 加载', 121.47, 31.23, 500000), 'style.css': css },
  guide: {
    features: ['Cesium3DTileset.fromUrl 加载瓦片集', 'maximumScreenSpaceError 细节层次控制', 'Cesium3DTileStyle 样式表达式', 'show/hide 瓦片集显隐'],
    points: ['3D Tiles 按视野流式加载', 'SSE 越小精度越高但性能越差', 'debugShowBoundingVolume 辅助调试'],
  },
}

export const tilesOffset: ExampleMeta = {
  id: '3dtiles-offset',
  title: '3D Tiles 位置偏移纠正',
  category: '3D Tiles',
  description: '修正 3D Tiles 数据集因坐标基准差异造成的位置偏移，通过矩阵变换将数据对齐到正确地理位置。',
  tags: ['3DTiles', '偏移', '坐标纠正'],
  level: 'medium',
  files: { 'main.ts': placeholder('3DTiles 偏移纠正', 121.47, 31.23, 200), 'style.css': css },
  guide: {
    features: ['tileset.modelMatrix 变换矩阵修改', 'Transforms.eastNorthUpToFixedFrame 局部坐标系', 'Matrix4.multiplyByTranslation 平移', 'HeadingPitchRoll 旋转对齐'],
    points: ['modelMatrix 直接修改 4×4 变换矩阵', '偏移量需在本地坐标系（ENU）下计算', '可通过 GUI 实时调节偏移参数'],
  },
}

export const tilesStyle: ExampleMeta = {
  id: '3dtiles-style',
  title: '3D Tiles 样式与属性查询',
  category: '3D Tiles',
  description: '使用 3D Tiles Styling 语言按属性字段条件着色，点击建筑物查询属性信息，实现分类渲染与数据联动。',
  tags: ['3DTiles', '样式', '属性查询'],
  level: 'medium',
  files: { 'main.ts': placeholder('3DTiles 样式查询', 114.06, 22.54, 1000), 'style.css': css },
  guide: {
    features: ['Cesium3DTileStyle 条件表达式', 'feature.getProperty 获取属性值', '按楼层/用途分类着色', '点击高亮选中建筑'],
    points: ['style.color 支持 JavaScript 表达式', 'feature 对象在 3DTILES_INSPECTOR 可查', 'conditions 数组按优先级匹配'],
  },
}

export const tilesCustomShader: ExampleMeta = {
  id: '3dtiles-custom-shader',
  title: '3D Tiles CustomShader',
  category: '3D Tiles',
  description: '为 3D Tiles 数据集编写自定义 GLSL 着色器，实现扫描线、泛光、UV 动画等高级渲染效果。',
  tags: ['CustomShader', 'GLSL', '着色器'],
  level: 'hard',
  files: { 'main.ts': placeholder('3DTiles CustomShader', 121.47, 31.23, 500), 'style.css': css },
  guide: {
    features: ['CustomShader API 编写 GLSL', 'fragmentShaderText 片元着色器', 'uniformMap 传入 uniform 变量', '时间驱动的动态效果'],
    points: ['CustomShader 替换内置 PBR 着色器', 'czm_material 结构体控制输出', 'uniform 更新需在 render loop 中设置'],
  },
}

export const tilesFlattening: ExampleMeta = {
  id: '3dtiles-flattening',
  title: '3D Tiles 模型压平',
  category: '3D Tiles',
  description: '通过裁剪平面或 CustomShader 将指定区域的 3D Tiles 建筑物压平到地面，用于规划方案对比展示。',
  tags: ['3DTiles', '压平', '裁剪'],
  level: 'hard',
  files: { 'main.ts': placeholder('3DTiles 模型压平', 116.39, 39.9, 5000), 'style.css': css },
  guide: {
    features: ['ClippingPlaneCollection 裁剪平面', 'CustomShader 实现高度压缩', '区域选择与压平联动', '压平过渡动画'],
    points: ['裁剪平面坐标系为瓦片集本地坐标', 'unionClippingRegions 控制内/外裁剪', '压平效果可与地形无缝融合'],
  },
}

// ─── 空间分析 ─────────────────────────────────────────────────────────────────

export const distanceMeasure: ExampleMeta = {
  id: 'distance-measure',
  title: '距离与面积量算',
  category: '空间分析',
  description: '点击地图绘制折线/多边形，实时计算段距离、总长度和多边形面积，支持贴地模式与三维空间量算。',
  tags: ['测量', '距离', '面积'],
  level: 'medium',
  files: { 'main.ts': placeholder('距离面积量算', 116.39, 39.9, 500000), 'style.css': css },
  guide: {
    features: ['ScreenSpaceEventHandler 鼠标拾取', 'EllipsoidGeodesic 大地线距离', '球面面积公式', '动态折线/多边形绘制'],
    points: ['globe.pick 拾取地形表面坐标', 'EllipsoidGeodesic 考虑地球曲率', '大于 100km 时曲率误差显著'],
  },
}

export const viewshedAnalysis: ExampleMeta = {
  id: 'viewshed-analysis',
  title: '可视域分析',
  category: '空间分析',
  description: '从指定观察点分析周围区域的可见性，将可见区域标注为绿色、遮挡区域标注为红色，辅助选址规划。',
  tags: ['视域', '可视分析', '阴影贴图'],
  level: 'hard',
  files: { 'main.ts': placeholder('可视域分析', 116.39, 40.1, 50000), 'style.css': css },
  guide: {
    features: ['Shadow Map 阴影贴图实现可视域', '射线投射（Ray Casting）遮挡检测', '可视域渐变色渲染', '动态调节观察角度与距离'],
    points: ['视域分析本质是阴影贴图的变体', '地形分辨率影响分析精度', '大范围分析需 WebWorker 分帧计算'],
  },
}

export const sunshineAnalysis: ExampleMeta = {
  id: 'sunshine-analysis',
  title: '日照分析',
  category: '空间分析',
  description: '模拟任意日期时刻的太阳位置与建筑阴影，计算指定区域的日照时长，用于建筑规划日照评估。',
  tags: ['日照', '阴影', '太阳'],
  level: 'hard',
  files: { 'main.ts': placeholder('日照分析', 121.47, 31.23, 1000), 'style.css': css },
  guide: {
    features: ['scene.shadows 全局阴影开启', 'JulianDate 设置模拟时刻', 'viewer.clock 控制时间推进', 'Simon1994PlanetaryPositions 太阳位置'],
    points: ['shadows 开启会显著降低渲染性能', '软阴影（softShadows）需 WebGL2', '日照时长需逐小时采样计算'],
  },
}

export const bufferAnalysis: ExampleMeta = {
  id: 'buffer-analysis',
  title: '缓冲区分析',
  category: '空间分析',
  description: '对点、线、面要素生成指定半径的缓冲区，用于分析影响范围、服务覆盖区域、安全隔离带等空间关系。',
  tags: ['缓冲区', '空间分析', 'Turf.js'],
  level: 'medium',
  files: { 'main.ts': placeholder('缓冲区分析', 116.39, 39.9, 200000), 'style.css': css },
  guide: {
    features: ['Turf.js buffer 缓冲区计算', '点缓冲（圆形）/ 线缓冲 / 面缓冲', '缓冲区叠加分析（交集/并集）', '缓冲区样式渲染'],
    points: ['Turf.js 在 WGS84 椭球上计算更精确', '单位可选 meters/kilometers/miles', '复杂多边形缓冲区计算较慢'],
  },
}

export const volumeCalculation: ExampleMeta = {
  id: 'volume-calculation',
  title: '方量计算',
  category: '空间分析',
  description: '基于设计高程与现状地形计算挖填方量，生成挖填方分布图，常用于土方工程量估算。',
  tags: ['方量', '土方', '挖填'],
  level: 'hard',
  files: { 'main.ts': placeholder('方量计算', 116.39, 39.9, 30000), 'style.css': css },
  guide: {
    features: ['密集高程采样网格化', '设计高程与现状高程差值', '挖方/填方分区着色', '方量累积计算'],
    points: ['采样密度直接影响计算精度', '挖方（现状 > 设计）/ 填方（现状 < 设计）', '方量 = 面积 × 平均高差'],
  },
}

// ─── 水域特效 ─────────────────────────────────────────────────────────────────

export const waterSurface: ExampleMeta = {
  id: 'water-surface',
  title: '静态水面与反射水面',
  category: '水域特效',
  description: '为多边形区域添加真实水面效果：普通水面材质（法线贴图波浪）和反射水面（环境反射），适用于湖泊、河道。',
  tags: ['水面', '反射', '波纹'],
  level: 'medium',
  files: { 'main.ts': placeholder('水面反射', 120.15, 30.28, 5000), 'style.css': css },
  guide: {
    features: ['WaterMaterialProperty 水面材质', '反射水面自定义 Appearance', '法线贴图（Normal Map）驱动波浪', '菲涅耳系数控制反射强度'],
    points: ['水面材质需要场景光照配合', 'animationSpeed 控制波浪速度', '反射需要自定义 FrameBuffer'],
  },
}

export const floodSimulation: ExampleMeta = {
  id: 'flood-simulation',
  title: '洪水演进',
  category: '水域特效',
  description: '模拟洪水漫延过程：水闸开启引发洪水、水位动态升高、河流横断面水面实时变化，结合粒子效果。',
  tags: ['洪水', '水位', '动态水面'],
  level: 'hard',
  files: { 'main.ts': placeholder('洪水演进', 110, 30, 100000), 'style.css': css },
  guide: {
    features: ['水面高度动态插值', '水闸控制水位联动', '河流横断面动态升降', '洪水前沿粒子特效'],
    points: ['水面范围需 DEM 实时采样计算', '水位按时序关键帧插值', '粒子模拟水流湍急感'],
  },
}

export const dynamicRiver: ExampleMeta = {
  id: 'dynamic-river',
  title: '动态河流',
  category: '水域特效',
  description: '基于河流矢量数据生成宽度可变的动态河流水面，流速编码水流纹理速度，表达河流流态。',
  tags: ['河流', '动态水面', '流速'],
  level: 'medium',
  files: { 'main.ts': placeholder('动态河流', 107, 31, 500000), 'style.css': css },
  guide: {
    features: ['走廊（Corridor）生成河道面', '流动水面纹理 UV 动画', '宽度按河流等级编码', '多段河流无缝拼接'],
    points: ['Corridor 宽度可以逐点变化', '流速越快 UV 偏移越大', '蜿蜒河道推荐用采样点平滑'],
  },
}

export const waterGate: ExampleMeta = {
  id: 'water-gate',
  title: '水闸水面升降',
  category: '水域特效',
  description: '模拟水闸开关引发的水位变化，水面动态升降，结合放水粒子效果和声音，展示水利工程三维场景。',
  tags: ['水闸', '水位升降', '粒子'],
  level: 'hard',
  files: { 'main.ts': placeholder('水闸水面升降', 114, 30, 2000), 'style.css': css },
  guide: {
    features: ['水面高度 CallbackProperty 动态更新', '水闸模型开关动画', '放水粒子系统', '上下游水位联动'],
    points: ['水面 entity 高度用 CallbackProperty 驱动', '闸门动画通过 ModelMatrix 控制', '粒子速度与水头差成正比'],
  },
}

// ─── 视频融合 ─────────────────────────────────────────────────────────────────

export const videoMaterial: ExampleMeta = {
  id: 'video-material',
  title: '视频材质（面状）',
  category: '视频融合',
  description: '将视频流作为纹理贴在多边形或矩形面上，支持 MP4、HLS（m3u8）、FLV 多种协议的视频源。',
  tags: ['视频材质', 'HLS', 'FLV'],
  level: 'medium',
  files: { 'main.ts': placeholder('视频材质', 116.39, 39.9, 1000), 'style.css': css },
  guide: {
    features: ['HTML Video 元素作为纹理源', 'HLS.js 播放 HLS 直播流', 'flv.js 播放 FLV 直播流', '视频纹理自动循环播放'],
    points: ['VideoTexture 需要 video.play() 触发', 'HLS 流需要引入 hls.js 库', '跨域视频需配置 CORS'],
  },
}

export const video2DProjection: ExampleMeta = {
  id: 'video-2d-projection',
  title: '视频 2D 投射',
  category: '视频融合',
  description: '将摄像机视频以平面投影方式叠加到地图上，实现视频与地图平面的空间对齐融合，支持 HLS/FLV 协议。',
  tags: ['视频投射', '2D', '平面融合'],
  level: 'medium',
  files: { 'main.ts': placeholder('视频 2D 投射', 116.39, 39.9, 500), 'style.css': css },
  guide: {
    features: ['视频平面贴地对齐', 'Rectangle/Polygon 视频纹理', '坐标系配准（相机参数）', '多路视频叠加'],
    points: ['2D 投射适合正射航拍视频', '需要已知摄像机地理坐标和朝向', '视频分辨率影响贴图清晰度'],
  },
}

export const video3DProjection: ExampleMeta = {
  id: 'video-3d-projection',
  title: '视频 3D 贴物投射',
  category: '视频融合',
  description: '将摄像机实时视频透视投影到三维地图建筑物表面，实现视频与三维场景的空间融合，用于安防监控可视化。',
  tags: ['视频融合', '3D投射', '监控'],
  level: 'hard',
  files: { 'main.ts': placeholder('视频 3D 贴物投射', 114.06, 22.54, 500), 'style.css': css },
  guide: {
    features: ['Primitive + 自定义着色器投影', 'VideoTexture 视频纹理', '相机内外参数配置', '投影范围锥体可视化'],
    points: ['视频投影本质是纹理坐标变换', '相机 FOV 和朝向决定投影范围', '需要 CORS 或同源视频流'],
  },
}

export const videoEditor: ExampleMeta = {
  id: 'video-editor',
  title: '视频融合编辑',
  category: '视频融合',
  description: '可视化调整视频投影参数（位置、旋转、视锥角），实时预览融合效果，支持多路摄像机管理与参数持久化。',
  tags: ['视频编辑', '参数调整', '摄像机管理'],
  level: 'hard',
  files: { 'main.ts': placeholder('视频融合编辑', 114.06, 22.54, 2000), 'style.css': css },
  guide: {
    features: ['GUI 控件调节投影参数', '多路摄像机列表管理', '参数序列化（JSON 导出/导入）', '实时预览调整效果'],
    points: ['内参（FOV/宽高比）和外参（位置/姿态）分开管理', '调整精度到 0.001° 级别', '参数校准建议使用控制点法'],
  },
}

// ─── 场景与粒子 ───────────────────────────────────────────────────────────────

export const weatherEffects: ExampleMeta = {
  id: 'weather-effects',
  title: '雨雪雾天气特效',
  category: '场景与粒子',
  description: '使用粒子系统模拟真实雨雪效果，通过后处理 Stage 实现体积雾，支持参数动态调节渲染强度。',
  tags: ['雨雪', '雾效', '粒子'],
  level: 'medium',
  files: { 'main.ts': placeholder('雨雪雾特效', 116.39, 39.9, 500), 'style.css': css },
  guide: {
    features: ['ParticleSystem 雨雪粒子模拟', 'PostProcessStage 雾效后处理', '粒子速度/方向风向控制', '天气强度参数调节'],
    points: ['雨粒子用细长条纹理效果更真实', '雪粒子可加旋转速度模拟飘落', '雾效通过深度值混合背景色实现'],
  },
}

export const skyboxScene: ExampleMeta = {
  id: 'skybox-scene',
  title: '天空盒与近地天空盒',
  category: '场景与粒子',
  description: '自定义天空盒六面体贴图，配置近地视角（高度 < 200km）时的自定义天空盒，实现太空到地面的无缝大气过渡。',
  tags: ['天空盒', '大气', '近地'],
  level: 'medium',
  files: { 'main.ts': placeholder('天空盒大气', 116.39, 39.9, 8000000), 'style.css': css },
  guide: {
    features: ['SkyBox 自定义六面体贴图', 'SkyBoxOnGround 近地天空盒扩展', '高度阈值白天/夜晚切换', 'scene.atmosphere 大气散射参数'],
    points: ['近地天空盒需扩展 SkyBox 类重写 update', '高度检测在 preRender 事件中处理', '天空盒分辨率影响远景清晰度'],
  },
}

export const particleEffects: ExampleMeta = {
  id: 'particle-effects',
  title: '粒子效果',
  category: '场景与粒子',
  description: '使用 Cesium 粒子系统模拟火焰、烟雾、爆炸等自然效果，调节发射速率、寿命、重力等物理参数。',
  tags: ['粒子', '火焰', '烟雾'],
  level: 'medium',
  files: { 'main.ts': placeholder('粒子效果', 116.39, 39.9, 2000), 'style.css': css },
  guide: {
    features: ['ParticleSystem 粒子系统配置', 'emissionRate / lifetime 发射参数', 'startColor/endColor 颜色渐变', 'gravity / wind 物理模拟'],
    points: ['粒子纹理推荐 32x32 白色圆形', 'emitter 支持 Box/Circle/Cone/Sphere', 'updateCallback 每帧自定义粒子行为'],
  },
}

export const pointLight: ExampleMeta = {
  id: 'point-light',
  title: '点光源与聚光灯',
  category: '场景与粒子',
  description: '在场景中添加点光源和聚光灯，模拟路灯、探照灯、舞台灯光效果，展示 Cesium 动态光照系统。',
  tags: ['点光源', '聚光灯', '光照'],
  level: 'medium',
  files: { 'main.ts': placeholder('点光源聚光灯', 121.47, 31.23, 100), 'style.css': css },
  guide: {
    features: ['PointLight 点光源配置', 'SpotLight 聚光灯配置', '光照强度与衰减控制', '多光源场景渲染'],
    points: ['Cesium 1.94+ 支持动态光源', '光源半径控制影响范围', '光照需开启 scene.enableLighting'],
  },
}

export const volumeCloud: ExampleMeta = {
  id: 'volume-cloud',
  title: '积云与气象三维体',
  category: '场景与粒子',
  description: '使用 3D 噪声纹理渲染体积积云，以及气象数据（如 DBZ 雷达反射率）的三维体渲染可视化。',
  tags: ['体积云', '体渲染', '气象'],
  level: 'hard',
  files: { 'main.ts': placeholder('积云气象三维体', 116.39, 39.9, 20000), 'style.css': css },
  guide: {
    features: ['PostProcessStage 光线步进', '3D Perlin Noise 噪声纹理', 'WebGL3D 纹理体渲染', '气象 DBZ 色阶映射'],
    points: ['体积渲染基于光线步进（Ray Marching）', 'WebGL2 支持 3D 纹理效率更高', '气象数据体渲染需预处理为三维网格'],
  },
}

// ─── 材质与Shader ─────────────────────────────────────────────────────────────

export const radarScan: ExampleMeta = {
  id: 'radar-scan',
  title: '雷达扫描材质',
  category: '材质与Shader',
  description: '实现旋转雷达扫描波效果：扇形渐变色、旋转动画、信号扩散圆环，可附着在地图上任意位置。',
  tags: ['雷达', '材质', '动态'],
  level: 'medium',
  files: { 'main.ts': placeholder('雷达扫描材质', 116.39, 39.9, 50000), 'style.css': css },
  guide: {
    features: ['CircleWaveMaterial 波纹材质', 'CallbackProperty 驱动旋转角度', 'EllipseMaterialProperty 扇形着色', 'requestAnimationFrame 动画循环'],
    points: ['材质颜色用 Color.fromCssColorString 解析', 'atan2 计算片元角度实现扇形', 'alpha 透明度渐变增强真实感'],
  },
}

export const diffusionPoint: ExampleMeta = {
  id: 'diffusion-point',
  title: '动态扩散点',
  category: '材质与Shader',
  description: '实现向外扩散的圆形波纹点特效，常用于事件告警、POI 高亮标注、实时数据推送等场景的视觉强调。',
  tags: ['扩散点', '动态材质', '告警'],
  level: 'easy',
  files: { 'main.ts': placeholder('动态扩散点', 116.39, 39.9, 200000), 'style.css': css },
  guide: {
    features: ['CircleRippleMaterial 扩散波纹', '多圈波纹相位差错开', 'scale 随时间线性增大', 'alpha 随 scale 衰减'],
    points: ['相位差 = 1 / 波纹数量', 'mod(time, period) 实现循环', '波纹数量建议 2-4 个'],
  },
}

export const waterRipple: ExampleMeta = {
  id: 'water-ripple',
  title: '水波纹材质',
  category: '材质与Shader',
  description: '为多边形区域添加真实水面波纹效果：法线贴图驱动波浪、菲涅耳反射、折射透明，适用于湖泊河道可视化。',
  tags: ['水面', '波纹', '反射'],
  level: 'medium',
  files: { 'main.ts': placeholder('水波纹材质', 120.15, 30.28, 5000), 'style.css': css },
  guide: {
    features: ['WaterMaterialProperty 水面材质', '法线贴图（Normal Map）驱动波浪', '菲涅耳系数控制反射强度', 'baseWaterColor 基础水色'],
    points: ['水面材质需要场景光照配合', 'animationSpeed 控制波浪速度', 'normalMap 分辨率影响波纹细腻程度'],
  },
}

export const flowingLine: ExampleMeta = {
  id: 'flowing-line',
  title: '流动线材质',
  category: '材质与Shader',
  description: '绘制带方向流动效果的线条：箭头纹理 UV 偏移动画，适用于电力线路、管道流向、数据传输可视化。',
  tags: ['流动线', '箭头', 'UV动画'],
  level: 'medium',
  files: { 'main.ts': placeholder('流动线材质', 116.39, 39.9, 500000), 'style.css': css },
  guide: {
    features: ['PolylineArrowMaterialProperty 箭头材质', 'CallbackProperty 动态 UV 偏移', 'PolylineGlowMaterialProperty 发光线', '虚线流动效果'],
    points: ['动态材质需每帧更新 UV 偏移量', 'PolylineGlow 在暗色背景效果更佳', 'repeat 控制箭头/虚线密度'],
  },
}

export const buildingFlicker: ExampleMeta = {
  id: 'building-flicker',
  title: '建筑扫光 CustomShader',
  category: '材质与Shader',
  description: '为建筑 3D Tiles 添加由下至上的扫光动画，通过 CustomShader 修改建筑颜色与发光强度实现科技感效果。',
  tags: ['扫光', '建筑', 'CustomShader'],
  level: 'hard',
  files: { 'main.ts': placeholder('建筑扫光', 121.47, 31.23, 500), 'style.css': css },
  guide: {
    features: ['CustomShader 实现扫光效果', '时间驱动扫光位置', '建筑轮廓边缘发光', '夜景模式与白天模式切换'],
    points: ['扫光位置通过世界坐标高度判断', 'fract(time) 实现循环扫光', 'emissiveColor 不受光照影响'],
  },
}

export const customShaderIntro: ExampleMeta = {
  id: 'custom-shader-intro',
  title: 'CustomShader 入门',
  category: '材质与Shader',
  description: '学习 Cesium CustomShader API 基础：顶点着色器修改位置、片元着色器自定义颜色，以及 uniform 变量传递。',
  tags: ['CustomShader', 'GLSL', '入门'],
  level: 'hard',
  files: { 'main.ts': placeholder('CustomShader 入门', 116.39, 39.9, 500), 'style.css': css },
  guide: {
    features: ['CustomShader vertexShaderText 顶点着色器', 'fragmentShaderText 片元着色器', 'uniforms 传入 JS 变量', 'czm_modelVertexOutput 输出结构'],
    points: ['CustomShader 在内置 PBR 流程中插入', 'czm_material 结构控制光照输出', 'varyings 在顶点/片元间传递数据'],
  },
}

// ─── 数据可视化 ───────────────────────────────────────────────────────────────

export const heatmap3d: ExampleMeta = {
  id: 'heatmap-3d',
  title: '三维热力图',
  category: '数据可视化',
  description: '将二维热力数据立体化，用柱体高度和颜色双重编码数值强度，适用于人流密度、污染浓度等空间分布展示。',
  tags: ['热力图', '三维', '数据可视化'],
  level: 'medium',
  files: { 'main.ts': placeholder('三维热力图', 116.39, 39.9, 500000), 'style.css': css },
  guide: {
    features: ['Cylinder/Box 高度编码数值', '色阶映射（Color Ramp）', '数值归一化处理', '动态更新与动画'],
    points: ['高度编码比颜色更直观', '色阶推荐冷暖色系增强对比', '大数据量改用 Primitive 批量渲染'],
  },
}

export const windField: ExampleMeta = {
  id: 'wind-field',
  title: '风场流线可视化',
  category: '数据可视化',
  description: '基于格网风场数据（U/V 分量）渲染流线粒子，实时模拟大气风场走向，适用于气象数据可视化。',
  tags: ['风场', '流线', '气象'],
  level: 'hard',
  files: { 'main.ts': placeholder('风场流线', 105, 35, 3000000), 'style.css': css },
  guide: {
    features: ['粒子流线追踪算法', 'UV 风速分量插值', '粒子生命周期管理', '风速颜色映射'],
    points: ['双线性插值获取任意位置风速', '粒子数量影响视觉密度和性能', 'WebGL 纹理存储粒子状态效率更高'],
  },
}

export const hexagonHeatmap: ExampleMeta = {
  id: 'hexagon-heatmap',
  title: '蜂窝热力图',
  category: '数据可视化',
  description: '将空间点数据聚合到正六边形网格，用高度和颜色双重编码每格数量，展示空间分布规律。',
  tags: ['蜂窝图', '聚合', '热力'],
  level: 'medium',
  files: { 'main.ts': placeholder('蜂窝热力图', 121.47, 31.23, 300000), 'style.css': css },
  guide: {
    features: ['H3 六边形网格索引', 'Cylinder 编码数量高度', '色阶映射分位数', '缩放级别自适应网格大小'],
    points: ['H3 分辨率 7~9 适合城市级分析', '分位数色阶比线性色阶更均匀', '挤出高度建议对数缩放'],
  },
}

export const isocontour: ExampleMeta = {
  id: 'isocontour',
  title: '等值面（Kriging 插值）',
  category: '数据可视化',
  description: '从离散采样点通过 Kriging 插值生成连续等值面和色斑图，用于温度场、气压场的平滑可视化。',
  tags: ['等值线', 'Kriging', '插值'],
  level: 'hard',
  files: { 'main.ts': placeholder('等值面插值', 105, 35, 2000000), 'style.css': css },
  guide: {
    features: ['Kriging 空间插值算法', 'Marching Squares 等值线提取', '色斑图填充多边形', '动态阈值调节'],
    points: ['Kriging 比 IDW 插值更平滑', 'Marching Squares 输出 GeoJSON 多边形', '等值线数量影响视觉清晰度'],
  },
}

export const oceanCurrent: ExampleMeta = {
  id: 'ocean-current',
  title: '海流可视化',
  category: '数据可视化',
  description: '渲染全球或区域海流流向数据，结合流线粒子与矢量箭头双重展示方式，支持深度分层浏览。',
  tags: ['海流', '流场', '海洋'],
  level: 'hard',
  files: { 'main.ts': placeholder('海流可视化', 140, 30, 3000000), 'style.css': css },
  guide: {
    features: ['NetCDF 数据解析与格式化', '流线粒子系统', '矢量箭头密度控制', '深度分层数据切换'],
    points: ['海流速度远小于风速，粒子生命期需更长', '箭头大小按流速归一化', '深度层数据需额外维度索引'],
  },
}

// ─── 雷达与卫星 ───────────────────────────────────────────────────────────────

export const radarCoverage: ExampleMeta = {
  id: 'radar-coverage',
  title: '雷达探测范围',
  category: '雷达与卫星',
  description: '可视化相控阵雷达、固定算法干扰雷达、双曲面雷达等多种雷达的三维探测范围，支持参数动态调节。',
  tags: ['雷达', '探测范围', '相控阵'],
  level: 'hard',
  files: { 'main.ts': placeholder('雷达探测范围', 116.39, 39.9, 200000), 'style.css': css },
  guide: {
    features: ['椭球体 / 圆锥体 / 双曲面几何', '雷达波束扫描动画', '探测半径与仰角参数化', '多基站协同覆盖范围叠加'],
    points: ['相控阵雷达用椭球体近似覆盖范围', '双曲面需要自定义 Geometry', '覆盖范围叠加用半透明渲染'],
  },
}

export const satelliteTrack: ExampleMeta = {
  id: 'satellite-track',
  title: '卫星轨迹模拟',
  category: '雷达与卫星',
  description: '根据 TLE 两行根数计算卫星实时位置，在三维地球上绘制轨道预报、地面轨迹和覆盖范围，同步相机跟踪。',
  tags: ['卫星', 'TLE', '轨道'],
  level: 'hard',
  files: { 'main.ts': placeholder('卫星轨迹', 0, 20, 20000000), 'style.css': css },
  guide: {
    features: ['satellite.js 库解算 TLE 轨道', 'SampledPositionProperty 预报位置', '星下点地面轨迹绘制', 'Corridor 绘制覆盖条带'],
    points: ['TLE 每天更新一次精度较高', 'LEO 轨道周期约 90min', 'SGP4 模型误差在 km 量级'],
  },
}

export const uavTrack: ExampleMeta = {
  id: 'uav-track',
  title: '低空无人机实时轨迹',
  category: '雷达与卫星',
  description: '接收无人机实时遥测数据，在三维场景中展示飞行姿态、航迹、传感器投影范围，支持多机协同显示。',
  tags: ['无人机', 'UAV', '实时轨迹'],
  level: 'hard',
  files: { 'main.ts': placeholder('无人机实时轨迹', 116.39, 39.9, 5000), 'style.css': css },
  guide: {
    features: ['WebSocket 实时位置数据接收', 'SampledPositionProperty 位置平滑', '无人机模型姿态同步', '传感器投影锥体渲染'],
    points: ['实时数据推荐使用滑动窗口缓存', '位置更新频率 > 5Hz 时需节流', '多机用颜色区分身份'],
  },
}

export const coneSensor: ExampleMeta = {
  id: 'cone-sensor',
  title: '圆锥体传感器',
  category: '雷达与卫星',
  description: '渲染卫星/无人机搭载的传感器观测锥体：固定竖直朝上、任意方向指向，计算地面覆盖范围椭圆。',
  tags: ['圆锥体', '传感器', '覆盖范围'],
  level: 'medium',
  files: { 'main.ts': placeholder('圆锥体传感器', 0, 20, 1000000), 'style.css': css },
  guide: {
    features: ['CylinderGraphics 圆锥体配置', '传感器朝向 HeadingPitchRoll', '地面投影椭圆计算', '覆盖范围随高度动态更新'],
    points: ['圆锥 topRadius=0 即为标准圆锥', '地面投影椭圆需考虑地球曲率', 'Entity 追踪时锥体随载体姿态更新'],
  },
}

// ─── 综合应用 ─────────────────────────────────────────────────────────────────

export const smartPark: ExampleMeta = {
  id: 'smart-park',
  title: '智慧园区',
  category: '综合应用',
  description: '基于真实园区 3D Tiles 数据，集成人员定位、设备告警、视频监控、环境传感器等 IoT 数据的综合可视化平台。',
  tags: ['智慧园区', 'IoT', '3DTiles'],
  level: 'hard',
  files: { 'main.ts': placeholder('智慧园区', 114.06, 22.54, 300), 'style.css': css },
  guide: {
    features: ['3D Tiles 园区模型加载', '实时人员位置更新', '告警点扩散动画', '视频融合监控'],
    points: ['WebSocket 接收实时位置数据', '告警级别对应颜色/动画强度', '建议分楼层管理实体'],
  },
}

export const smartTraffic: ExampleMeta = {
  id: 'smart-traffic',
  title: '智慧交通',
  category: '综合应用',
  description: '实时展示城市交通流量、路段拥堵状态、车辆轨迹回放，结合热力图与流线图呈现交通宏观态势。',
  tags: ['交通', '流量', '拥堵'],
  level: 'hard',
  files: { 'main.ts': placeholder('智慧交通', 121.47, 31.23, 5000), 'style.css': css },
  guide: {
    features: ['路网 GeoJSON 按拥堵着色', '车辆轨迹 CZML 回放', '交通流量热力图', '路段点击查询详情'],
    points: ['拥堵颜色：绿→黄→橙→红→深红', '车辆密度超 1000 改用 Primitive 渲染', '流量热力图建议 5 分钟刷新一次'],
  },
}

export const typhoonTrack: ExampleMeta = {
  id: 'typhoon-track',
  title: '台风路径追踪',
  category: '综合应用',
  description: '展示台风历史路径与强度变化，动画回放台风移动过程，圆圈大小表达影响半径，颜色表达强度等级。',
  tags: ['台风', '气象', '路径'],
  level: 'medium',
  files: { 'main.ts': placeholder('台风路径', 130, 25, 3000000), 'style.css': css },
  guide: {
    features: ['台风路径折线与节点标注', '影响半径动态圆圈', '强度等级颜色编码', '动画逐步展示路径'],
    points: ['台风圆圈半径对应 7/10/12 级风圈', '路径节点时间间隔 6 小时', '动画速度可按实际时间比例播放'],
  },
}

export const cityRoaming: ExampleMeta = {
  id: 'city-roaming',
  title: '城市漫游系统',
  category: '综合应用',
  description: '综合运用地形、OSM 建筑、glTF 模型、后处理效果，实现第一人称城市漫步与自动巡游路径播放。',
  tags: ['城市', '漫游', '第一人称'],
  level: 'hard',
  files: { 'main.ts': placeholder('城市漫游', 121.47, 31.23, 200), 'style.css': css },
  guide: {
    features: ['第一人称相机控制器', 'OSM Buildings + 地形组合', 'Bloom + AmbientOcclusion 后处理', '自动巡游路径关键帧插值'],
    points: ['第一人称需禁用默认 CameraController', 'Bloom 效果增强城市夜景质感', '巡游路径建议用 CatmullRom 样条插值'],
  },
}

export const cesiumThreeIntegration: ExampleMeta = {
  id: 'cesium-three-integration',
  title: 'Cesium 融合 Three.js',
  category: '综合应用',
  description: '将 Cesium 三维地球与 Three.js 渲染器同步，共享相机矩阵，实现地理场景与 Three.js 特效的无缝叠加。',
  tags: ['Three.js', '融合', '渲染'],
  level: 'hard',
  files: { 'main.ts': placeholder('Cesium + Three.js', 116.39, 39.9, 10000), 'style.css': css },
  guide: {
    features: ['共享 WebGL Context 或双 Canvas 叠加', 'Cesium 相机矩阵同步到 Three.js', '坐标系对齐（WGS84 → Three ENU）', 'requestAnimationFrame 统一渲染循环'],
    points: ['推荐双 Canvas 方式避免 WebGL 状态冲突', '相机同步需每帧更新投影矩阵', '坐标原点取当前场景中心减少精度损失'],
  },
}
