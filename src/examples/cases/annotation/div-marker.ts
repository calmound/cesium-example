import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'div-marker',
  title: 'DIV 图标点',
  category: '点标注',
  description: '将 HTML DOM 元素（DIV）与地理坐标同步，实现富文本弹窗、自定义 HTML 样式的信息标牌。',
  tags: ['DIV', 'HTML', '弹窗'],
  level: 'medium',
  files: {
    'main.ts': `// DIV 图标点示例：DOM 元素与地理坐标同步
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

// ── 创建 DIV 标注容器 ──────────────────────────────
const divContainer = document.createElement('div')
divContainer.id = 'div-marker-container'
divContainer.style.position = 'absolute'
divContainer.style.top = '0'
divContainer.style.left = '0'
divContainer.style.width = '100%'
divContainer.style.height = '100%'
divContainer.style.pointerEvents = 'none'
divContainer.style.overflow = 'hidden'
viewer.container.appendChild(divContainer)

// ── 定义标注点数据 ────────────────────────────────
interface DivMarkerData {
  lon: number
  lat: number
  title: string
  content: string
  color: string
}

const markerData: DivMarkerData[] = [
  { lon: 116.39, lat: 39.9,  title: '北京', content: '首都 · 政治中心', color: '#e74c3c' },
  { lon: 121.47, lat: 31.23, title: '上海', content: '金融 · 贸易中心', color: '#3498db' },
  { lon: 113.26, lat: 23.13, title: '广州', content: '商贸 · 历史名城', color: '#2ecc71' },
  { lon: 104.06, lat: 30.67, title: '成都', content: '天府 · 美食之都', color: '#f39c12' },
  { lon: 120.15, lat: 30.28, title: '杭州', content: '互联网 · 电商之都', color: '#9b59b6' },
]

// ── 创建单个 DIV 标注 ─────────────────────────────
function createDivMarker(data: DivMarkerData) {
  const wrapper = document.createElement('div')
  wrapper.className = 'custom-div-marker'
  wrapper.style.position = 'absolute'
  wrapper.style.cursor = 'pointer'
  wrapper.style.pointerEvents = 'auto'
  wrapper.style.transform = 'translate(-50%, -100%)'
  wrapper.style.whiteSpace = 'nowrap'

  const pin = document.createElement('div')
  pin.className = 'marker-pin'
  pin.style.width = '24px'
  pin.style.height = '24px'
  pin.style.borderRadius = '50%'
  pin.style.backgroundColor = data.color
  pin.style.border = '3px solid white'
  pin.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'

  const label = document.createElement('div')
  label.className = 'marker-label'
  label.textContent = data.title
  label.style.fontSize = '12px'
  label.style.fontWeight = 'bold'
  label.style.color = '#333'
  label.style.textShadow = '0 0 2px white'
  label.style.marginTop = '4px'
  label.style.textAlign = 'center'

  wrapper.appendChild(pin)
  wrapper.appendChild(label)

  // 创建弹窗
  const popup = document.createElement('div')
  popup.className = 'marker-popup'
  popup.style.position = 'absolute'
  popup.style.top = '-70px'
  popup.style.left = '50%'
  popup.style.transform = 'translateX(-50%)'
  popup.style.backgroundColor = 'white'
  popup.style.borderRadius = '8px'
  popup.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)'
  popup.style.padding = '10px 14px'
  popup.style.minWidth = '120px'
  popup.style.opacity = '0'
  popup.style.transition = 'opacity 0.2s'
  popup.style.pointerEvents = 'none'

  popup.innerHTML = \`
    <div style="font-weight:bold;font-size:14px;color:\${data.color}">\${data.title}</div>
    <div style="font-size:12px;color:#666;margin-top:4px">\${data.content}</div>
    <div style="font-size:10px;color:#999;margin-top:4px">经度: \${data.lon.toFixed(2)}</div>
    <div style="font-size:10px;color:#999">纬度: \${data.lat.toFixed(2)}</div>
  \`

  wrapper.appendChild(popup)

  // 鼠标事件
  wrapper.addEventListener('mouseenter', () => {
    popup.style.opacity = '1'
  })
  wrapper.addEventListener('mouseleave', () => {
    popup.style.opacity = '0'
  })

  // 阻止冒泡，避免干扰地图交互
  wrapper.addEventListener('click', (e) => e.stopPropagation())
  wrapper.addEventListener('mousedown', (e) => e.stopPropagation())

  divContainer.appendChild(wrapper)

  return { wrapper, data }
}

// ── 创建多个标注 ──────────────────────────────────
const divMarkers = markerData.map(createDivMarker)
console.log(\`✅ 创建 \${divMarkers.length} 个 DIV 标注\`)

// ── 在 preRender 中同步 DOM 位置 ─────────────────
function updateDivMarkers() {
  const scene = viewer.scene
  const camera = viewer.camera

  divMarkers.forEach(({ wrapper, data }) => {
    const position = Cesium.Cartesian3.fromDegrees(data.lon, data.lat)
    
    // 遮挡检测：点在球背面时隐藏
    const carto = Cesium.Ellipsoid.cartesianToCartographic(position)
    const normal = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(cartographic)
    const toCamera = Cesium.Cartesian3.subtract(camera.position, position, new Cesium.Cartesian3())
    const dot = Cesium.Cartesian3.dot(normal, Cesium.Cartesian3.normalize(toCamera, new Cesium.Cartesian3()))
    
    // 世界坐标 → 屏幕坐标
    const screenPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, position)
    
    if (screenPos && dot > 0) {
      wrapper.style.display = 'block'
      wrapper.style.left = \`\${screenPos.x}px\`
      wrapper.style.top = \`\${screenPos.y}px\`
    } else {
      wrapper.style.display = 'none'
    }
  })
}

viewer.scene.preRender.addEventListener(updateDivMarkers)
console.log('🔄 DOM 位置同步已启动（preRender 事件）')
console.log('💡 超过 100 个 DIV 标注建议改用 Billboard 方案')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116, 32, 2500000),
  duration: 2,
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }

.custom-div-marker {
  z-index: 100;
}

.marker-pin {
  transition: transform 0.2s;
}

.custom-div-marker:hover .marker-pin {
  transform: scale(1.2);
}
`,
  },
  guide: {
    features: ['SceneTransforms 世界坐标→屏幕坐标', 'preRender 事件同步 DOM 位置', 'CSS 自定义弹窗样式', '遮挡检测（点在球背面时隐藏）'],
    points: ['DOM 同步需在 preRender/postRender 中执行', '大量 DIV 标注性能差，超过 100 个需考虑替代方案', '鼠标事件需阻止冒泡避免干扰地图'],
  },
}
