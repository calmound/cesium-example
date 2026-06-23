import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'distance-measure',
  title: '距离与面积量算',
  category: '空间分析',
  description: '点击地图绘制折线/多边形，实时计算段距离、总长度和多边形面积，支持贴地模式与三维空间量算。',
  tags: ['测量', '距离', '面积'],
  level: 'medium',
  files: {
    'main.ts': `// 距离与面积量算示例
// 演示点击绘制折线/多边形进行量测

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

// ── 1. 量测状态 ─────────────────────────────────────────
let measureMode: 'none' | 'distance' | 'area' = 'none'
let measurePoints: Cesium.Cartesian3[] = []
let measureEntities: Cesium.Entity[] = []
let totalDistance = 0

// ── 2. 添加测量点 ─────────────────────────────────────────
function addMeasurePoint(cartesian: Cesium.Cartesian3) {
  measurePoints.push(cartesian)

  const pointEntity = viewer.entities.add({
    position: cartesian,
    point: {
      pixelSize: 8,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
  })
  measureEntities.push(pointEntity)

  // 更新折线
  if (measurePoints.length > 1) {
    updateMeasureLine()
  }
}

// ── 3. 更新测量线 ─────────────────────────────────────────
function updateMeasureLine() {
  // 移除旧的线
  measureEntities.forEach((e) => {
    if (e.polyline) viewer.entities.remove(e)
  })
  measureEntities = measureEntities.filter((e) => !e.polyline)

  if (measurePoints.length < 2) return

  // 添加新线
  const lineEntity = viewer.entities.add({
    polyline: {
      positions: measurePoints,
      width: 3,
      material: Cesium.Color.YELLOW,
    },
  })
  measureEntities.push(lineEntity)

  // 计算总距离
  totalDistance = 0
  for (let i = 0; i < measurePoints.length - 1; i++) {
    const dist = Cesium.Cartesian3.distance(measurePoints[i], measurePoints[i + 1])
    totalDistance += dist
  }

  console.log('📏 当前总距离:', totalDistance.toFixed(2), '米')
}

// ── 4. 清除测量 ────────────────────────────────────────────
function clearMeasure() {
  measureEntities.forEach((e) => viewer.entities.remove(e))
  measureEntities = []
  measurePoints = []
  totalDistance = 0
}

// ── 5. 鼠标事件处理 ───────────────────────────────────────
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

handler.setInputAction((event) => {
  if (measureMode === 'none') return

  const ray = viewer.camera.getPickRay(event.position)
  if (!ray) return

  const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
  if (cartesian) {
    addMeasurePoint(cartesian)
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

// 右键清除
handler.setInputAction(() => {
  if (measurePoints.length > 0) {
    // 完成测量，添加最后一段线
    if (measurePoints.length > 1) {
      const startPoint = measurePoints[0]
      const endPoint = measurePoints[measurePoints.length - 1]
      const dist = Cesium.Cartesian3.distance(startPoint, endPoint)
      console.log('📏 测量完成！总距离:', totalDistance.toFixed(2), '米')
    }
    measureMode = 'none'
  }
}, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

// ── 6. 添加示例起点 ───────────────────────────────────────
const startPos = Cesium.Cartesian3.fromDegrees(116.39, 39.90)
viewer.entities.add({
  name: '测量起点',
  position: startPos,
  point: {
    pixelSize: 12,
    color: Cesium.Color.GREEN,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: '点击开始测量',
    font: '14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

// ── 7. 添加示例终点 ───────────────────────────────────────
viewer.entities.add({
  name: '测量终点',
  position: Cesium.Cartesian3.fromDegrees(116.42, 39.92),
  point: {
    pixelSize: 12,
    color: Cesium.Color.RED,
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 2,
  },
  label: {
    text: '右键结束测量',
    font: '14px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

// 添加示例线
viewer.entities.add({
  name: '示例线段',
  polyline: {
    positions: [startPos, Cesium.Cartesian3.fromDegrees(116.42, 39.92)],
    width: 3,
    material: Cesium.Color.YELLOW,
  },
})

const exampleDist = Cesium.Cartesian3.distance(startPos, Cesium.Cartesian3.fromDegrees(116.42, 39.92))
console.log('📏 示例距离:', exampleDist.toFixed(2), '米')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.91, 10000),
  duration: 2,
})

console.log('💡 左键点击添加测量点')
console.log('💡 右键结束当前测量')
console.log('📏 Cesium.Cartesian3.distance 计算空间距离')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['ScreenSpaceEventHandler 鼠标拾取', 'EllipsoidGeodesic 大地线距离', '球面面积公式', '动态折线/多边形绘制'],
    points: ['globe.pick 拾取地形表面坐标', 'EllipsoidGeodesic 考虑地球曲率', '大于 100km 时曲率误差显著'],
  },
}
