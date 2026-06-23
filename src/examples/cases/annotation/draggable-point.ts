import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'draggable-point',
  title: '可拖拽标注',
  category: '点标注',
  description: '实现可通过鼠标拖拽移动位置的地图标注，获取拖拽后的实时坐标，适用于标注编辑、位置调整等场景。',
  tags: ['拖拽', '交互', '编辑'],
  level: 'medium',
  files: {
    'main.ts': `// 可拖拽标注示例：鼠标拖拽移动标注位置
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

// ── 状态管理 ──────────────────────────────────────
let isDragging = false
let dragEntity: Cesium.Entity | null = null
const dragPosition = new Cesium.CallbackProperty(() => {
  return currentPosition
}, false)

let currentPosition = Cesium.Cartesian3.fromDegrees(116.39, 39.9)

function createMarkerCanvas() {
  const canvas = document.createElement('canvas')
  canvas.width = 40
  canvas.height = 50
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.beginPath()
  ctx.moveTo(20, 48)
  ctx.bezierCurveTo(8, 36, 2, 26, 2, 18)
  ctx.bezierCurveTo(2, 9.2, 9.2, 2, 20, 2)
  ctx.bezierCurveTo(30.8, 2, 38, 9.2, 38, 18)
  ctx.bezierCurveTo(38, 26, 32, 36, 20, 48)
  ctx.closePath()
  ctx.fillStyle = '#e74c3c'
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = '#ffffff'
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(20, 18, 6, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  return canvas
}

// ── 创建可拖拽标注 ────────────────────────────────
const draggableMarker = viewer.entities.add({
  position: dragPosition,
  billboard: {
    image: createMarkerCanvas(),
    width: 40,
    height: 50,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  },
  label: {
    text: '拖拽我',
    font: 'bold 12px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.TOP,
    pixelOffset: new Cesium.Cartesian2(0, 55),
    show: true,
  },
})
console.log('📍 创建可拖拽标注')

// ── 坐标显示面板 ──────────────────────────────────
const coordPanel = document.createElement('div')
coordPanel.style.position = 'absolute'
coordPanel.style.bottom = '20px'
coordPanel.style.left = '50%'
coordPanel.style.transform = 'translateX(-50%)'
coordPanel.style.backgroundColor = 'rgba(0,0,0,0.8)'
coordPanel.style.color = '#fff'
coordPanel.style.padding = '12px 20px'
coordPanel.style.borderRadius = '8px'
coordPanel.style.fontSize = '13px'
coordPanel.style.fontFamily = 'monospace'
coordPanel.style.zIndex = '100'
coordPanel.style.minWidth = '300px'
coordPanel.style.textAlign = 'center'
coordPanel.innerHTML = \`
  <div style="font-weight:bold;margin-bottom:8px;color:#3498db">🎯 当前坐标</div>
  <div id="coord-display">经度: 116.390000 | 纬度: 39.900000</div>
\`
container.appendChild(coordPanel)

function updateCoordDisplay() {
  const carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(currentPosition)
  const lon = Cesium.Math.toDegrees(carto.longitude).toFixed(6)
  const lat = Cesium.Math.toDegrees(carto.latitude).toFixed(6)
  const height = carto.height.toFixed(2)
  coordPanel.innerHTML = \`
    <div style="font-weight:bold;margin-bottom:8px;color:#3498db">🎯 当前坐标</div>
    <div id="coord-display">经度: \${lon} | 纬度: \${lat}</div>
    <div style="font-size:11px;color:#aaa;margin-top:4px">高度: \${height}m</div>
  \`
}

updateCoordDisplay()

// ── 鼠标事件处理 ──────────────────────────────────
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

// MOUSE_MOVE: 更新拖拽位置
handler.setInputAction((movement: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
  if (!isDragging || !dragEntity) return

  // 使用 globe.pick 获取地形表面坐标
  const ray = viewer.camera.getPickRay(movement.endPosition)
  if (!ray) return

  const cartesian = viewer.scene.globe.pick(ray, viewer.scene)
  if (cartesian) {
    currentPosition = cartesian
    updateCoordDisplay()
  }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

// MOUSE_DOWN: 开始拖拽
handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
  const picked = viewer.scene.pick(click.position)
  
  if (Cesium.defined(picked) && picked.id === draggableMarker) {
    isDragging = true
    dragEntity = draggableMarker
    
    // 禁用相机控制器，避免干扰拖拽
    viewer.scene.screenSpaceCameraController.enableRotate = false
    viewer.scene.screenSpaceCameraController.enableZoom = false
    viewer.scene.screenSpaceCameraController.enableTilt = false
    viewer.scene.screenSpaceCameraController.enableLook = false
    
    // 改变鼠标样式
    viewer.container.style.cursor = 'grabbing'
    
    // 高亮标注
    draggableMarker.billboard!.color = new Cesium.Color(1, 0.8, 0.2, 1)
    
    console.log('🖱️ 开始拖拽标注')
  }
}, Cesium.ScreenSpaceEventType.LEFT_DOWN)

// MOUSE_UP: 结束拖拽
handler.setInputAction(() => {
  if (isDragging) {
    isDragging = false
    dragEntity = null
    
    // 恢复相机控制器
    viewer.scene.screenSpaceCameraController.enableRotate = true
    viewer.scene.screenSpaceCameraController.enableZoom = true
    viewer.scene.screenSpaceCameraController.enableTilt = true
    viewer.scene.screenSpaceCameraController.enableLook = true
    
    // 恢复鼠标样式
    viewer.container.style.cursor = 'default'
    
    // 恢复标注颜色
    draggableMarker.billboard!.color = Cesium.Color.WHITE
    
    // 输出最终坐标
    const carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(currentPosition)
    if (!carto) return
    const lon = Cesium.Math.toDegrees(carto.longitude).toFixed(6)
    const lat = Cesium.Math.toDegrees(carto.latitude).toFixed(6)
    console.log(\`📍 标注拖拽至: [\${lon}, \${lat}]\`)
  }
}, Cesium.ScreenSpaceEventType.LEFT_UP)

// ── 添加参考标注点（不可拖拽）─────────────────────
const referencePoints = [
  { lon: 116.29, lat: 39.85, name: '参考点 A' },
  { lon: 116.49, lat: 39.95, name: '参考点 B' },
]

referencePoints.forEach(({ lon, lat, name }) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    point: {
      pixelSize: 10,
      color: Cesium.Color.GRAY,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: name,
      font: '11px sans-serif',
      fillColor: Cesium.Color.GRAY,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -15),
    },
  })
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.39, 39.9, 10000),
  duration: 2,
})
console.log('💡 点击红色图钉开始拖拽')
console.log('🔧 拖拽时相机控制被禁用（防止干扰）')
console.log('📐 使用 globe.pick 获取地形表面坐标')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['MOUSE_DOWN 开始拖拽', 'MOUSE_MOVE 更新坐标', 'MOUSE_UP 结束拖拽', 'CallbackProperty 实时更新位置'],
    points: ['拖拽过程中禁用相机控制器', 'globe.pick 获取拖拽目标地形坐标', 'CallbackProperty 比直接修改 position 更高效'],
  },
}
