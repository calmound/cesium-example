import type { ExampleMeta } from '../../types'

export const meta: ExampleMeta = {
  id: 'polyline-basic',
  title: '折线基础',
  category: '线与路径',
  description: '绘制各类折线：普通折线、贴地折线、发光线、虚线、箭头线，对比 Entity 与 Primitive 两种渲染方式。',
  tags: ['折线', 'PolylineGraphics', 'Primitive'],
  level: 'easy',
  files: {
    'main.ts': `// 折线基础示例：Entity vs Primitive 渲染对比
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
viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0b1a2a')
viewer.scene.fog.enabled = false

const panel = document.createElement('div')
panel.style.cssText = [
  'position:absolute',
  'top:16px',
  'left:16px',
  'width:280px',
  'padding:14px 16px',
  'border-radius:14px',
  'background:linear-gradient(180deg, rgba(8,20,34,0.92), rgba(12,30,48,0.82))',
  'border:1px solid rgba(127,197,255,0.22)',
  'box-shadow:0 14px 32px rgba(0,0,0,0.28)',
  'backdrop-filter:blur(10px)',
  'color:#e7f7ff',
  'font:12px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  'pointer-events:none',
  'z-index:10',
].join(';')
panel.innerHTML = [
  '<div style="font-size:15px;font-weight:700;letter-spacing:0.02em;margin-bottom:8px">折线样式对比</div>',
  '<div style="opacity:0.78;margin-bottom:10px">左侧是 5 种常见 Entity 折线样式，右侧是一组使用 PolylineCollection 批量绘制的高性能航线。</div>',
  '<div style="display:grid;grid-template-columns:12px 1fr;gap:6px 10px">',
  '<span style="width:12px;height:12px;border-radius:999px;background:#ff6b6b"></span><span>普通折线</span>',
  '<span style="width:12px;height:12px;border-radius:999px;background:#4b93ff"></span><span>贴地折线</span>',
  '<span style="width:12px;height:12px;border-radius:999px;background:#45e0ff"></span><span>发光线</span>',
  '<span style="width:12px;height:12px;border-radius:999px;background:#ffd84d"></span><span>虚线</span>',
  '<span style="width:12px;height:12px;border-radius:999px;background:#7dff7a"></span><span>箭头线</span>',
  '</div>',
].join('')
container.appendChild(panel)

function addAnchor(lon, lat, height, color, text) {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat, height),
    point: {
      pixelSize: 9,
      color,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
    label: {
      text,
      font: '600 12px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK.withAlpha(0.7),
      outlineWidth: 3,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -18),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
    },
  })
}

// ── Part 1: Entity PolylineGraphics（适合少量折线）────

viewer.entities.add({
  name: '普通折线',
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      116.3, 39.9, 50000, 116.5, 39.9, 50000, 116.7, 40.1, 50000, 116.9, 40.0, 50000,
    ]),
    width: 3,
    material: Cesium.Color.RED,
  },
})
addAnchor(116.3, 39.9, 50000, Cesium.Color.fromCssColorString('#ff6b6b'), '普通折线')

viewer.entities.add({
  name: '贴地折线',
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArray([
      116.3, 39.7, 116.5, 39.6, 116.7, 39.7, 116.9, 39.5,
    ]),
    width: 4,
    material: Cesium.Color.BLUE,
    clampToGround: true,
  },
})
addAnchor(116.3, 39.7, 0, Cesium.Color.fromCssColorString('#4b93ff'), '贴地折线')

viewer.entities.add({
  name: '发光线',
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      116.2, 39.5, 30000, 116.4, 39.4, 30000, 116.6, 39.3, 30000,
    ]),
    width: 6,
    material: new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.4,
      color: Cesium.Color.CYAN,
    }),
  },
})
addAnchor(116.2, 39.5, 30000, Cesium.Color.fromCssColorString('#45e0ff'), '发光线')

viewer.entities.add({
  name: '虚线',
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      116.3, 39.3, 20000, 116.5, 39.2, 20000, 116.7, 39.1, 20000,
    ]),
    width: 3,
    material: new Cesium.PolylineDashMaterialProperty({
      dashLength: 16,
      color: Cesium.Color.YELLOW,
    }),
  },
})
addAnchor(116.3, 39.3, 20000, Cesium.Color.fromCssColorString('#ffd84d'), '虚线')

viewer.entities.add({
  name: '箭头线',
  polyline: {
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      116.3, 39.1, 40000, 116.5, 39.0, 40000, 116.7, 38.9, 40000,
    ]),
    width: 5,
    material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.LIME),
  },
})
addAnchor(116.3, 39.1, 40000, Cesium.Color.fromCssColorString('#7dff7a'), '箭头线')

console.log('左侧区域已展示 5 种基础折线样式：普通、贴地、发光、虚线、箭头。')

// ── Part 2: Primitive 高性能折线（适合大量折线）────
const primitiveLines = viewer.scene.primitives.add(new Cesium.PolylineCollection())
const primitiveHub = { lon: 117.45, lat: 39.35 }
const primitivePalette = [
  '#39d0ff',
  '#59f0c2',
  '#ffd166',
  '#ff8c69',
  '#c77dff',
]

const lineCount = 50
for (let i = 0; i < lineCount; i++) {
  const angle = (i / lineCount) * Math.PI * 1.6 - Math.PI * 0.8
  const radius = 0.45 + (i % 8) * 0.035
  const startLon = primitiveHub.lon + Math.cos(angle) * radius
  const startLat = primitiveHub.lat + Math.sin(angle) * radius * 0.7
  const endLon = primitiveHub.lon + Math.cos(angle) * (radius + 0.22)
  const endLat = primitiveHub.lat + Math.sin(angle) * (radius + 0.22) * 0.7
  const color = Cesium.Color.fromCssColorString(primitivePalette[i % primitivePalette.length]).withAlpha(0.78)
  const startHeight = 10000 + (i % 6) * 2500
  const endHeight = 18000 + (i % 10) * 2800

  primitiveLines.add({
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      startLon, startLat, startHeight,
      endLon, endLat, endHeight,
    ]),
    width: 1.5 + (i % 4) * 0.35,
    color,
  })
}

viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(primitiveHub.lon, primitiveHub.lat, 0),
  point: {
    pixelSize: 12,
    color: Cesium.Color.fromCssColorString('#ffffff'),
    outlineColor: Cesium.Color.fromCssColorString('#39d0ff'),
    outlineWidth: 3,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
  label: {
    text: '批量折线中心',
    font: '600 13px sans-serif',
    fillColor: Cesium.Color.WHITE,
    outlineColor: Cesium.Color.BLACK.withAlpha(0.8),
    outlineWidth: 3,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    pixelOffset: new Cesium.Cartesian2(0, -22),
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
  },
})

console.log(\`右侧区域已绘制 \${lineCount} 条 PolylineCollection 航线，用于演示批量折线的组织方式。\`)
console.log('建议把少量、需交互的线放在 Entity；把大量、强调性能的线放在 Primitive/Collection。')

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(116.95, 39.34, 240000),
  orientation: {
    heading: Cesium.Math.toRadians(15),
    pitch: Cesium.Math.toRadians(-36),
    roll: 0,
  },
  duration: 2,
})
`,
    'style.css': `.cesium-widget-credits { display: none !important; }
`,
  },
  guide: {
    features: ['PolylineGraphics 折线配置', 'PolylinePrimitive 高性能折线', '贴地折线 clampToGround', 'PolylineDash / PolylineGlow / PolylineArrow 材质'],
    points: ['大量折线改用 GeometryInstance + Primitive 批量渲染', 'clampToGround 只对地表有效', '箭头密度由 material.repeat 控制'],
  },
}
