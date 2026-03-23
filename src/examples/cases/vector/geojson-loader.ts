import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'geojson-loader',
  title: 'GeoJSON 加载与样式',
  category: '矢量数据',
  description: '加载 GeoJSON 格式矢量数据，按属性字段动态设置颜色映射与图标样式，实现点击弹窗信息展示。',
  tags: ['GeoJSON', '矢量数据', '样式'],
  level: 'easy',
  files: {
    'main.ts': `// GeoJSON 加载与样式示例
// 演示加载 GeoJSON 数据并按属性动态设置样式

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

// ── 1. GeoJSON 数据源 ──────────────────────────────────────────
// 模拟中国部分城市的 GeoJSON 数据
const chinaCitiesGeoJSON = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.39, 39.9] }, properties: { name: '北京', population: 21540000, level: 1 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [121.47, 31.23] }, properties: { name: '上海', population: 24280000, level: 1 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [113.26, 23.13] }, properties: { name: '广州', population: 15300000, level: 2 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [104.06, 30.67] }, properties: { name: '成都', population: 13300000, level: 2 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.15, 30.28] }, properties: { name: '杭州', population: 10360000, level: 3 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [114.31, 30.52] }, properties: { name: '武汉', population: 8216000, level: 3 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [106.55, 29.57] }, properties: { name: '重庆', population: 8184000, level: 2 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [112.98, 28.19] }, properties: { name: '长沙', population: 6399000, level: 3 } },
  ]
}

// ── 2. 颜色映射函数 ────────────────────────────────────────────
function getColorByLevel(level: number): Cesium.Color {
  switch (level) {
    case 1: return Cesium.Color.RED
    case 2: return Cesium.Color.ORANGE
    case 3: return Cesium.Color.YELLOW
    default: return Cesium.Color.GRAY
  }
}

function getSizeByPopulation(pop: number): number {
  if (pop > 20000000) return 20
  if (pop > 10000000) return 16
  if (pop > 5000000) return 12
  return 8
}

// ── 3. 加载 GeoJSON 数据 ──────────────────────────────────────
const dataSource = new Cesium.GeoJsonDataSource()
const promise = dataSource.load(chinaCitiesGeoJSON, {
  stroke: Cesium.Color.HOSTILE,
  strokeWidth: 2,
  fill: Cesium.Color.RED.withAlpha(0.3),
  markerColor: Cesium.Color.PURPLE,
  markerSize: 10,
})

promise.then((ds) => {
  viewer.dataSources.add(ds)
  
  // ── 4. 自定义样式 ──────────────────────────────────────────
  const entities = ds.entities.values
  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]
    const props = entity.properties as any
    
    // 根据 level 设置颜色
    const color = getColorByLevel(props.level.getValue())
    const size = getSizeByPopulation(props.population.getValue())
    
    entity.point = {
      pixelSize: size,
      color: color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    }
    
    // 添加标签
    entity.label = {
      text: props.name.getValue(),
      font: 'bold 14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -16),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    }
    
    // 添加弹窗信息
    entity.description = \`
      <div style="padding: 10px;">
        <h3>\${props.name.getValue()}</h3>
        <p><b>人口:</b> \${props.population.getValue().toLocaleString()}</p>
        <p><b>等级:</b> \${props.level.getValue()} 级城市</p>
      </div>
    \`
  }
  
  console.log('📍 已加载', entities.length, '个城市坐标')
})

// ── 5. 加载线要素 GeoJSON ─────────────────────────────────────
// 模拟省级边界线
const provincesLine = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [116.39, 39.9], [121.47, 31.23], [113.26, 23.13], [104.06, 30.67], [116.39, 39.9]
        ]
      },
      properties: { name: '演示线路' }
    }
  ]
}

const lineDataSource = new Cesium.GeoJsonDataSource()
lineDataSource.load(provincesLine, {
  stroke: Cesium.Color.CYAN,
  strokeWidth: 3,
  fill: Cesium.Color.TRANSPARENT,
}).then((ds) => {
  viewer.dataSources.add(ds)
  console.log('📏 已加载线要素')
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(110, 32, 15000000),
  duration: 2,
})

console.log('💡 点击城市查看详细信息')
console.log('🎨 颜色: 红色=一线, 橙色=二线, 黄色=三线城市')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['GeoJsonDataSource.load 加载数据', '按属性字段条件着色', '点击实体显示 infoBox', 'entities.values 遍历要素'],
    points: ['DataSource 是批量实体的容器', 'styleFunction 实现属性驱动渲染', 'stroke/fill 控制边框与填充'],
  },
}
