import type { ExampleMeta } from '../../types'

const czmlData = [
  { id: 'document', name: 'CZML Animation', version: '1.0' },
  {
    id: 'plane',
    name: 'Plane',
    position: {
      epoch: '2024-01-01T00:00:00Z',
      cartographicDegrees: [
        0, 116.39, 39.9, 5000,
        600, 116.50, 39.95, 6000,
        1200, 116.60, 39.85, 5500,
        1800, 116.55, 39.75, 4500,
        2400, 116.40, 39.80, 5000,
        3000, 116.30, 39.85, 5500,
        3600, 116.39, 39.9, 5000,
      ],
    },
    model: {
      gltf: 'https://raw.githubusercontent.com/CesiumGS/cesium/main/Apps/SampleData/models/GroundVehicle/GroundVehicle.glb',
      scale: 1.0,
    },
  },
]

export const meta: ExampleMeta = {
  id: 'czml-animation',
  title: 'CZML 时序动画',
  category: '矢量数据',
  description: '使用 CZML 格式描述随时间变化的地理要素，结合 Cesium 时间轴实现运动轨迹回放、属性插值动画。',
  tags: ['CZML', '时序', '动画'],
  level: 'medium',
  files: {
    'main.ts': `\
const czml = ${JSON.stringify(czmlData, null, 2)}

const viewer = new Cesium.Viewer(container, {
  baseLayerPicker: false, animation: true, timeline: true,
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

async function boot() {
  const dataSource = await Cesium.CzmlDataSource.load(czml)
  await viewer.dataSources.add(dataSource)
  await viewer.zoomTo(dataSource)
  console.log('CZML Animation loaded')
}

boot().catch((error) => console.error('CZML Animation failed:', error))
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['CzmlDataSource.load 加载 CZML', 'SampledPositionProperty 位置采样插值', 'viewer.clock 控制时间播放', 'VelocityOrientationProperty 自动朝向'],
    points: ['CZML 是 JSON 超集，支持时间窗口', 'interpolationAlgorithm 控制插值精度', 'multiplier 调节播放倍速'],
  },
}
