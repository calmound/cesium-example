import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'cluster-points',
  title: '海量点聚合',
  category: '点标注',
  description: '对大量 POI 点数据启用自动聚合（Cluster），自定义聚合气泡样式，随缩放级别动态展开/收缩。',
  tags: ['聚合', '海量点', 'POI'],
  level: 'medium',
  files: {
    'main.ts': `// 海量点聚合示例：Entity Clustering 自动聚合
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

// ── 创建大量 POI 点数据 ────────────────────────────
// 使用 Entity DataSource 进行聚合
const dataSource = new Cesium.EntityDataSource()
const poiCategories = [
  { name: '餐饮', color: Cesium.Color.RED, count: 200 },
  { name: '购物', color: Cesium.Color.BLUE, count: 150 },
  { name: '住宿', color: Cesium.Color.GREEN, count: 100 },
  { name: '景点', color: Cesium.Color.ORANGE, count: 80 },
  { name: '交通', color: Cesium.Color.PURPLE, count: 120 },
]

let totalPois = 0

poiCategories.forEach((category) => {
  for (let i = 0; i < category.count; i++) {
    const lon = 116.2 + Math.random() * 0.8  // 北京范围
    const lat = 39.8 + Math.random() * 0.5
    const entity = dataSource.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lon, lat),
      point: {
        pixelSize: 8,
        color: category.color,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 1,
      },
      properties: {
        category: category.name,
        name: \`\${category.name}-\${i}\`,
      },
    })
    totalPois++
  }
})

dataSource.clustering.enabled = true
dataSource.clustering.clusterEvent.addEventListener((entities: Cesium.Entity[], cluster: Cesium.Cluster) => {
  // ── 自定义聚合样式 ──────────────────────────────
  const count = entities.length
  
  // 根据聚合数量动态调整样式
  let radius = 40
  let fontSize = 14
  let bgColor = 'rgba(52, 152, 219, 0.9)'
  
  if (count > 100) {
    radius = 60
    fontSize = 18
    bgColor = 'rgba(231, 76, 60, 0.9)'
  } else if (count > 50) {
    radius = 50
    fontSize = 16
    bgColor = 'rgba(243, 156, 18, 0.9)'
  } else if (count > 20) {
    radius = 45
    fontSize = 15
    bgColor = 'rgba(46, 204, 113, 0.9)'
  }

  // Canvas 绘制聚合气泡
  const canvas = document.createElement('canvas')
  canvas.width = radius * 2
  canvas.height = radius * 2
  const ctx = canvas.getContext('2d')!

  // 外圈
  ctx.beginPath()
  ctx.arc(radius, radius, radius - 4, 0, Math.PI * 2)
  ctx.fillStyle = bgColor
  ctx.fill()
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 3
  ctx.stroke()

  // 中心文字
  ctx.fillStyle = 'white'
  ctx.font = \`bold \${fontSize}px sans-serif\`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(count.toString(), radius, radius)

  cluster.billboard = {
    image: canvas,
    width: radius * 2,
    height: radius * 2,
    verticalOrigin: Cesium.VerticalOrigin.CENTER,
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
  }

  cluster.label = {
    text: count > 999 ? '999+' : count.toString(),
    font: \`bold \${fontSize}px sans-serif\`,
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 2,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    verticalOrigin: Cesium.VerticalOrigin.CENTER,
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    pixelOffset: new Cesium.Cartesian2(0, 0),
  }
})

// ── 配置聚合参数 ──────────────────────────────────
dataSource.clustering.pixelRange = 60
dataSource.clustering.minimumClusterSize = 3

console.log(\`✅ 创建 \${totalPois} 个 POI 点数据\`)

// ── 加载数据源 ────────────────────────────────────
await viewer.dataSources.add(dataSource)

// ── 添加单个特殊标注（不参与聚合）─────────────────
viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(116.39, 39.9),
  billboard: {
    image: \`<svg width="60" height="75" viewBox="0 0 60 75" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 0C13.43 0 0 13.43 0 30c0 22.5 30 45 30 45s30-22.5 30-45C60 13.43 46.57 0 30 0z" fill="#e74c3c" stroke="white" stroke-width="3"/>
      <text x="30" y="38" text-anchor="middle" fill="white" font-size="14" font-weight="bold">北京</text>
    </svg>\`,
    width: 60,
    height: 75,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  },
  description: '北京市（不参与聚合）',
})
console.log('📍 添加北京标注（排除聚合）')

// ── 信息面板 ─────────────────────────────────────
const infoDiv = document.createElement('div')
infoDiv.style.position = 'absolute'
infoDiv.style.top = '10px'
infoDiv.style.left = '10px'
infoDiv.style.backgroundColor = 'rgba(0,0,0,0.7)'
infoDiv.style.color = '#fff'
infoDiv.style.padding = '12px 16px'
infoDiv.style.borderRadius = '8px'
infoDiv.style.fontSize = '13px'
infoDiv.style.zIndex = '100'
infoDiv.innerHTML = \`
  <div style="font-weight:bold;margin-bottom:8px;font-size:14px">📊 POI 点聚合信息</div>
  <div>总点数: <span id="total-count">\${totalPois}</span></div>
  <div>聚合半径: <span id="pixel-range">60</span> px</div>
  <div>最小聚合: <span id="min-cluster">3</span> 个</div>
  <div style="margin-top:8px;font-size:11px;color:#aaa">缩放地图观察聚合效果</div>
\`
container.appendChild(infoDiv)

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.4, 39.9, 200000),
  duration: 2,
})
console.log('💡 缩放地图可观察聚合/展开效果')
console.log('🔢 pixelRange 控制聚合半径，minimumClusterSize 控制最小聚合数')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['dataSource.clustering.enabled 开启聚合', 'clusterEvent 自定义聚合图标', 'Canvas 绘制动态聚合气泡', 'pixelRange 聚合半径控制'],
    points: ['minimumClusterSize 最小聚合数量', '聚合图标推荐用 Billboard', 'KDBush 空间索引加速大数据量'],
  },
}
