import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'wfs-query',
  title: '矢量服务查询（WFS）',
  category: '矢量数据',
  description: '对接 ArcGIS Server、GeoServer、iServer 的 WFS 矢量服务，按范围/属性条件查询要素并在地图上可视化。',
  tags: ['WFS', 'ArcGIS', 'GeoServer'],
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

const wfsUrl = 'https://ahocevar.com/geoserver/wfs'
const featureType = 'topp:states'

async function queryWfs() {
  const params = new URLSearchParams({
    service: 'WFS',
    version: '1.1.0',
    request: 'GetFeature',
    typeName: featureType,
    outputFormat: 'application/json',
    srsname: 'EPSG:4326',
  })

  const response = await fetch(wfsUrl + '?' + params.toString())
  const geojson = await response.json()

  const dataSource = await Cesium.GeoJsonDataSource.load(geojson, {
    stroke: Cesium.Color.HONEYDEW,
    fill: Cesium.Color.HONEYDEW.withAlpha(0.3),
    strokeWidth: 2,
  })
  viewer.dataSources.add(dataSource)
  await viewer.zoomTo(dataSource)
}

queryWfs().catch(err => console.error('WFS query failed:', err))

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(-98.0, 39.0, 5000000),
  duration: 1.5,
})

console.log('WFS Query example loaded')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['WFS GetFeature 请求构建', 'CQL_FILTER 属性条件过滤', 'BBOX 空间范围查询', 'ArcGIS REST API 要素查询'],
    points: ['WFS 返回 GeoJSON/GML 格式', 'ArcGIS 使用 FeatureServer 的 query 接口', 'iServer 的 getFeature 接口参数格式不同'],
  },
}
