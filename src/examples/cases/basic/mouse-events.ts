import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
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
