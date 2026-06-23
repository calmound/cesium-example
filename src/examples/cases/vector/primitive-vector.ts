import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'primitive-vector',
  title: 'Primitive 高性能渲染',
  category: '矢量数据',
  description: '重构为 Entity 基线城区与 Primitive 批量城区对比案例，演示 GeometryInstance 分层合批、低 DrawCall 渲染与大规模建筑阵列组织方式。',
  tags: ['Primitive', '性能', 'GeometryInstance'],
  level: 'hard',
  files: {
    'main.ts': `// Primitive 高性能渲染：Entity 基线 vs Primitive 批量实例
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

viewer.scene.globe.enableLighting = true
viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#091521')
viewer.scene.skyAtmosphere.hueShift = -0.15
viewer.scene.skyAtmosphere.saturationShift = -0.45
viewer.scene.fog.enabled = false
viewer.scene.postProcessStages.fxaa.enabled = true

const panel = document.createElement('div')
panel.style.cssText = [
  'position:absolute',
  'top:16px',
  'left:16px',
  'width:320px',
  'padding:16px 18px',
  'border-radius:18px',
  'background:linear-gradient(180deg, rgba(7,17,29,0.95), rgba(9,27,45,0.84))',
  'border:1px solid rgba(109,194,255,0.24)',
  'box-shadow:0 18px 44px rgba(0,0,0,0.32)',
  'backdrop-filter:blur(14px)',
  'color:#ebf7ff',
  'font:12px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  'pointer-events:none',
  'z-index:10',
].join(';')
container.appendChild(panel)

function createSeededRandom(seed) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function metersToLongitudeDegrees(meters, latitude) {
  return meters / (111320 * Math.cos(Cesium.Math.toRadians(latitude)))
}

function metersToLatitudeDegrees(meters) {
  return meters / 110540
}

function gridOffset(index, count, columns, spacingMeters) {
  const rows = Math.ceil(count / columns)
  const row = Math.floor(index / columns)
  const column = index % columns
  return {
    x: (column - (columns - 1) / 2) * spacingMeters,
    y: (row - (rows - 1) / 2) * spacingMeters,
  }
}

function addDistrictLabel(lon, lat, title, subtitle, color) {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
    point: {
      pixelSize: 12,
      color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text: title + '\\n' + subtitle,
      font: '600 13px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK.withAlpha(0.72),
      outlineWidth: 4,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -24),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })
}

const baseCenter = { lon: 116.28, lat: 39.92 }
const primitiveCenter = { lon: 116.76, lat: 39.92 }
const entityCount = 180
const primitiveLayers = [
  { count: 3200, height: 90, footprint: 52, color: '#4dd7ff', alpha: 0.88, spacing: 82, columns: 80 },
  { count: 3200, height: 150, footprint: 42, color: '#35f2c7', alpha: 0.84, spacing: 82, columns: 80 },
  { count: 3200, height: 220, footprint: 34, color: '#ffd166', alpha: 0.82, spacing: 82, columns: 80 },
]

panel.innerHTML = [
  '<div style="font-size:15px;font-weight:700;letter-spacing:0.02em;margin-bottom:8px">Primitive 批量渲染对比</div>',
  '<div style="opacity:0.78;margin-bottom:12px">左侧保留少量 Entity 建筑，右侧使用 3 组 Primitive 分层合批渲染 9600 个实例，观察组织方式与性能取舍。</div>',
  '<div style="display:grid;grid-template-columns:96px 1fr;gap:4px 10px">',
  '<span style="opacity:0.66">Entity 基线</span><span>180 栋，可单体交互，适合业务对象</span>',
  '<span style="opacity:0.66">Primitive 集群</span><span>9600 栋，3 个 Primitive，低 DrawCall</span>',
  '<span style="opacity:0.66">实例着色</span><span>PerInstanceColorAppearance 按层级区分高度</span>',
  '<span style="opacity:0.66">建议</span><span>大量静态几何优先合批，交互对象再保留 Entity</span>',
  '</div>',
].join('')

viewer.entities.add({
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArray([
      116.52, 39.72,
      116.52, 40.11,
    ]),
    width: 2,
    material: Cesium.Color.fromCssColorString('#79c8ff').withAlpha(0.35),
    clampToGround: true,
  },
})

viewer.entities.suspendEvents()
const entityRandom = createSeededRandom(7)
for (let i = 0; i < entityCount; i++) {
  const offsetX = (i % 18) * 115 - 960
  const offsetY = Math.floor(i / 18) * 115 - 520
  const lon = baseCenter.lon + metersToLongitudeDegrees(offsetX, baseCenter.lat)
  const lat = baseCenter.lat + metersToLatitudeDegrees(offsetY)
  const height = 40 + (i % 6) * 18 + entityRandom() * 12

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat, height / 2),
    box: {
      dimensions: new Cesium.Cartesian3(62, 62, height),
      material: Cesium.Color.fromCssColorString('#f46d5f').withAlpha(0.72),
      outline: i % 9 === 0,
      outlineColor: Cesium.Color.WHITE.withAlpha(0.45),
    },
    properties: {
      district: 'entity-baseline',
      towerId: i,
    },
  })
}
viewer.entities.resumeEvents()

addDistrictLabel(
  baseCenter.lon,
  baseCenter.lat,
  'Entity 基线城区',
  '180 个对象，逐个维护与拾取',
  Cesium.Color.fromCssColorString('#f46d5f')
)

const primitiveCount = primitiveLayers.reduce((sum, layer) => sum + layer.count, 0)
primitiveLayers.forEach((layer, layerIndex) => {
  const random = createSeededRandom(100 + layerIndex)
  const geometry = new Cesium.BoxGeometry({
    vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
    dimensions: new Cesium.Cartesian3(layer.footprint, layer.footprint, layer.height),
  })
  const instances = []

  for (let i = 0; i < layer.count; i++) {
    const offset = gridOffset(i, layer.count, layer.columns, layer.spacing)
    const jitterX = (random() - 0.5) * 18
    const jitterY = (random() - 0.5) * 18
    const lon = primitiveCenter.lon + metersToLongitudeDegrees(offset.x + jitterX, primitiveCenter.lat)
    const lat = primitiveCenter.lat + metersToLatitudeDegrees(offset.y + jitterY)
    const heading = Cesium.Math.toRadians(Math.round(random() * 3) * 90)

    instances.push(new Cesium.GeometryInstance({
      geometry,
      modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
        Cesium.Cartesian3.fromDegrees(lon, lat, layer.height / 2),
        new Cesium.HeadingPitchRoll(heading, 0, 0)
      ),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString(layer.color).withAlpha(layer.alpha)
        ),
      },
    }))
  }

  viewer.scene.primitives.add(new Cesium.Primitive({
    geometryInstances: instances,
    appearance: new Cesium.PerInstanceColorAppearance({
      closed: true,
      translucent: layer.alpha < 1,
    }),
    allowPicking: false,
    asynchronous: true,
  })
  }))
})

addDistrictLabel(
  primitiveCenter.lon,
  primitiveCenter.lat,
  'Primitive 批量城区',
  '9600 个实例，按高度分 3 组 Primitive',
  Cesium.Color.fromCssColorString('#4dd7ff')
)

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.52, 39.91, 31000),
  orientation: {
    heading: Cesium.Math.toRadians(3),
    pitch: Cesium.Math.toRadians(-34),
    roll: 0,
  },
  duration: 2,
})

console.log('Entity 基线城区：', entityCount, '栋建筑，适合低数量、强交互对象')
console.log('Primitive 批量城区：', primitiveCount, '栋建筑，按 3 组 GeometryInstance 合批渲染')
console.log('性能建议：大批量静态几何优先使用 Primitive，关闭 allowPicking 可进一步降低开销')
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
.cesium-viewer-toolbar { top: 72px; right: 18px; }
`,
  },
  guide: {
    features: ['Entity 基线城区与 Primitive 城区对比', 'GeometryInstance 分层合批组织建筑集群', 'PerInstanceColorAppearance 每实例着色', 'allowPicking 关闭拾取降低批量开销'],
    points: ['大量静态几何尽量按材质/高度分组后一次性提交', 'Primitive 不适合频繁单体编辑，交互对象仍建议保留 Entity', 'DrawCall 数量通常比实例数量更值得优先关注'],
  },
}
