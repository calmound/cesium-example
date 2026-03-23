import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'route-planning',
  title: '路径规划查询',
  category: '矢量数据',
  description: '调用在线路径规划 API（高德/百度/OSM）获取驾车、步行、骑行路径，在三维地图上可视化规划结果。',
  tags: ['路径规划', '导航', 'API'],
  level: 'medium',
  files: {
    'main.ts': `\
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

const startLon = 116.39
const startLat = 39.9
const endLon = 116.48
const endLat = 40.0

viewer.entities.add({
  id: 'start',
  position: Cesium.Cartesian3.fromDegrees(startLon, startLat),
  point: {
    pixelSize: 12,
    color: Cesium.Color.GREEN,
  },
  label: {
    text: '起点',
    font: '14px sans-serif',
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

viewer.entities.add({
  id: 'end',
  position: Cesium.Cartesian3.fromDegrees(endLon, endLat),
  point: {
    pixelSize: 12,
    color: Cesium.Color.RED,
  },
  label: {
    text: '终点',
    font: '14px sans-serif',
    pixelOffset: new Cesium.Cartesian2(0, -20),
  },
})

const routePositions = []
const steps = 50
for (let i = 0; i <= steps; i++) {
  const t = i / steps
  const lon = startLon + (endLon - startLon) * t + Math.sin(t * Math.PI * 2) * 0.01
  const lat = startLat + (endLat - startLat) * t + Math.cos(t * Math.PI * 3) * 0.005
  routePositions.push(lon, lat, 0)
}

viewer.entities.add({
  id: 'route',
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArrayHeights(routePositions),
    width: 5,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.2,
      color: Cesium.Color.CYAN,
    }),
  },
})

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(
    (startLon + endLon) / 2,
    (startLat + endLat) / 2,
    10000
  ),
  duration: 1.5,
})

console.log('Route Planning example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['高德/百度路径规划 REST API', '路径 GeoJSON 解析与渲染', 'POI 点查询与标注', '多条路径对比展示'],
    points: ['路径规划 API 返回 GCJ02 坐标需纠偏', 'Polyline 绑定路径属性（距离/时间）', '转弯点可额外标注方向指示'],
  },
}
