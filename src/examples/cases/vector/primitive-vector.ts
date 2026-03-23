import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'primitive-vector',
  title: 'Primitive 高性能渲染',
  category: '矢量数据',
  description: '使用底层 Primitive API 批量渲染数万个几何体，对比 Entity API 性能差异，掌握 InstancedRendering 技术。',
  tags: ['Primitive', '性能', '批量渲染'],
  level: 'hard',
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

const count = 1000
const centerLon = 116.39
const centerLat = 39.9
const spread = 0.1

const instances = []
for (let i = 0; i < count; i++) {
  const lon = centerLon + (Math.random() - 0.5) * spread * 2
  const lat = centerLat + (Math.random() - 0.5) * spread * 2
  const heading = Math.random() * Cesium.Math.TWO_PI
  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.BoxGeometry({
      dimensions: new Cesium.Cartesian3(100.0, 100.0, 200.0),
    }),
    modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
      Cesium.Cartesian3.fromDegrees(lon, lat, 100),
      new Cesium.HeadingPitchRoll(heading, 0, 0)
    ),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(
        Cesium.Color.fromRandom({ alpha: 0.8 })
      ),
    },
  })
  instances.push(instance)
}

const primitive = viewer.scene.primitives.add(
  new Cesium.Primitive({
    instances: instances,
    appearance: new Cesium.PerInstanceColorAppearance({
      closed: true,
      translucent: false,
    }),
  })
)

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(centerLon, centerLat, 5000),
  duration: 1.5,
})

console.log('Primitive Vector loaded with', count, 'instances')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['GeometryInstance + Primitive 批量渲染', 'InstancedRendering 减少 DrawCall', 'Appearance 自定义着色', 'allowPicking 关闭拾取提升性能'],
    points: ['Primitive 比 Entity 性能高 10x 以上', '共享 Appearance 可合并 DrawCall', 'PerInstanceColorAppearance 支持每实例着色'],
  },
}
