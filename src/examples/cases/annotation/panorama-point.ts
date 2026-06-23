import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'panorama-point',
  title: '全景点展示',
  category: '点标注',
  description: '在 Cesium 场景中嵌入全景图片，点击地图上的标记点进入 360° 全景浏览模式，实现地理场景与全景的无缝切换。',
  tags: ['全景', '360°', 'VR'],
  level: 'medium',
  files: {
    'main.ts': `// 全景点展示示例：点击进入 360° 全景浏览
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

// ── 全景数据定义 ──────────────────────────────────
interface PanoramaPoint {
  id: string
  lon: number
  lat: number
  name: string
  imageUrl: string
  hotspots: { targetId: string; yaw: number; pitch: number; label: string }[]
}

const panoramaPoints: PanoramaPoint[] = [
  {
    id: 'shanghai-bund',
    lon: 121.49,
    lat: 31.24,
    name: '上海外滩',
    imageUrl: 'https://images.unsplash.com/photo-1537531383496-f4749b85ceb3?w=2048&h=1024&fit=crop',
    hotspots: [
      { targetId: 'shanghai-pudong', yaw: 80, pitch: -5, label: '浦东新区' },
    ],
  },
  {
    id: 'shanghai-pudong',
    lon: 121.54,
    lat: 31.22,
    name: '上海浦东',
    imageUrl: 'https://images.unsplash.com/photo-1517949006329-2edd1bae4d76?w=2048&h=1024&fit=crop',
    hotspots: [
      { targetId: 'shanghai-bund', yaw: 260, pitch: -5, label: '外滩' },
    ],
  },
]

// ── 全景查看器 UI ─────────────────────────────────
let panoramaOverlay: HTMLDivElement | null = null
let currentPanoramaId: string | null = null
let isDragging = false
let lastX = 0
let lastY = 0
let yaw = 0
let pitch = 0
let moveListener: ((e: MouseEvent) => void) | null = null
let upListener: ((e: MouseEvent) => void) | null = null

function createPanoramaMarkerCanvas(title: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 40
  canvas.height = 50

  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 2

  ctx.beginPath()
  ctx.moveTo(20, 48)
  ctx.bezierCurveTo(34, 34, 38, 24, 38, 18)
  ctx.bezierCurveTo(38, 7.95, 30.05, 0, 20, 0)
  ctx.bezierCurveTo(9.95, 0, 2, 7.95, 2, 18)
  ctx.bezierCurveTo(2, 24, 6, 34, 20, 48)
  ctx.closePath()
  ctx.fillStyle = '#3498db'
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = '#ffffff'
  ctx.stroke()

  ctx.shadowColor = 'transparent'
  ctx.beginPath()
  ctx.arc(20, 18, 7.5, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  ctx.fillStyle = '#1f4f6b'
  ctx.font = 'bold 9px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(title.slice(0, 2), 20, 34)

  return canvas
}

function updateHotspotPositions() {
  if (!panoramaOverlay) return

  panoramaOverlay.querySelectorAll<HTMLDivElement>('.panorama-hotspot').forEach((hotspotEl) => {
    const targetYaw = Number(hotspotEl.dataset.yaw ?? '0')
    const targetPitch = Number(hotspotEl.dataset.pitch ?? '0')
    const screenPos = yawPitchToScreen(targetYaw, targetPitch)

    hotspotEl.style.left = \`\${screenPos.x}%\`
    hotspotEl.style.top = \`\${screenPos.y}%\`
    hotspotEl.style.display = screenPos.visible ? 'flex' : 'none'
  })
}

function attachPanoramaDragListeners() {
  moveListener = (e: MouseEvent) => {
    if (!isDragging || !panoramaOverlay) return
    const deltaX = e.clientX - lastX
    const deltaY = e.clientY - lastY
    yaw -= deltaX * 0.3
    pitch += deltaY * 0.3
    pitch = Math.max(-80, Math.min(80, pitch))
    lastX = e.clientX
    lastY = e.clientY
    updatePanoramaView()
  }

  upListener = () => {
    isDragging = false
    if (panoramaOverlay) {
      panoramaOverlay.style.cursor = 'grab'
    }
  }

  document.addEventListener('mousemove', moveListener)
  document.addEventListener('mouseup', upListener)
}

function detachPanoramaDragListeners() {
  if (moveListener) {
    document.removeEventListener('mousemove', moveListener)
    moveListener = null
  }
  if (upListener) {
    document.removeEventListener('mouseup', upListener)
    upListener = null
  }
}

function createPanoramaViewer(panorama: PanoramaPoint) {
  if (panoramaOverlay) {
    panoramaOverlay.remove()
    detachPanoramaDragListeners()
  }

  currentPanoramaId = panorama.id
  isDragging = false
  yaw = 0
  pitch = 0

  // 创建全景容器
  panoramaOverlay = document.createElement('div')
  panoramaOverlay.id = 'panorama-viewer'
  panoramaOverlay.style.position = 'absolute'
  panoramaOverlay.style.top = '16px'
  panoramaOverlay.style.right = '16px'
  panoramaOverlay.style.width = '46%'
  panoramaOverlay.style.minWidth = '420px'
  panoramaOverlay.style.maxWidth = '720px'
  panoramaOverlay.style.height = 'calc(100% - 32px)'
  panoramaOverlay.style.zIndex = '1000'
  panoramaOverlay.style.background = 'linear-gradient(180deg, rgba(2, 6, 23, 0.96), rgba(15, 23, 42, 0.92))'
  panoramaOverlay.style.overflow = 'hidden'
  panoramaOverlay.style.cursor = 'grab'
  panoramaOverlay.style.borderRadius = '24px'
  panoramaOverlay.style.border = '1px solid rgba(148, 163, 184, 0.22)'
  panoramaOverlay.style.boxShadow = '0 24px 60px rgba(15, 23, 42, 0.45)'
  panoramaOverlay.style.backdropFilter = 'blur(10px)'

  // 全景图片（Equirectangular 投影，平铺展示）
  const img = document.createElement('img')
  img.src = panorama.imageUrl
  img.style.width = '100%'
  img.style.height = '100%'
  img.style.objectFit = 'cover'
  img.style.userSelect = 'none'
  img.style.pointerEvents = 'none'
  panoramaOverlay.appendChild(img)

  const imageMask = document.createElement('div')
  imageMask.style.position = 'absolute'
  imageMask.style.inset = '0'
  imageMask.style.background = 'linear-gradient(180deg, rgba(15, 23, 42, 0.16), rgba(15, 23, 42, 0.38) 72%, rgba(15, 23, 42, 0.72))'
  imageMask.style.pointerEvents = 'none'
  panoramaOverlay.appendChild(imageMask)

  // 热点标记
  panorama.hotspots.forEach((hotspot) => {
    const targetPano = panoramaPoints.find((p) => p.id === hotspot.targetId)
    if (!targetPano) return

    const hotspotEl = document.createElement('div')
    hotspotEl.className = 'panorama-hotspot'
    hotspotEl.style.position = 'absolute'
    hotspotEl.style.width = '60px'
    hotspotEl.style.height = '60px'
    hotspotEl.style.borderRadius = '50%'
    hotspotEl.style.border = '3px solid #fff'
    hotspotEl.style.backgroundColor = 'rgba(52, 152, 219, 0.7)'
    hotspotEl.style.cursor = 'pointer'
    hotspotEl.style.display = 'flex'
    hotspotEl.style.alignItems = 'center'
    hotspotEl.style.justifyContent = 'center'
    hotspotEl.style.color = '#fff'
    hotspotEl.style.fontSize = '11px'
    hotspotEl.style.fontWeight = 'bold'
    hotspotEl.style.textAlign = 'center'
    hotspotEl.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)'
    hotspotEl.style.transition = 'transform 0.2s, background-color 0.2s'
    hotspotEl.style.transform = 'translate(-50%, -50%)'
    hotspotEl.textContent = hotspot.label
    hotspotEl.dataset.yaw = String(hotspot.yaw)
    hotspotEl.dataset.pitch = String(hotspot.pitch)

    hotspotEl.addEventListener('click', () => {
      // 切换到目标全景
      const targetPano = panoramaPoints.find((p) => p.id === hotspot.targetId)
      if (targetPano) {
        createPanoramaViewer(targetPano)
        console.log(\`🔗 切换到全景点: \${targetPano.name}\`)
      }
    })

    hotspotEl.addEventListener('mouseenter', () => {
      hotspotEl.style.transform = 'translate(-50%, -50%) scale(1.15)'
      hotspotEl.style.backgroundColor = 'rgba(52, 152, 219, 0.9)'
    })
    hotspotEl.addEventListener('mouseleave', () => {
      hotspotEl.style.transform = 'translate(-50%, -50%) scale(1)'
      hotspotEl.style.backgroundColor = 'rgba(52, 152, 219, 0.7)'
    })

    panoramaOverlay!.appendChild(hotspotEl)
  })
  updateHotspotPositions()

  // 信息标签
  const infoLabel = document.createElement('div')
  infoLabel.style.position = 'absolute'
  infoLabel.style.top = '18px'
  infoLabel.style.left = '18px'
  infoLabel.style.maxWidth = 'calc(100% - 96px)'
  infoLabel.style.backgroundColor = 'rgba(15, 23, 42, 0.76)'
  infoLabel.style.color = '#fff'
  infoLabel.style.padding = '12px 16px'
  infoLabel.style.borderRadius = '16px'
  infoLabel.style.fontSize = '14px'
  infoLabel.style.fontWeight = 'bold'
  infoLabel.style.lineHeight = '1.4'
  infoLabel.innerHTML = \`
    <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(191,219,254,0.92);margin-bottom:4px;">Panorama View</div>
    <div>\${panorama.name}</div>
    <div style="margin-top:6px;font-size:12px;font-weight:normal;color:rgba(226,232,240,0.88);">拖拽面板查看全景，地图仍保留在左侧作为空间参考。</div>
  \`
  panoramaOverlay.appendChild(infoLabel)

  // 关闭按钮
  const closeBtn = document.createElement('div')
  closeBtn.style.position = 'absolute'
  closeBtn.style.top = '18px'
  closeBtn.style.right = '18px'
  closeBtn.style.width = '40px'
  closeBtn.style.height = '40px'
  closeBtn.style.borderRadius = '50%'
  closeBtn.style.backgroundColor = 'rgba(15, 23, 42, 0.82)'
  closeBtn.style.color = '#fff'
  closeBtn.style.fontSize = '20px'
  closeBtn.style.display = 'flex'
  closeBtn.style.alignItems = 'center'
  closeBtn.style.justifyContent = 'center'
  closeBtn.style.cursor = 'pointer'
  closeBtn.textContent = '×'
  closeBtn.addEventListener('click', closePanorama)
  panoramaOverlay.appendChild(closeBtn)

  const helperBar = document.createElement('div')
  helperBar.style.position = 'absolute'
  helperBar.style.left = '18px'
  helperBar.style.right = '18px'
  helperBar.style.bottom = '18px'
  helperBar.style.display = 'flex'
  helperBar.style.justifyContent = 'space-between'
  helperBar.style.gap = '12px'
  helperBar.style.padding = '10px 14px'
  helperBar.style.borderRadius = '16px'
  helperBar.style.backgroundColor = 'rgba(15, 23, 42, 0.76)'
  helperBar.style.color = 'rgba(226,232,240,0.92)'
  helperBar.style.fontSize = '12px'
  helperBar.innerHTML = \`
    <span>左侧地图保留当前位置与全景点关系</span>
    <span>热点可跳转到关联全景</span>
  \`
  panoramaOverlay.appendChild(helperBar)

  // 鼠标拖拽旋转
  panoramaOverlay.addEventListener('mousedown', (e) => {
    isDragging = true
    lastX = e.clientX
    lastY = e.clientY
    panoramaOverlay!.style.cursor = 'grabbing'
  })

  attachPanoramaDragListeners()

  container.appendChild(panoramaOverlay)
  console.log(\`🖼️ 进入全景: \${panorama.name}\`)
}

function yawPitchToScreen(targetYaw: number, targetPitch: number): { x: number; y: number; visible: boolean } {
  const relativeYaw = ((((targetYaw - yaw) % 360) + 540) % 360) - 180
  const relativePitch = targetPitch - pitch
  const screenX = 50 + (relativeYaw / 180) * 50
  const screenY = 50 - (relativePitch / 120) * 50

  return {
    x: screenX,
    y: screenY,
    visible: Math.abs(relativeYaw) <= 90 && Math.abs(relativePitch) <= 60,
  }
}

function updatePanoramaView() {
  if (!panoramaOverlay) return
  const img = panoramaOverlay.querySelector('img') as HTMLImageElement
  if (img) {
    img.style.transform = \`translate(\${-yaw * 2}px, \${pitch * 2}px)\`
  }
  updateHotspotPositions()
}

function closePanorama() {
  if (panoramaOverlay) {
    panoramaOverlay.remove()
    panoramaOverlay = null
    currentPanoramaId = null
    yaw = 0
    pitch = 0
    isDragging = false
    detachPanoramaDragListeners()
    console.log('❌ 退出全景，返回三维场景')
  }
}

// ── 在 Cesium 地图上添加全景标记 ──────────────────
panoramaPoints.forEach((pano) => {
  viewer.entities.add({
    id: pano.id,
    position: Cesium.Cartesian3.fromDegrees(pano.lon, pano.lat),
    billboard: {
      image: createPanoramaMarkerCanvas(pano.name),
      width: 40,
      height: 50,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    },
    label: {
      text: pano.name,
      font: 'bold 12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.TOP,
      pixelOffset: new Cesium.Cartesian2(0, 10),
    },
    description: \`点击进入 \${pano.name} 全景\`,
  })
})
console.log(\`✅ 添加 \${panoramaPoints.length} 个全景点标记\`)

// 使用 entity click 事件
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
handler.setInputAction((click: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
  if (currentPanoramaId) return
  
  const picked = viewer.scene.pick(click.position)
  if (Cesium.defined(picked) && picked.id) {
    const entity = picked.id as Cesium.Entity
    const pano = panoramaPoints.find((p) => p.id === entity.id)
    if (pano) {
      createPanoramaViewer(pano)
    }
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(121.5, 31.24, 5000),
  duration: 2,
})
console.log('💡 点击地图上的标记点进入全景浏览模式')
console.log('🖱️ 拖拽全景画面可旋转视角')
console.log('🔗 点击热点可切换到关联的全景点')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }

#panorama-viewer img {
  transition: transform 0.1s linear;
}
`,
  },
  guide: {
    features: ['自定义全景查看器', '点击标注进入全景', '全景←→三维场景切换', '热点标注（链接到其他全景点）'],
    points: ['全景图使用等距柱状投影（Equirectangular）', '球形全景可用 Three.js SphereGeometry 实现', '切换时注意相机位置同步'],
  },
}
