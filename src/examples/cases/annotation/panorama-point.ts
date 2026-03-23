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

function createPanoramaViewer(panorama: PanoramaPoint) {
  if (panoramaOverlay) {
    panoramaOverlay.remove()
  }

  currentPanoramaId = panorama.id

  // 创建全景容器
  panoramaOverlay = document.createElement('div')
  panoramaOverlay.id = 'panorama-viewer'
  panoramaOverlay.style.position = 'absolute'
  panoramaOverlay.style.top = '0'
  panoramaOverlay.style.left = '0'
  panoramaOverlay.style.width = '100%'
  panoramaOverlay.style.height = '100%'
  panoramaOverlay.style.zIndex = '1000'
  panoramaOverlay.style.backgroundColor = '#000'
  panoramaOverlay.style.overflow = 'hidden'
  panoramaOverlay.style.cursor = 'grab'

  // 全景图片（Equirectangular 投影，平铺展示）
  const img = document.createElement('img')
  img.src = panorama.imageUrl
  img.style.width = '100%'
  img.style.height = '100%'
  img.style.objectFit = 'cover'
  img.style.userSelect = 'none'
  img.style.pointerEvents = 'none'
  panoramaOverlay.appendChild(img)

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

    // 计算热点位置（基于 yaw/pitch）
    const screenPos = yawPitchToScreen(hotspot.yaw, hotspot.pitch)
    hotspotEl.style.left = \`\${screenPos.x}%\`
    hotspotEl.style.top = \`\${screenPos.y}%\`
    hotspotEl.style.display = screenPos.visible ? 'flex' : 'none'

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

  // 信息标签
  const infoLabel = document.createElement('div')
  infoLabel.style.position = 'absolute'
  infoLabel.style.top = '20px'
  infoLabel.style.left = '50%'
  infoLabel.style.transform = 'translateX(-50%)'
  infoLabel.style.backgroundColor = 'rgba(0,0,0,0.7)'
  infoLabel.style.color = '#fff'
  infoLabel.style.padding = '10px 20px'
  infoLabel.style.borderRadius = '25px'
  infoLabel.style.fontSize = '14px'
  infoLabel.style.fontWeight = 'bold'
  infoLabel.textContent = panorama.name
  panoramaOverlay.appendChild(infoLabel)

  // 关闭按钮
  const closeBtn = document.createElement('div')
  closeBtn.style.position = 'absolute'
  closeBtn.style.top = '20px'
  closeBtn.style.right = '20px'
  closeBtn.style.width = '40px'
  closeBtn.style.height = '40px'
  closeBtn.style.borderRadius = '50%'
  closeBtn.style.backgroundColor = 'rgba(0,0,0,0.7)'
  closeBtn.style.color = '#fff'
  closeBtn.style.fontSize = '20px'
  closeBtn.style.display = 'flex'
  closeBtn.style.alignItems = 'center'
  closeBtn.style.justifyContent = 'center'
  closeBtn.style.cursor = 'pointer'
  closeBtn.textContent = '×'
  closeBtn.addEventListener('click', closePanorama)
  panoramaOverlay.appendChild(closeBtn)

  // 鼠标拖拽旋转
  panoramaOverlay.addEventListener('mousedown', (e) => {
    isDragging = true
    lastX = e.clientX
    lastY = e.clientY
    panoramaOverlay!.style.cursor = 'grabbing'
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !panoramaOverlay) return
    const deltaX = e.clientX - lastX
    const deltaY = e.clientY - lastY
    yaw -= deltaX * 0.3
    pitch += deltaY * 0.3
    pitch = Math.max(-80, Math.min(80, pitch))
    lastX = e.clientX
    lastY = e.clientY
    updatePanoramaView()
  })

  document.addEventListener('mouseup', () => {
    isDragging = false
    if (panoramaOverlay) {
      panoramaOverlay.style.cursor = 'grab'
    }
  })

  container.appendChild(panoramaOverlay)
  console.log(\`🖼️ 进入全景: \${panorama.name}\`)
}

function yawPitchToScreen(yaw: number, pitch: number): { x: number; y: number; visible: boolean } {
  // 简单的球面投影
  const fov = 100 // 视场角度
  const x = ((yaw - yaw + 180) % 360) // 相对偏移
  const y = pitch + 90
  
  const screenX = (x / 360) * 100
  const screenY = (y / 180) * 100
  
  return {
    x: screenX,
    y: screenY,
    visible: pitch > -80 && pitch < 80,
  }
}

function updatePanoramaView() {
  if (!panoramaOverlay) return
  const img = panoramaOverlay.querySelector('img') as HTMLImageElement
  if (img) {
    img.style.transform = \`translate(\${-yaw * 2}px, \${pitch * 2}px)\`
  }
}

function closePanorama() {
  if (panoramaOverlay) {
    panoramaOverlay.remove()
    panoramaOverlay = null
    currentPanoramaId = null
    yaw = 0
    pitch = 0
    console.log('❌ 退出全景，返回三维场景')
  }
}

// ── 在 Cesium 地图上添加全景标记 ──────────────────
panoramaPoints.forEach((pano) => {
  viewer.entities.add({
    id: pano.id,
    position: Cesium.Cartesian3.fromDegrees(pano.lon, pano.lat),
    billboard: {
      image: \`<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="#3498db" stroke="white" stroke-width="2"/>
        <circle cx="20" cy="18" r="8" fill="white"/>
      </svg>\`,
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

// 点击标记进入全景
viewer.entities.layer.event.addEventListener('click', (entity: Cesium.Entity) => {
  const pano = panoramaPoints.find((p) => p.id === entity.id)
  if (pano && !currentPanoramaId) {
    createPanoramaViewer(pano)
  }
})

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
